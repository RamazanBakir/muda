"use client";

import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

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
        <div className={cn("flex flex-col items-center justify-center p-12 md:p-24 text-center animate-in fade-in duration-700", className)}>
            <div className="flex h-32 w-32 items-center justify-center rounded-[40px] bg-surface-2 border-4 border-white dark:border-neutral-900 shadow-2xl mb-10 text-primary transition-transform hover:rotate-3">
                {icon || <Info size={48} strokeWidth={3} />}
            </div>

            <div className="space-y-4 max-w-xl">
                <h3 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
                    {title || t('empty')}
                </h3>
                {description && (
                    <p className="text-lg md:text-xl text-muted-fg leading-relaxed font-medium opacity-80">
                        {description}
                    </p>
                )}
            </div>

            {action && (
                <div className="mt-12 scale-110">
                    {action}
                </div>
            )}
        </div>
    );
}



