"use client";

import { Badge } from "@/shared/ui/badge";
import { IssueStatus, IssuePriority } from "@/features/issue/model/types";
import { cn } from "@/shared/lib/cn";
import { useTranslations } from "next-intl";
import {
    CheckCircle2,
    CircleDot,
    Clock,
    AlertCircle,
    AlertTriangle,
    ArrowUpCircle,
    ArrowDownCircle
} from "lucide-react";

interface StatusBadgeProps {
    status: IssueStatus;
    className?: string;
    showIcon?: boolean;
}

const STATUS_CONFIG: Record<IssueStatus, { variant: "default" | "secondary" | "success" | "warning" | "outline", icon: any }> = {
    created: { variant: "outline", icon: CircleDot },
    triaged: { variant: "secondary", icon: Clock },
    in_progress: { variant: "warning", icon: AlertCircle },
    resolved: { variant: "success", icon: CheckCircle2 },
};

export function StatusBadge({ status, className, showIcon = false }: StatusBadgeProps) {
    const t = useTranslations("status");
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.created;
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className={cn("gap-1.5", className)}>
            {showIcon && <Icon className="w-3.5 h-3.5" />}
            {t(status)}
        </Badge>
    );
}

interface PriorityBadgeProps {
    priority: IssuePriority;
    className?: string;
    showIcon?: boolean;
}

const PRIORITY_CONFIG: Record<IssuePriority, { color: string, icon: any }> = {
    high: { color: "text-danger bg-danger/10 border-danger/20", icon: AlertTriangle },
    medium: { color: "text-warning bg-warning/15 border-warning/20", icon: ArrowUpCircle },
    low: { color: "text-neutral-500 bg-neutral-100 border-neutral-200", icon: ArrowDownCircle },
};

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
    const t = useTranslations("priority");
    const config = PRIORITY_CONFIG[priority];
    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold transition-colors gap-1",
            config.color,
            className
        )}>
            {showIcon && <Icon className="w-3 h-3" />}
            {t(priority)}
        </span>
    );
}


