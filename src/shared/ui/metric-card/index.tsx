import { cn } from "@/shared/lib/cn";
import { ReactNode } from "react";

export type MetricCardVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    variant?: MetricCardVariant;
    trend?: {
        value: number;
        label?: string;
    };
    progress?: number;
    className?: string;
}

const variantStyles: Record<MetricCardVariant, { bg: string; text: string; bar: string }> = {
    default: { bg: "bg-surface-2", text: "text-muted-fg", bar: "bg-muted-fg" },
    primary: { bg: "bg-secondary", text: "text-primary", bar: "bg-primary" },
    success: { bg: "bg-success/5", text: "text-success", bar: "bg-success" },
    warning: { bg: "bg-warning/5", text: "text-warning", bar: "bg-warning" },
    danger: { bg: "bg-danger/5", text: "text-danger", bar: "bg-danger" }
};

export function MetricCard({
    label,
    value,
    icon,
    variant = 'default',
    trend,
    progress,
    className
}: MetricCardProps) {
    const styles = variantStyles[variant];

    return (
        <div className={cn(
            "p-4 rounded-xl border border-border space-y-3 transition-all hover:shadow-md",
            styles.bg,
            className
        )}>
            <div className="flex items-center justify-between">
                {icon && <span className={cn("w-5 h-5", styles.text)}>{icon}</span>}
                <span className="text-xs font-medium text-muted-fg">{label}</span>
            </div>

            <div className="flex items-end justify-between gap-2">
                <div className="text-2xl font-bold text-fg leading-none">{value}</div>
                {trend && (
                    <div className={cn(
                        "text-xs font-medium",
                        trend.value >= 0 ? "text-success" : "text-danger"
                    )}>
                        {trend.value >= 0 ? "+" : ""}{trend.value}%
                        {trend.label && <span className="text-muted-fg ml-1">{trend.label}</span>}
                    </div>
                )}
            </div>

            {progress !== undefined && (
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500", styles.bar)}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
            )}
        </div>
    );
}

