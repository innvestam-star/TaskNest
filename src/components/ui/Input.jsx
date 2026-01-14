import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, type, error, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border border-white/10 bg-brand-surfaceHighlight px-3 py-2 text-sm text-brand-text-primary transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-brand-error focus-visible:ring-brand-error",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <span className="text-xs text-brand-error mt-1 ml-1 block">
                    {error}
                </span>
            )}
        </div>
    );
});

Input.displayName = "Input";

export { Input };
