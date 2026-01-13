import * as React from "react"
import { cn } from "@/shared/lib/cn"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"
    size?: "sm" | "md" | "lg" | "icon"
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {

        const variants = {
            // Primary: Solid professional blue
            primary: cn(
                "bg-[hsl(var(--blue-6))] text-white",
                "shadow-[var(--shadow-soft)]",
                "hover:bg-[hsl(var(--blue-7))]",
                "active:bg-[hsl(var(--blue-8))]"
            ),
            // Secondary: Light blue surface
            secondary: cn(
                "bg-[hsl(var(--blue-1))] text-[hsl(var(--blue-9))]",
                "hover:bg-[hsl(var(--blue-2))]",
                "active:bg-[hsl(var(--blue-3))]"
            ),
            // Outline: Blue border
            outline: cn(
                "border border-[hsl(var(--neutral-4))] bg-[hsl(var(--surface))]",
                "text-[hsl(var(--neutral-11))]",
                "hover:border-[hsl(var(--blue-5))] hover:bg-[hsl(var(--blue-0))] hover:text-[hsl(var(--blue-7))]"
            ),
            // Ghost: Blue text, no background
            ghost: cn(
                "text-[hsl(var(--neutral-8))]",
                "hover:bg-[hsl(var(--blue-1))] hover:text-[hsl(var(--blue-7))]"
            ),
            // Destructive: Soft red
            destructive: cn(
                "bg-[hsl(var(--red-6))] text-white",
                "shadow-[var(--shadow-soft)]",
                "hover:bg-[hsl(var(--red-7))]",
                "active:bg-[hsl(var(--red-8))]"
            ),
        }

        const sizes = {
            sm: "h-8 px-3 text-sm font-medium rounded-[var(--radius-md)]",
            md: "h-10 px-4 text-sm font-medium rounded-[var(--radius-md)]",
            lg: "h-12 px-5 text-base font-medium rounded-[var(--radius-md)]",
            icon: "h-10 w-10 rounded-[var(--radius-md)]",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap",
                    "transition-colors duration-150 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--blue-6)/0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "cursor-pointer select-none",
                    variants[variant],
                    sizes[size],
                    isLoading && "relative text-transparent pointer-events-none",
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg 
                            className="h-4 w-4 animate-spin" 
                            style={{ color: variant === 'primary' || variant === 'destructive' ? 'white' : 'hsl(var(--blue-6))' }}
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                <span className={cn("flex items-center gap-2", isLoading && "invisible")}>
                    {children}
                </span>
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
