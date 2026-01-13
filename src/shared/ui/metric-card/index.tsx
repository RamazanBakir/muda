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
    default: { bg: "bg-[hsl(var(--neutral-2))]", text: "text-[hsl(var(--neutral-7))]", bar: "bg-[hsl(var(--neutral-6))]" },
    primary: { bg: "bg-[hsl(var(--blue-1))]", text: "text-[hsl(var(--blue-6))]", bar: "bg-[hsl(var(--blue-6))]" },
    success: { bg: "bg-[hsl(var(--green-1))]", text: "text-[hsl(var(--green-6))]", bar: "bg-[hsl(var(--green-6))]" },
    warning: { bg: "bg-[hsl(var(--amber-1))]", text: "text-[hsl(var(--amber-6))]", bar: "bg-[hsl(var(--amber-6))]" },
    danger: { bg: "bg-[hsl(var(--red-1))]", text: "text-[hsl(var(--red-6))]", bar: "bg-[hsl(var(--red-6))]" }
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
            "p-4 rounded-[var(--radius-lg)]",
            "border border-[hsl(var(--neutral-4))]",
            "shadow-[var(--shadow-soft)]",
            "space-y-3 transition-all duration-200",
            "hover:shadow-[var(--shadow-md)]",
            styles.bg,
            className
        )}>
            <div className="flex items-center justify-between">
                {icon && <span className={cn("w-5 h-5", styles.text)}>{icon}</span>}
                <span className="text-xs font-medium text-[hsl(var(--neutral-7))]">{label}</span>
            </div>

            <div className="flex items-end justify-between gap-2">
                <div className="text-2xl font-bold text-[hsl(var(--neutral-11))] leading-none">{value}</div>
                {trend && (
                    <div className={cn(
                        "text-xs font-medium",
                        trend.value >= 0 ? "text-[hsl(var(--green-6))]" : "text-[hsl(var(--red-6))]"
                    )}>
                        {trend.value >= 0 ? "+" : ""}{trend.value}%
                        {trend.label && <span className="text-[hsl(var(--neutral-7))] ml-1">{trend.label}</span>}
                    </div>
                )}
            </div>

            {progress !== undefined && (
                <div className="w-full h-1.5 bg-[hsl(var(--neutral-3))] rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-500", styles.bar)}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
            )}
        </div>
    );
}

