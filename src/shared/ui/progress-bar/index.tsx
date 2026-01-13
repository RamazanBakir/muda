import { cn } from "@/shared/lib/cn";

export type ProgressBarVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';

interface ProgressBarProps {
    value: number;
    label?: string;
    subLabel?: string;
    variant?: ProgressBarVariant;
    size?: 'sm' | 'md' | 'lg';
    showLabels?: boolean;
    className?: string;
}

const barColors: Record<ProgressBarVariant, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary-fg",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-muted-fg"
};

const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
};

export function ProgressBar({
    value,
    label,
    subLabel,
    variant = 'primary',
    size = 'md',
    showLabels = true,
    className
}: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
        <div className={cn("space-y-2", className)}>
            {showLabels && (label || subLabel) && (
                <div className="flex justify-between text-xs font-medium items-end">
                    {label && <span className="text-fg">{label}</span>}
                    {subLabel && <span className="text-muted-fg">{subLabel}</span>}
                </div>
            )}
            <div className={cn("bg-surface-2 rounded-full overflow-hidden", sizes[size])}>
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        barColors[variant]
                    )}
                    style={{ width: `${clampedValue}%` }}
                    role="progressbar"
                    aria-valuenow={clampedValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
}

