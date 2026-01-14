"use client";

import { cn } from "@/shared/lib/cn";

interface ConfidenceMeterProps {
    value: number; // 0.0 - 1.0
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
}

export function ConfidenceMeter({ 
    value, 
    size = "md", 
    showLabel = true,
    className 
}: ConfidenceMeterProps) {
    const percentage = Math.round(value * 100);
    
    // Determine color based on confidence level
    const getColorClass = () => {
        if (value >= 0.8) return "bg-[hsl(var(--green-6))]";
        if (value >= 0.6) return "bg-[hsl(var(--blue-6))]";
        if (value >= 0.45) return "bg-[hsl(var(--amber-6))]";
        return "bg-[hsl(var(--red-6))]";
    };
    
    const getTextColorClass = () => {
        if (value >= 0.8) return "text-[hsl(var(--green-7))]";
        if (value >= 0.6) return "text-[hsl(var(--blue-7))]";
        if (value >= 0.45) return "text-[hsl(var(--amber-7))]";
        return "text-[hsl(var(--red-7))]";
    };
    
    const sizeClasses = {
        sm: "h-1 w-16",
        md: "h-1.5 w-24",
        lg: "h-2 w-32",
    };
    
    const labelSizeClasses = {
        sm: "text-[10px]",
        md: "text-xs",
        lg: "text-sm",
    };
    
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div 
                className={cn(
                    "relative rounded-full overflow-hidden bg-[hsl(var(--neutral-3))]",
                    sizeClasses[size]
                )}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Güvenirlik: %${percentage}`}
            >
                <div 
                    className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                        getColorClass()
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className={cn(
                    "font-semibold tabular-nums",
                    labelSizeClasses[size],
                    getTextColorClass()
                )}>
                    %{percentage}
                </span>
            )}
        </div>
    );
}

/**
 * Circular confidence indicator for compact display
 */
interface CircularConfidenceProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export function CircularConfidence({ 
    value, 
    size = 32, 
    strokeWidth = 3,
    className 
}: CircularConfidenceProps) {
    const percentage = Math.round(value * 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value * circumference);
    
    const getStrokeColor = () => {
        if (value >= 0.8) return "hsl(var(--green-6))";
        if (value >= 0.6) return "hsl(var(--blue-6))";
        if (value >= 0.45) return "hsl(var(--amber-6))";
        return "hsl(var(--red-6))";
    };
    
    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--neutral-3))"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getStrokeColor()}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <span 
                className="absolute text-[9px] font-bold tabular-nums text-[hsl(var(--neutral-9))]"
                aria-label={`%${percentage} güvenirlik`}
            >
                {percentage}
            </span>
        </div>
    );
}

