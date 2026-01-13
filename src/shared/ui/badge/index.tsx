import * as React from "react"
import { cn } from "@/shared/lib/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-primary text-primary-fg shadow-sm",
        secondary: "border-transparent bg-surface-2 text-secondary-fg",
        destructive: "border-transparent bg-danger text-white",
        success: "border-transparent bg-success/10 text-success font-bold",
        warning: "border-transparent bg-warning/15 text-warning font-bold",
        outline: "border-2 border-border text-muted-fg bg-surface",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
