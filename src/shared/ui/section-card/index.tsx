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
            "bg-surface border border-border rounded-xl overflow-hidden",
            className
        )}>
            {title && (
                <div className="px-4 py-3 border-b border-border bg-surface-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">{title}</h3>
                    {headerAction}
                </div>
            )}
            <div className={cn(!noPadding && "p-4", contentClassName)}>
                {children}
            </div>
        </div>
    );
}

