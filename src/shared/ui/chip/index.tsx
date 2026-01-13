import { cn } from "@/shared/lib/cn";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
}

export function Chip({ className, active, children, ...props }: ChipProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center",
                "rounded-full border px-3 py-1.5",
                "text-sm font-medium",
                "transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--blue-6)/0.4)]",
                "disabled:opacity-50 disabled:pointer-events-none",
                "cursor-pointer select-none",
                active
                    ? "border-[hsl(var(--blue-6))] bg-[hsl(var(--blue-6))] text-white"
                    : "border-[hsl(var(--neutral-4))] bg-[hsl(var(--surface))] text-[hsl(var(--neutral-8))] hover:border-[hsl(var(--blue-5))] hover:text-[hsl(var(--blue-7))]",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
