"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/shared/ui/card";
import { Issue } from "../model/types";
import { cn } from "@/shared/lib/cn";
import { Link } from "@/navigation";
import { formatDistanceToNow } from "date-fns";
import * as dateLocales from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { StatusBadge, PriorityBadge } from "@/shared/ui/badge/status-badge";
import { AIBadge } from "@/features/ai/ui";
import { MapPin, Clock, Hash, ArrowUpRight } from "lucide-react";

interface IssueCardProps {
    issue: Issue;
    className?: string;
}

export function IssueCard({ issue, className }: IssueCardProps) {
    const t = useTranslations();
    const localeStr = useLocale();
    const dateLocale = localeStr === 'tr' ? dateLocales.tr : dateLocales.enUS;

    return (
        <Link href={`/issues/${issue.id}`} className="block group h-full">
            <Card className={cn(
                "h-full flex flex-col",
                "hover:border-[hsl(var(--blue-5))]",
                className
            )}>
                <CardHeader className="p-4 pb-3 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-1.5 flex-wrap items-center">
                            <StatusBadge status={issue.status} showIcon />
                            <PriorityBadge priority={issue.priority} showIcon />
                            {issue.ai && (
                                <AIBadge 
                                    confidence={issue.ai.overallConfidence} 
                                    decidedBy={issue.ai.finalDecision?.decidedBy}
                                    size="xs"
                                    showIcon={false}
                                />
                            )}
                        </div>
                        <div className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded",
                            "bg-[hsl(var(--neutral-2))]",
                            "text-[hsl(var(--neutral-6))]",
                            "group-hover:text-[hsl(var(--blue-6))]",
                            "transition-colors"
                        )}>
                            <Hash size={10} />
                            <span className="text-[10px] font-medium">
                                {issue.id.split('-')[1]}
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <h3 className={cn(
                            "font-medium text-base leading-snug line-clamp-2 pr-5",
                            "text-[hsl(var(--neutral-11))]",
                            "group-hover:text-[hsl(var(--blue-7))]",
                            "transition-colors"
                        )}>
                            {issue.title}
                        </h3>
                        <ArrowUpRight className={cn(
                            "absolute top-0 right-0 w-4 h-4",
                            "text-[hsl(var(--blue-6))]",
                            "opacity-0 group-hover:opacity-100",
                            "transition-opacity"
                        )} />
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 flex-1">
                    <p className="text-sm text-[hsl(var(--neutral-7))] line-clamp-2 leading-relaxed">
                        {issue.description}
                    </p>

                    {issue.dueAt && (
                        <div className={cn(
                            "mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded",
                            "text-xs font-medium",
                            new Date(issue.dueAt) < new Date()
                                ? "bg-[hsl(var(--red-1))] text-[hsl(var(--red-9))]"
                                : "bg-[hsl(var(--neutral-2))] text-[hsl(var(--neutral-7))]"
                        )}>
                            <Clock size={12} />
                            {formatDistanceToNow(new Date(issue.dueAt), { locale: dateLocale, addSuffix: true })}
                        </div>
                    )}
                </CardContent>

                <CardFooter className={cn(
                    "p-4 pt-3 text-xs text-[hsl(var(--neutral-7))]",
                    "flex items-center justify-between",
                    "border-t border-[hsl(var(--neutral-3))] mt-auto"
                )}>
                    <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={12} className="text-[hsl(var(--blue-6))]" />
                        <span className="truncate max-w-[120px]">
                            {issue.location.neighborhood || t(`category.${issue.category}`)}
                        </span>
                    </div>
                    <span className="flex-shrink-0">
                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: dateLocale })}
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}
