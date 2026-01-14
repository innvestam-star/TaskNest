import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const Button = forwardRef(({
    className,
    variant = 'primary',
    size = 'default',
    isLoading,
    children,
    disabled,
    type = 'button',
    ...props
}, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95";

    const variants = {
        primary: "bg-brand-primary text-white hover:bg-brand-primaryHover shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]",
        secondary: "border border-brand-primary/20 bg-brand-surfaceHighlight text-brand-text-primary hover:bg-brand-primary/10",
        ghost: "text-brand-text-secondary hover:text-brand-text-primary hover:bg-white/5",
        link: "text-brand-primary hover:text-brand-primaryHover underline-offset-4 hover:underline"
    };

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-lg",
        icon: "h-10 w-10"
    };

    return (
        <button
            type={type}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            ref={ref}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
