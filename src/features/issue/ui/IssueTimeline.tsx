"use client";

import { IssueTimelineItem } from "../model/types";
import { formatDistanceToNow } from "date-fns";
import * as dateLocales from "date-fns/locale";
import { Badge } from "@/shared/ui/badge";
import { UserRole } from "@/features/auth";
import { useTranslations, useLocale } from "next-intl";
import { Check, Clock, ShieldAlert, MessageSquare, History, User } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface IssueTimelineProps {
    timeline: IssueTimelineItem[];
    role?: UserRole;
}

export function IssueTimeline({ timeline, role }: IssueTimelineProps) {
    const tt = useTranslations("timeline");
    const localeStr = useLocale();
    const dateLocale = localeStr === 'tr' ? dateLocales.tr : dateLocales.enUS;

    const filtered = timeline.filter(item => {
        if (!role || role === 'citizen') return !item.isInternal;
        return true;
    });

    if (filtered.length === 0) {
        return (
            <div className="text-center py-8 text-muted-fg text-sm">
                {tt('empty') || 'Henüz aktivite yok'}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                <History className="text-primary w-4 h-4" />
                {tt('title')}
            </h3>

            <div className="relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-border space-y-4">
                {filtered.map((item, index) => (
                    <div key={index} className="relative pl-10 group">
                        <div className={cn(
                            "absolute left-0 top-0.5 w-7 h-7 rounded-lg flex items-center justify-center z-10 transition-transform group-hover:scale-105",
                            item.isInternal
                                ? "bg-warning text-surface"
                                : "bg-primary text-primary-fg"
                        )}>
                            {item.isInternal
                                ? <ShieldAlert size={14} />
                                : <Check size={14} />
                            }
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-sm font-semibold text-fg">
                                    {tt(`status.${item.status}`)}
                                </span>
                                {item.isInternal && (
                                    <Badge variant="warning" className="text-xs h-5 px-1.5">
                                        {tt('internal')}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-fg">
                                <div className="flex items-center gap-1">
                                    <User size={10} />
                                    {item.by}
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Clock size={10} />
                                    {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: dateLocale })}
                                </div>
                            </div>

                            {item.note && (
                                <div className={cn(
                                    "mt-2 p-3 rounded-lg text-sm leading-relaxed border",
                                    item.isInternal
                                        ? "bg-warning/5 border-warning/20 text-fg"
                                        : "bg-surface-2 border-border text-muted-fg"
                                )}>
                                    <MessageSquare size={12} className="inline mr-1.5 text-primary" />
                                    {item.note}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
