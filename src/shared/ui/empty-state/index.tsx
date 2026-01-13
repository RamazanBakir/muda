"use client";

import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    className?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export function EmptyState({ title, description, className, icon, action }: EmptyStateProps) {
    const t = useTranslations("common");

    return (
        <div className={cn(
            "flex flex-col items-center justify-center",
            "p-8 md:p-12 text-center",
            className
        )}>
            {/* Icon Container - Blue accent */}
            <div className={cn(
                "flex h-14 w-14 items-center justify-center",
                "rounded-[var(--radius-lg)] mb-4",
                "bg-[hsl(var(--blue-1))]",
                "text-[hsl(var(--blue-6))]"
            )}>
                {icon || <Inbox size={28} strokeWidth={1.5} />}
            </div>

            <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-semibold text-[hsl(var(--neutral-11))]">
                    {title || t('empty')}
                </h3>
                {description && (
                    <p className="text-sm text-[hsl(var(--neutral-7))] leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );
}
