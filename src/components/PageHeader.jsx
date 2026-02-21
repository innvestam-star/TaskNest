import React from 'react';
import { Menu } from 'lucide-react';

const PageHeader = ({
    title,
    subtitle,
    children,
    icon: Icon,
    iconClassName = "bg-primary text-white",
    iconStyle = {}
}) => {
    return (
        <header className="bg-surface/80 backdrop-blur-xl border-b border-border/50 h-20 flex items-center justify-between px-8 md:px-12 shrink-0 z-40 transition-all duration-500 sticky top-0">
            <div className="flex items-center gap-6">
                <div className="md:hidden">
                    <button className="p-2.5 text-slate-400 hover:bg-slate-900 rounded-xl transition-all">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {Icon && (
                        <div
                            className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 ${iconClassName}`}
                            style={iconStyle}
                        >
                            {typeof Icon === 'function' ? <Icon className="w-6 h-6" /> : Icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-black text-text-main tracking-tighter leading-none mb-1">{title}</h1>
                        {subtitle && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-80">{subtitle}</p>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {children}
            </div>
        </header>
    );
};

export default PageHeader;
