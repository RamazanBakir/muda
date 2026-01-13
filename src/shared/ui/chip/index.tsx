import { cn } from "@/shared/lib/cn";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
}

export function Chip({ className, active, children, ...props }: ChipProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-xl border-2 px-5 py-2.5 text-sm font-bold tracking-tight transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-40 cursor-pointer",
                active
                    ? "border-primary bg-primary text-primary-fg shadow-lg shadow-primary/20 translate-y-[-1px]"
                    : "border-border bg-surface text-muted-fg hover:border-neutral-300 hover:text-neutral-700 hover:bg-neutral-50 shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

