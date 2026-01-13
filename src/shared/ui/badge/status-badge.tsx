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

const STATUS_CONFIG: Record<IssueStatus, { variant: "default" | "secondary" | "success" | "warning" | "outline", icon: React.ComponentType<{ className?: string }> }> = {
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
        <Badge variant={config.variant} className={cn("gap-1", className)}>
            {showIcon && <Icon className="w-3 h-3" />}
            {t(status)}
        </Badge>
    );
}

interface PriorityBadgeProps {
    priority: IssuePriority;
    className?: string;
    showIcon?: boolean;
}

const PRIORITY_CONFIG: Record<IssuePriority, { colorClasses: string, icon: React.ComponentType<{ className?: string }> }> = {
    high: { 
        colorClasses: "text-[hsl(var(--red-9))] bg-[hsl(var(--red-1))] border-[hsl(var(--red-3))]", 
        icon: AlertTriangle 
    },
    medium: { 
        colorClasses: "text-[hsl(var(--amber-9))] bg-[hsl(var(--amber-1))] border-[hsl(var(--amber-3))]", 
        icon: ArrowUpCircle 
    },
    low: { 
        colorClasses: "text-[hsl(var(--blue-9))] bg-[hsl(var(--blue-1))] border-[hsl(var(--blue-3))]", 
        icon: ArrowDownCircle 
    },
};

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
    const t = useTranslations("priority");
    const config = PRIORITY_CONFIG[priority];
    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center rounded-full border",
            "px-2.5 py-0.5",
            "text-xs font-medium",
            "gap-1",
            config.colorClasses,
            className
        )}>
            {showIcon && <Icon className="w-3 h-3" />}
            {t(priority)}
        </span>
    );
}
