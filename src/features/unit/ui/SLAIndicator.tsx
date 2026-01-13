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

    let status: "ok" | "warning" | "danger" = "ok";
    let text = `${hoursLeft}s kaldı`;

    if (hoursLeft < 0) {
        status = "danger";
        text = `${Math.abs(hoursLeft)}s gecikti`;
    } else if (hoursLeft < 4) {
        status = "warning";
    }

    const badgeStyles = {
        ok: "bg-success/10 text-success-fg border-success/20",
        warning: "bg-warning/10 text-warning-fg border-warning/20",
        danger: "bg-danger/10 text-danger-fg border-danger/20 animate-pulse"
    };

    return (
        <span className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium border",
            badgeStyles[status],
            className
        )}>
            <Clock className="w-3 h-3" />
            {!compact && text}
        </span>
    );
}
