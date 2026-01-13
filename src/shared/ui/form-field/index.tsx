import React from "react";
import { cn } from "@/shared/lib/cn";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
}

export function FormField({ label, error, hint, required, className, children, ...props }: FormFieldProps) {
    return (
        <div className={cn("space-y-1.5", className)} {...props}>
            {label && (
                <label className="text-sm font-medium text-[hsl(var(--neutral-9))] flex items-center gap-1">
                    {label}
                    {required && <span className="text-[hsl(var(--red-6))]">*</span>}
                </label>
            )}
            <div className="relative">
                {children}
            </div>
            {hint && !error && (
                <p className="text-xs text-[hsl(var(--neutral-6))]">{hint}</p>
            )}
            {error && (
                <p className="text-xs font-medium text-[hsl(var(--red-6))]">
                    {error}
                </p>
            )}
        </div>
    );
}
