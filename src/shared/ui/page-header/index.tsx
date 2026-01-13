import { cn } from "@/shared/lib/cn";
import { BaseProps } from "@/shared/lib/types";

interface PageHeaderProps extends BaseProps {
    title: string;
    description?: string | React.ReactNode;
    actions?: React.ReactNode;
}

export function PageHeader({ title, description, className, actions }: PageHeaderProps) {
    return (
        <div className={cn(
            "flex flex-col sm:flex-row sm:items-end justify-between gap-4",
            "mb-6 pb-4",
            "border-b border-[hsl(var(--neutral-3))]",
            className
        )}>
            <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-semibold text-[hsl(var(--neutral-11))]">
                    {title}
                </h1>
                {description && (
                    <div className="text-sm text-[hsl(var(--neutral-7))] max-w-xl">
                        {description}
                    </div>
                )}
            </div>
            {actions && (
                <div className="flex-shrink-0 flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
