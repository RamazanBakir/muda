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
            primary: "bg-primary text-primary-fg shadow shadow-primary/20 hover:bg-primary-700 hover:shadow-lg active:scale-[0.98]",
            secondary: "bg-secondary text-secondary-fg hover:bg-primary-200 active:scale-[0.98]",
            outline: "border-2 border-border bg-surface text-fg hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98]",
            ghost: "text-muted-fg hover:bg-neutral-100/80 hover:text-fg",
            destructive: "bg-danger text-white shadow-sm hover:bg-danger/90 active:scale-[0.98]",
        }

        const sizes = {
            sm: "h-9 px-4 text-xs font-semibold rounded-sm",
            md: "h-11 px-6 text-sm font-semibold rounded-md",
            lg: "h-14 px-10 text-base font-bold rounded-lg",
            icon: "h-11 w-11 rounded-full",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
                    variants[variant],
                    sizes[size],
                    isLoading && "relative text-transparent transition-none hover:text-transparent",
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center text-current">
                        <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                <span className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
                    {children}
                </span>
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
