import { cn } from "@/shared/lib/cn";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-[var(--radius-sm)]",
                "bg-[hsl(var(--neutral-3))]",
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };
