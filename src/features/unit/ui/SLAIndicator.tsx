import { differenceInHours, parseISO } from "date-fns";
import { cn } from "@/shared/lib/cn";
import { Clock } from "lucide-react";

interface SLAIndicatorProps {
    dueAt?: string;
    className?: string;
    compact?: boolean;
}

export function SLAIndicator({ dueAt, className, compact }: SLAIndicatorProps) {
    if (!dueAt) return null;

    const deadline = parseISO(dueAt);
    const hoursLeft = differenceInHours(deadline, new Date());

    // Determine status
    let status: "ok" | "warning" | "danger" = "ok";
    let text = `${hoursLeft}s kaldı`;

    if (hoursLeft < 0) {
        status = "danger";
        text = `${Math.abs(hoursLeft)}s gecikti`;
    } else if (hoursLeft < 4) {
        status = "warning";
    }

    const badgeClass = {
        ok: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        warning: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
        danger: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 animate-pulse"
    };

    return (
        <span className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold border uppercase tracking-wide",
            badgeClass[status],
            className
        )}>
            <Clock className="w-3 h-3" />
            {!compact && text}
        </span>
    );
}
