import { Bell, Search, User } from 'lucide-react';
import { Input } from '../ui/Input';

export default function Header({ toggleSidebar }) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-brand-dark/80 px-6 backdrop-blur-md border-b border-brand-primary/10 transition-all text-white">
            <div className="flex items-center gap-4 flex-1">
                <button onClick={toggleSidebar} className="block lg:hidden text-brand-text-secondary hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                </button>

                <div className="relative max-w-md w-full hidden sm:block">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-muted" />
                    <Input
                        type="search"
                        placeholder="Search tasks, projects..."
                        className="pl-9 h-9 bg-brand-surface border-brand-primary/20 focus:border-brand-primary text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative text-brand-text-secondary hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
                </button>

                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent p-[2px] cursor-pointer hover:shadow-glow transition-shadow">
                    <div className="h-full w-full rounded-full bg-brand-surface flex items-center justify-center">
                        <User size={16} className="text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
}
