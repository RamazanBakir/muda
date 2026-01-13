import * as React from "react"
import { cn } from "@/shared/lib/cn"
import { ChevronDown } from "lucide-react"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    className={cn(
                        "flex h-10 w-full appearance-none",
                        "rounded-[var(--radius-sm)]",
                        "border border-[hsl(var(--neutral-4))] bg-[hsl(var(--surface))]",
                        "pl-3 pr-9 py-2",
                        "text-sm text-[hsl(var(--neutral-11))]",
                        "transition-colors duration-150",
                        "cursor-pointer",
                        // Hover state
                        "hover:border-[hsl(var(--blue-5))]",
                        // Focus state - blue ring
                        "focus:outline-none focus:border-[hsl(var(--blue-6))]",
                        "focus:ring-2 focus:ring-[hsl(var(--blue-6)/0.15)]",
                        // Disabled state
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--neutral-2))]",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--neutral-6))]">
                    <ChevronDown className="h-4 w-4" />
                </span>
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }
