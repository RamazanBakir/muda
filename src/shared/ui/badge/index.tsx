import * as React from "react"
import { cn } from "@/shared/lib/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        // Default: Blue primary
        default: cn(
            "bg-[hsl(var(--blue-6))] text-white"
        ),
        // Secondary: Soft blue
        secondary: cn(
            "bg-[hsl(var(--blue-1))] text-[hsl(var(--blue-9))]"
        ),
        // Destructive: Soft red
        destructive: cn(
            "bg-[hsl(var(--red-1))] text-[hsl(var(--red-9))]"
        ),
        // Success: Soft green
        success: cn(
            "bg-[hsl(var(--green-1))] text-[hsl(var(--green-9))]"
        ),
        // Warning: Soft amber
        warning: cn(
            "bg-[hsl(var(--amber-1))] text-[hsl(var(--amber-9))]"
        ),
        // Outline: Border only
        outline: cn(
            "border border-[hsl(var(--neutral-4))]",
            "bg-transparent text-[hsl(var(--neutral-8))]"
        ),
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full",
                "px-2.5 py-0.5",
                "text-xs font-medium",
                "transition-colors duration-150",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
