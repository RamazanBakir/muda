"use client";

import { cn } from "@/shared/lib/cn";
import { Sparkles, CheckCircle2, User2 } from "lucide-react";

interface AIBadgeProps {
    confidence: number;
    decidedBy?: "ai" | "human";
    size?: "xs" | "sm" | "md";
    showIcon?: boolean;
    className?: string;
}

/**
 * Compact AI badge for lists and map popups
 */
export function AIBadge({ 
    confidence, 
    decidedBy = "ai",
    size = "sm", 
    showIcon = true,
    className 
}: AIBadgeProps) {
    const percentage = Math.round(confidence * 100);
    
    const getColorClasses = () => {
        if (decidedBy === "human") {
            return "bg-[hsl(var(--neutral-2))] text-[hsl(var(--neutral-8))] border-[hsl(var(--neutral-4))]";
        }
        if (confidence >= 0.8) {
            return "bg-[hsl(var(--green-1))] text-[hsl(var(--green-8))] border-[hsl(var(--green-3))]";
        }
        if (confidence >= 0.6) {
            return "bg-[hsl(var(--blue-1))] text-[hsl(var(--blue-8))] border-[hsl(var(--blue-3))]";
        }
        return "bg-[hsl(var(--amber-1))] text-[hsl(var(--amber-8))] border-[hsl(var(--amber-3))]";
    };
    
    const sizeClasses = {
        xs: "text-[9px] px-1 py-0.5 gap-0.5",
        sm: "text-[10px] px-1.5 py-0.5 gap-1",
        md: "text-xs px-2 py-1 gap-1.5",
    };
    
    const iconSizes = {
        xs: 8,
        sm: 10,
        md: 12,
    };
    
    const Icon = decidedBy === "human" ? User2 : Sparkles;
    
    return (
        <div className={cn(
            "inline-flex items-center font-semibold rounded border",
            "transition-colors duration-200",
            getColorClasses(),
            sizeClasses[size],
            className
        )}>
            {showIcon && <Icon size={iconSizes[size]} className="flex-shrink-0" />}
            <span className="tabular-nums">
                {decidedBy === "human" ? "Manuel" : `AI %${percentage}`}
            </span>
        </div>
    );
}

/**
 * AI status indicator with expanded info
 */
interface AIStatusProps {
    isEnabled: boolean;
    confidence?: number;
    decidedBy?: "ai" | "human";
    className?: string;
}

export function AIStatus({ isEnabled, confidence, decidedBy, className }: AIStatusProps) {
    if (!isEnabled) {
        return (
            <div className={cn(
                "inline-flex items-center gap-1 text-[10px] text-[hsl(var(--neutral-6))]",
                className
            )}>
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--neutral-5))]" />
                AI devre dışı
            </div>
        );
    }
    
    const StatusIcon = decidedBy === "human" ? CheckCircle2 : Sparkles;
    const statusText = decidedBy === "human" 
        ? "Manuel yönlendirme" 
        : `AI yönlendirdi (${confidence ? Math.round(confidence * 100) : 0}%)`;
    
    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 text-[10px]",
            decidedBy === "human" 
                ? "text-[hsl(var(--neutral-7))]" 
                : "text-[hsl(var(--blue-7))]",
            className
        )}>
            <StatusIcon size={10} />
            {statusText}
        </div>
    );
}

