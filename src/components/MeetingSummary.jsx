import React, { useState } from 'react';
import {
    Sparkles, CheckCircle, AlertTriangle, HelpCircle,
    ChevronDown, ChevronUp, Plus, FileText, Download,
    Clock, User, Calendar
} from 'lucide-react';

/**
 * Meeting Summary Component
 * Displays AI-generated meeting analysis with action items, decisions, and risks
 */
export default function MeetingSummary({
    analysis,
    onCreateTask,
    onExportPDF,
    loading = false
}) {
    const [expandedSections, setExpandedSections] = useState({
        summary: true,
        actionItems: true,
        decisions: false,
        risks: false,
        questions: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Format timestamp
    const formatTimestamp = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Priority badge colors
    const priorityColors = {
        High: 'bg-red-100 text-red-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        Low: 'bg-green-100 text-green-700'
    };

    // Severity badge colors
    const severityColors = {
        High: 'bg-red-100 text-red-700',
        Medium: 'bg-orange-100 text-orange-700',
        Low: 'bg-blue-100 text-blue-700'
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Analyzing meeting transcript...</p>
                    <p className="text-gray-400 text-sm mt-1">Extracting insights with AI</p>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No analysis available</p>
                <p className="text-gray-400 text-sm mt-1">Generate a summary from your meeting transcript</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">AI Meeting Summary</h3>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {Math.round(analysis.overallConfidence * 100)}% confidence
                    </span>
                </div>

                {onExportPDF && (
                    <button
                        onClick={onExportPDF}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                )}
            </div>

            <div className="divide-y divide-gray-100">
                {/* Executive Summary */}
                <div>
                    <button
                        onClick={() => toggleSection('summary')}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-900">Executive Summary</span>
                        </div>
                        {expandedSections.summary ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {expandedSections.summary && analysis.summary && (
                        <div className="px-4 pb-4">
                            <ul className="space-y-2">
                                {analysis.summary.executiveSummary.map((bullet, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span className="text-gray-700">{bullet}</span>
                                    </li>
                                ))}
                            </ul>

                            {analysis.summary.topics && analysis.summary.topics.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {analysis.summary.topics.map((topic, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Items */}
                <div>
                    <button
                        onClick={() => toggleSection('actionItems')}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">Action Items</span>
                            <span className="text-sm text-gray-500">({analysis.actionItems?.length || 0})</span>
                        </div>
                        {expandedSections.actionItems ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {expandedSections.actionItems && analysis.actionItems && (
                        <div className="px-4 pb-4 space-y-3">
                            {analysis.actionItems.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No action items detected</p>
                            ) : (
                                analysis.actionItems.map((item) => (
                                    <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-gray-800 font-medium">{item.title}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[item.priority]}`}>
                                                        {item.priority}
                                                    </span>
                                                    {item.assignee && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <User className="w-3 h-3" />
                                                            {item.assignee}
                                                        </span>
                                                    )}
                                                    {item.dueDate && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Calendar className="w-3 h-3" />
                                                            {item.dueDate}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        [{formatTimestamp(item.timestamp)}]
                                                    </span>
                                                </div>
                                            </div>

                                            {onCreateTask && (
                                                <button
                                                    onClick={() => onCreateTask(item)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shrink-0"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Create Task
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Decisions */}
                {analysis.decisions && analysis.decisions.length > 0 && (
                    <div>
                        <button
                            onClick={() => toggleSection('decisions')}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-900">Key Decisions</span>
                                <span className="text-sm text-gray-500">({analysis.decisions.length})</span>
                            </div>
                            {expandedSections.decisions ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>

                        {expandedSections.decisions && (
                            <div className="px-4 pb-4 space-y-2">
                                {analysis.decisions.map((decision) => (
                                    <div key={decision.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-gray-700">{decision.text}</p>
                                            <span className="text-xs text-gray-400">[{formatTimestamp(decision.timestamp)}]</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Risks & Blockers */}
                {analysis.risks && analysis.risks.length > 0 && (
                    <div>
                        <button
                            onClick={() => toggleSection('risks')}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                <span className="font-medium text-gray-900">Risks & Blockers</span>
                                <span className="text-sm text-gray-500">({analysis.risks.length})</span>
                            </div>
                            {expandedSections.risks ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>

                        {expandedSections.risks && (
                            <div className="px-4 pb-4 space-y-2">
                                {analysis.risks.map((risk) => (
                                    <div key={risk.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                                        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${risk.severity === 'High' ? 'text-red-500' : 'text-orange-500'}`} />
                                        <div className="flex-1">
                                            <p className="text-gray-700">{risk.text}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[risk.severity]}`}>
                                                    {risk.severity} Risk
                                                </span>
                                                <span className="text-xs text-gray-400">[{formatTimestamp(risk.timestamp)}]</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Open Questions */}
                {analysis.questions && analysis.questions.length > 0 && (
                    <div>
                        <button
                            onClick={() => toggleSection('questions')}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-gray-900">Open Questions</span>
                                <span className="text-sm text-gray-500">({analysis.questions.length})</span>
                            </div>
                            {expandedSections.questions ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>

                        {expandedSections.questions && (
                            <div className="px-4 pb-4 space-y-2">
                                {analysis.questions.map((question) => (
                                    <div key={question.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                                        <HelpCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-gray-700">{question.text}</p>
                                            <span className="text-xs text-gray-400">[{formatTimestamp(question.timestamp)}]</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
