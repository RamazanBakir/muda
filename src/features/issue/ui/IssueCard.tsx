"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/shared/ui/card";
import { Issue } from "../model/types";
import { cn } from "@/shared/lib/cn";
import { Link } from "@/navigation";
import { formatDistanceToNow } from "date-fns";
import * as dateLocales from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { StatusBadge, PriorityBadge } from "@/shared/ui/badge/status-badge";
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
                "hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col bg-surface border-border/50",
                className
            )}>
                <CardHeader className="p-6 pb-4 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-2 flex-wrap items-center">
                            <StatusBadge status={issue.status} showIcon />
                            <PriorityBadge priority={issue.priority} showIcon />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-surface-2 rounded-lg border border-border/50 text-neutral-400 group-hover:text-primary transition-colors">
                            <Hash size={10} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                {issue.id.split('-')[1]}
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <h3 className="font-bold text-lg leading-tight text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors line-clamp-2 pr-6">
                            {issue.title}
                        </h3>
                        <ArrowUpRight className="absolute top-0 right-0 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-primary" />
                    </div>
                </CardHeader>

                <CardContent className="p-6 py-0 flex-1">
                    <p className="text-sm text-muted-fg line-clamp-2 leading-relaxed font-medium">
                        {issue.description}
                    </p>

                    {issue.dueAt && (
                        <div className={cn(
                            "mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                            new Date(issue.dueAt) < new Date()
                                ? "bg-danger/10 text-danger border border-danger/20 animate-pulse"
                                : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                        )}>
                            <Clock size={12} strokeWidth={3} />
                            {formatDistanceToNow(new Date(issue.dueAt), { locale: dateLocale, addSuffix: true })}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-6 pt-5 text-[10px] font-bold uppercase tracking-widest text-muted-fg/60 flex items-center justify-between border-t border-border/30 mt-4 bg-muted/5 group-hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={12} strokeWidth={3} className="text-primary/60" />
                        <span className="truncate max-w-[140px] text-neutral-600">
                            {issue.location.neighborhood || t(`category.${issue.category}`)}
                        </span>
                    </div>
                    <span className="flex-shrink-0 opacity-80">
                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: dateLocale })}
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}


