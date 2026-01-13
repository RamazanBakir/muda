import { cn } from "@/shared/lib/cn";
import { ReactNode } from "react";

interface SectionCardProps {
    title?: string;
    headerAction?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    noPadding?: boolean;
}

export function SectionCard({
    title,
    headerAction,
    children,
    className,
    contentClassName,
    noPadding = false
}: SectionCardProps) {
    return (
        <div className={cn(
            "bg-[hsl(var(--surface))]",
            "border border-[hsl(var(--neutral-4))]",
            "rounded-[var(--radius-lg)]",
            "shadow-[var(--shadow-soft)]",
            "overflow-hidden",
            "transition-all duration-200",
            className
        )}>
            {title && (
                <div className="px-4 py-3 border-b border-[hsl(var(--neutral-3))] bg-[hsl(var(--neutral-1))] flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--neutral-7))]">{title}</h3>
                    {headerAction}
                </div>
            )}
            <div className={cn(!noPadding && "p-4", contentClassName)}>
                {children}
            </div>
        </div>
    );
}

