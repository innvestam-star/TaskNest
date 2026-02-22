import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Camera, Loader2, AlertTriangle, Check, RotateCcw, Sparkles, ScanLine, FileImage, FileText, Archive } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
    EXPENSE_CATEGORIES, INCOME_CATEGORIES,
    suggestCategory, checkDuplicate, createTransaction, archiveReceipt
} from '../services/cashFlowService';
import { DEFAULT_CURRENCY } from '../utils/currency';

// Configure pdf.js worker using local bundled worker (Vite-compatible)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function SmartScan({ isOpen, onClose, onSuccess }) {
    const [phase, setPhase] = useState('upload'); // upload | scanning | review
    const [ocrImageData, setOcrImageData] = useState(null); // image data for OCR (rendered from PDF or original image)
    const [filePreview, setFilePreview] = useState(null); // preview display (image or PDF page render)
    const [originalFile, setOriginalFile] = useState(null); // original file reference
    const [originalFileData, setOriginalFileData] = useState(null); // base64 of original file for archive
    const [fileInfo, setFileInfo] = useState(null); // { name, type, size }
    const [isPdf, setIsPdf] = useState(false);
    const [pdfPageCount, setPdfPageCount] = useState(0);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [duplicates, setDuplicates] = useState([]);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);

    const [formData, setFormData] = useState({
        type: 'expense',
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: DEFAULT_CURRENCY,
        tax: 0,
        taxRate: 15,
        category: '',
        description: '',
    });

    const resetState = () => {
        setPhase('upload');
        setOcrImageData(null);
        setFilePreview(null);
        setOriginalFile(null);
        setOriginalFileData(null);
        setFileInfo(null);
        setIsPdf(false);
        setPdfPageCount(0);
        setScanProgress(0);
        setScanStatus('');
        setDragOver(false);
        setDuplicates([]);
        setSaving(false);
        setFormData({
            type: 'expense',
            vendor: '',
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            currency: DEFAULT_CURRENCY,
            tax: 0,
            taxRate: 15,
            category: '',
            description: '',
        });
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    // ─── File Handling (Images + PDFs) ───────────────────────────────────────

    const processFile = async (file) => {
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isPdfFile = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');

        if (!isImage && !isPdfFile) {
            alert('Please upload an image (JPG, PNG, WebP) or a PDF document.');
            return;
        }

        setFileInfo({ name: file.name, type: file.type, size: file.size });
        setOriginalFile(file);

        // Read original file as base64 for audit archive
        const reader = new FileReader();
        reader.onload = (e) => setOriginalFileData(e.target.result);
        reader.readAsDataURL(file);

        if (isPdfFile) {
            setIsPdf(true);
            await processPdf(file);
        } else {
            setIsPdf(false);
            const imgReader = new FileReader();
            imgReader.onload = (e) => {
                setFilePreview(e.target.result);
                setOcrImageData(e.target.result);
            };
            imgReader.readAsDataURL(file);
        }
    };

    const processPdf = async (file) => {
        try {
            setScanStatus('Loading PDF...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setPdfPageCount(pdf.numPages);

            // Render all pages and combine text for OCR
            const allCanvasImages = [];

            for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Process up to 5 pages
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // High-res for better OCR

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                await page.render({ canvasContext: ctx, viewport }).promise;
                allCanvasImages.push(canvas.toDataURL('image/png'));
            }

            // Use first page as preview
            setFilePreview(allCanvasImages[0]);

            // Combine pages into single tall image for OCR
            if (allCanvasImages.length === 1) {
                setOcrImageData(allCanvasImages[0]);
            } else {
                // Stitch pages vertically
                const images = await Promise.all(
                    allCanvasImages.map(src => {
                        return new Promise((resolve) => {
                            const img = new Image();
                            img.onload = () => resolve(img);
                            img.src = src;
                        });
                    })
                );

                const totalHeight = images.reduce((h, img) => h + img.height, 0);
                const maxWidth = Math.max(...images.map(img => img.width));
                const stitchCanvas = document.createElement('canvas');
                stitchCanvas.width = maxWidth;
                stitchCanvas.height = totalHeight;
                const ctx = stitchCanvas.getContext('2d');

                let y = 0;
                for (const img of images) {
                    ctx.drawImage(img, 0, y);
                    y += img.height;
                }
                setOcrImageData(stitchCanvas.toDataURL('image/png'));
            }

            setScanStatus('');
        } catch (error) {
            console.error('PDF processing error:', error);
            alert('Failed to process PDF. Please try a different file.');
            resetState();
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        processFile(file);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setDragOver(false), []);

    // ─── OCR Processing ──────────────────────────────────────────────────────

    const extractData = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        // Vendor: usually first meaningful line
        let vendor = '';
        for (const line of lines.slice(0, 5)) {
            const clean = line.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
            if (clean.length > 2 && clean.length < 60) {
                vendor = clean;
                break;
            }
        }

        // Date: look for common patterns
        let date = new Date().toISOString().split('T')[0];
        const datePatterns = [
            /(\d{4}[-/]\d{2}[-/]\d{2})/,
            /(\d{2}[-/]\d{2}[-/]\d{4})/,
            /(\d{2}[-/]\d{2}[-/]\d{2})/,
            /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
        ];
        for (const line of lines) {
            for (const pattern of datePatterns) {
                const match = line.match(pattern);
                if (match) {
                    try {
                        const parsed = new Date(match[1]);
                        if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2020) {
                            date = parsed.toISOString().split('T')[0];
                        }
                    } catch { /* skip */ }
                }
            }
        }

        // Amount: find the largest R/$ amount (likely the total)
        const amounts = [];
        const amountPatterns = [
            /(?:total|amount|due|balance|grand)[\s:]*[R$€£]?\s*([\d,]+\.?\d{0,2})/gi,
            /[R$€£]\s*([\d,]+\.\d{2})/g,
            /([\d,]+\.\d{2})/g,
        ];
        for (const line of lines) {
            for (const pattern of amountPatterns) {
                let match;
                while ((match = pattern.exec(line)) !== null) {
                    const val = parseFloat(match[1].replace(/,/g, ''));
                    if (val > 0 && val < 1000000) amounts.push(val);
                }
            }
        }
        const amount = amounts.length > 0 ? Math.max(...amounts) : 0;

        // Tax/VAT detection
        let tax = 0;
        const vatPatterns = [
            /(?:vat|tax|gst)[\s:]*[R$€£]?\s*([\d,]+\.?\d{0,2})/gi,
            /(?:vat|tax)\s*(?:\d+%?)[\s:]*[R$€£]?\s*([\d,]+\.?\d{0,2})/gi,
        ];
        for (const line of lines) {
            for (const pattern of vatPatterns) {
                const match = pattern.exec(line);
                if (match) {
                    tax = parseFloat(match[1].replace(/,/g, ''));
                }
            }
        }

        // Currency detection
        let currency = DEFAULT_CURRENCY;
        const fullText = text.toLowerCase();
        if (fullText.includes('$') && !fullText.includes('r')) currency = 'USD';
        else if (fullText.includes('€')) currency = 'EUR';
        else if (fullText.includes('£')) currency = 'GBP';

        // Category suggestion
        const category = suggestCategory(vendor) || 'other_expense';

        return { vendor, date, amount, tax, currency, category };
    };

    const startScan = async () => {
        if (!ocrImageData) return;
        setPhase('scanning');
        setScanProgress(0);
        setScanStatus('Initializing scanner...');

        try {
            const worker = await createWorker('eng', 1, {
                logger: (m) => {
                    if (m.progress) {
                        setScanProgress(Math.round(m.progress * 100));
                    }
                    if (m.status) {
                        const statusMap = {
                            'loading tesseract core': 'Loading OCR engine...',
                            'initializing tesseract': 'Preparing scanner...',
                            'loading language traineddata': 'Loading language data...',
                            'initializing api': 'Starting analysis...',
                            'recognizing text': 'Reading document text...',
                        };
                        setScanStatus(statusMap[m.status] || m.status);
                    }
                },
            });

            const { data } = await worker.recognize(ocrImageData);
            await worker.terminate();

            const extracted = extractData(data.text);

            setFormData(prev => ({
                ...prev,
                vendor: extracted.vendor,
                date: extracted.date,
                amount: extracted.amount,
                tax: extracted.tax || (extracted.amount * 0.15 / 1.15).toFixed(2),
                currency: extracted.currency,
                category: extracted.category,
                description: `Scanned ${isPdf ? 'document' : 'receipt'} — ${extracted.vendor}`,
            }));

            // Check for duplicates
            const dupes = await checkDuplicate(extracted.amount, extracted.date, extracted.vendor);
            setDuplicates(dupes);

            setPhase('review');
        } catch (error) {
            console.error('OCR Error:', error);
            setScanStatus('Scan failed. Please try again or enter manually.');
            setTimeout(() => setPhase('upload'), 2000);
        }
    };

    // ─── Save with Archive ───────────────────────────────────────────────────

    const handleSave = async () => {
        if (!formData.vendor || !formData.amount) return;
        setSaving(true);
        try {
            // Create transaction
            const txn = await createTransaction({
                ...formData,
                amount: parseFloat(formData.amount),
                tax: parseFloat(formData.tax || 0),
                taxRate: parseFloat(formData.taxRate || 15),
                receiptImage: filePreview, // thumbnail for quick view
                hasReceipt: true,
            });

            // Archive original document for audit trail
            if (originalFileData && fileInfo) {
                await archiveReceipt({
                    transactionId: txn.id,
                    fileName: fileInfo.name,
                    fileType: fileInfo.type,
                    fileSize: fileInfo.size,
                    fileData: originalFileData,
                });
            }

            onSuccess?.();
            handleClose();
        } catch (error) {
            console.error('Save error:', error);
        }
        setSaving(false);
    };

    if (!isOpen) return null;

    const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-primary/10 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <ScanLine className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-main tracking-tight">Smart Scan</h2>
                            <p className="text-xs text-text-muted">
                                {phase === 'upload' && 'Upload a receipt or invoice to auto-extract data'}
                                {phase === 'scanning' && 'Analyzing your document...'}
                                {phase === 'review' && 'Review extracted data before saving'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* ── Phase 1: Upload ────────────────────────────── */}
                    {phase === 'upload' && (
                        <div className="p-8">
                            {!filePreview ? (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-500 group
                                        ${dragOver
                                            ? 'border-primary bg-primary/5 scale-[1.02]'
                                            : 'border-border hover:border-primary/50 hover:bg-primary/5'
                                        }`}
                                >
                                    {/* Floating particles */}
                                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                                        <div className="absolute top-4 left-8 w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
                                        <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
                                        <div className="absolute bottom-8 left-1/4 w-2.5 h-2.5 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
                                        <div className="absolute bottom-16 right-1/4 w-1 h-1 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2s' }} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/10">
                                            <Upload className="w-9 h-9 text-primary/80" />
                                        </div>
                                        <h3 className="text-lg font-black text-text-main mb-2">
                                            {dragOver ? 'Drop your document here!' : 'Upload Receipt or Invoice'}
                                        </h3>
                                        <p className="text-sm text-text-muted mb-4">
                                            Drag & drop or click to browse
                                        </p>
                                        <div className="flex items-center justify-center gap-4 text-xs text-text-muted/60">
                                            <span className="flex items-center gap-1.5">
                                                <FileImage className="w-3.5 h-3.5" />
                                                JPG, PNG, WebP
                                            </span>
                                            <span className="text-border">|</span>
                                            <span className="flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5" />
                                                PDF Documents
                                            </span>
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,.pdf,application/pdf"
                                        onChange={(e) => processFile(e.target.files?.[0])}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* File Info Badge */}
                                    {fileInfo && (
                                        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                            {isPdf ? (
                                                <FileText className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <FileImage className="w-5 h-5 text-primary" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-text-main truncate">{fileInfo.name}</p>
                                                <p className="text-[10px] text-text-muted">
                                                    {formatFileSize(fileInfo.size)}
                                                    {isPdf && pdfPageCount > 0 && ` · ${pdfPageCount} page${pdfPageCount > 1 ? 's' : ''}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg">
                                                <Archive className="w-3 h-3 text-emerald-500" />
                                                <span className="text-[10px] font-bold text-emerald-600">Will be archived</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview */}
                                    <div className="relative rounded-2xl overflow-hidden border border-border bg-black/5">
                                        <img
                                            src={filePreview}
                                            alt="Document preview"
                                            className="w-full max-h-[400px] object-contain"
                                        />
                                        <button
                                            onClick={() => { resetState(); }}
                                            className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-xl hover:bg-black/80 transition-all"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        {isPdf && (
                                            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-red-500/90 rounded-lg flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-white" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider">PDF</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Scan Button */}
                                    <button
                                        onClick={startScan}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Scan {isPdf ? 'Document' : 'Receipt'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Phase 2: Scanning ───────────────────────────── */}
                    {phase === 'scanning' && (
                        <div className="p-12 text-center">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl animate-pulse shadow-2xl shadow-primary/40" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ScanLine className="w-10 h-10 text-white animate-bounce" />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-text-main mb-3">
                                Analyzing {isPdf ? 'Document' : 'Receipt'}
                            </h3>
                            <p className="text-sm text-text-muted mb-8">{scanStatus}</p>

                            {/* Progress bar */}
                            <div className="max-w-sm mx-auto">
                                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-300"
                                        style={{ width: `${scanProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-2 font-bold">{scanProgress}%</p>
                            </div>
                        </div>
                    )}

                    {/* ── Phase 3: Review ─────────────────────────────── */}
                    {phase === 'review' && (
                        <div className="p-6 space-y-5">

                            {/* Duplicate Warning */}
                            {duplicates.length > 0 && (
                                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-black text-amber-600">Possible Duplicate Detected</p>
                                        <p className="text-xs text-amber-600/80 mt-1">
                                            A transaction with the same amount ({formData.amount}) on a similar date already exists.
                                            Please review before saving.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* File Archive Notice */}
                            {fileInfo && (
                                <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <Archive className="w-5 h-5 text-emerald-500" />
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-emerald-600">
                                            {isPdf ? '📄 PDF' : '🖼️ Image'} will be archived for audit — {fileInfo.name}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Type Toggle */}
                            <div>
                                <label className="block text-xs font-black text-text-main uppercase tracking-widest mb-2">Type</label>
                                <div className="flex gap-2">
                                    {['expense', 'income'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setFormData({ ...formData, type: t, category: '' })}
                                            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${formData.type === t
                                                ? t === 'expense'
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                    : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                : 'bg-background border border-border text-text-muted hover:bg-primary/5'
                                                }`}
                                        >
                                            {t === 'expense' ? '↓ Expense' : '↑ Income'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Vendor */}
                            <div>
                                <label className="block text-xs font-black text-text-main uppercase tracking-widest mb-2">
                                    {formData.type === 'income' ? 'Source / Payer' : 'Vendor / Merchant'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.vendor}
                                    onChange={(e) => {
                                        const vendor = e.target.value;
                                        const suggested = suggestCategory(vendor);
                                        setFormData({
                                            ...formData,
                                            vendor,
                                            category: suggested || formData.category
                                        });
                                    }}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                                    placeholder="e.g. Pick n Pay, Uber, Shell..."
                                />
                            </div>

                            {/* Amount + Date Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-text-main uppercase tracking-widest mb-2">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-black text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-text-main uppercase tracking-widest mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                                    />
                                </div>
                            </div>

                            {/* Tax + Currency Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-text-main uppercase tracking-widest mb-2">Tax / VAT</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.tax}
                                        onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-text-main uppercase tracking-widest mb-2">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                                    >
                                        <option value="ZAR">ZAR — R</option>
                                        <option value="USD">USD — $</option>
                                        <option value="EUR">EUR — €</option>
                                        <option value="GBP">GBP — £</option>
                                    </select>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-black text-text-main uppercase tracking-widest mb-2">Category</label>
                                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${formData.category === cat.id
                                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                                : 'bg-background border border-border text-text-muted hover:bg-primary/5'
                                                }`}
                                        >
                                            <span>{cat.icon}</span>
                                            <span className="truncate">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-black text-text-main uppercase tracking-widest mb-2">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main font-medium"
                                    placeholder="Optional note..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer — Review phase buttons */}
                {phase === 'review' && (
                    <div className="p-6 bg-slate-950/20 backdrop-blur-md border-t border-border flex gap-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-6 py-4 border border-border text-text-main rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !formData.vendor || !formData.amount}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-primary/30 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Confirm & Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
