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
            "bg-surface border border-border rounded-xl p-4 space-y-4",
            className
        )}>
            <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">{title}</h3>
                {icon && <span className="text-muted-fg">{icon}</span>}
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

