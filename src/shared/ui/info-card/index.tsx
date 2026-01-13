import { cn } from "@/shared/lib/cn";
import { ReactNode } from "react";

interface InfoCardProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function InfoCard({ title, icon, children, className }: InfoCardProps) {
    return (
        <div className={cn(
            "bg-[hsl(var(--surface))]",
            "border border-[hsl(var(--neutral-4))]",
            "rounded-[var(--radius-lg)]",
            "shadow-[var(--shadow-soft)]",
            "p-4 space-y-4",
            "transition-all duration-200",
            className
        )}>
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--neutral-3))]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--neutral-7))]">{title}</h3>
                {icon && <span className="text-[hsl(var(--neutral-6))]">{icon}</span>}
            </div>
            {children}
        </div>
    );
}

interface InfoRowProps {
    label: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function InfoRow({ label, icon, children, className }: InfoRowProps) {
    return (
        <div className={cn("space-y-1", className)}>
            <span className="block text-xs font-medium text-muted-fg">{label}</span>
            <div className="flex items-center gap-2 text-sm font-medium text-fg">
                {icon && <span className="text-primary">{icon}</span>}
                {children}
            </div>
        </div>
    );
}

