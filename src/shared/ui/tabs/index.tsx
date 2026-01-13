import * as React from "react"
import { cn } from "@/shared/lib/cn"

interface TabsProps {
    value: string
    onValueChange: (value: string) => void
    children: React.ReactNode
    className?: string
}

const TabsContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
} | null>(null)

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center gap-1",
                "rounded-[var(--radius-md)] p-1",
                "bg-[hsl(var(--neutral-2))]",
                className
            )}
        >
            {children}
        </div>
    )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

export function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")

    const isSelected = context.value === value

    return (
        <button
            type="button"
            onClick={() => context.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap",
                "rounded-[var(--radius-sm)] px-3 py-1.5",
                "text-sm font-medium",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--blue-6)/0.4)]",
                "disabled:pointer-events-none disabled:opacity-50",
                "cursor-pointer select-none",
                isSelected
                    ? "bg-[hsl(var(--surface))] text-[hsl(var(--blue-7))] shadow-sm"
                    : "text-[hsl(var(--neutral-7))] hover:text-[hsl(var(--neutral-9))]",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")

    if (context.value !== value) return null

    return (
        <div
            className={cn(
                "mt-3",
                "focus-visible:outline-none",
                className
            )}
        >
            {children}
        </div>
    )
}
