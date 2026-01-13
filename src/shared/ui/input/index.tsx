import * as React from "react"
import { cn } from "@/shared/lib/cn"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full",
                    "rounded-[var(--radius-sm)]",
                    "border border-[hsl(var(--neutral-4))] bg-[hsl(var(--surface))]",
                    "px-3 py-2",
                    "text-sm text-[hsl(var(--neutral-11))]",
                    "placeholder:text-[hsl(var(--neutral-6))]",
                    "transition-colors duration-150",
                    // Hover state
                    "hover:border-[hsl(var(--blue-5))]",
                    // Focus state - blue ring
                    "focus:outline-none focus:border-[hsl(var(--blue-6))]",
                    "focus:ring-2 focus:ring-[hsl(var(--blue-6)/0.15)]",
                    // File inputs
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[hsl(var(--blue-6))]",
                    // Disabled state
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--neutral-2))]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
