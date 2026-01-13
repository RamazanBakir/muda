import { cn } from "@/shared/lib/cn";
import { BaseProps } from "@/shared/lib/types";

interface PageHeaderProps extends BaseProps {
    title: string;
    description?: string | React.ReactNode;
    actions?: React.ReactNode;
}

export function PageHeader({ title, description, className, actions }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b-2 border-border/30", className)}>
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
                    {title}
                </h1>
                {description && (
                    <div className="text-base md:text-lg text-muted-fg max-w-2xl font-medium leading-relaxed text-balance opacity-90">
                        {description}
                    </div>
                )}
            </div>
            {actions && (
                <div className="flex-shrink-0 flex items-center gap-3 pb-1">
                    {actions}
                </div>
            )}
        </div>
    );
}
