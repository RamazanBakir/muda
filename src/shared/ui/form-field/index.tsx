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
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 px-0.5">
                    {label}
                    {required && <span className="text-danger">*</span>}
                </label>
            )}
            <div className="relative">
                {children}
            </div>
            {hint && !error && <p className="text-xs text-muted-fg px-1">{hint}</p>}
            {error && (
                <p className="text-sm font-medium text-danger px-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
}

