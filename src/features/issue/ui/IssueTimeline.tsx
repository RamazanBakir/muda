"use client";

import { IssueTimelineItem } from "../model/types";
import { formatDistanceToNow, format } from "date-fns";
import * as dateLocales from "date-fns/locale";
import { Badge } from "@/shared/ui/badge";
import { UserRole } from "@/features/auth";
import { useTranslations, useLocale } from "next-intl";
import { Check, Clock, ShieldAlert, MessageSquare, History, User } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface IssueTimelineProps {
    timeline: IssueTimelineItem[];
    role?: UserRole; // Optional for filtering visibility
}

export function IssueTimeline({ timeline, role }: IssueTimelineProps) {
    const tt = useTranslations("timeline");
    const localeStr = useLocale();
    const dateLocale = localeStr === 'tr' ? dateLocales.tr : dateLocales.enUS;

    const filtered = timeline.filter(item => {
        if (!role || role === 'citizen') return !item.isInternal;
        return true;
    });

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-50 flex items-center gap-3">
                <History className="text-primary w-5 h-5" strokeWidth={3} />
                {tt('title')}
            </h3>

            <div className="relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-1 before:bg-gradient-to-b before:from-primary/20 before:via-border/50 before:to-transparent space-y-10">
                {filtered.map((item, index) => (
                    <div key={index} className="relative pl-14 group">
                        {/* Node */}
                        <div className={cn(
                            "absolute left-0 top-0.5 w-11 h-11 rounded-2xl flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-lg z-10 transition-transform group-hover:scale-110 group-hover:rotate-6",
                            item.isInternal ? 'bg-warning text-white shadow-warning/20' : 'bg-primary text-white shadow-primary/20'
                        )}>
                            {item.isInternal ? <ShieldAlert size={18} strokeWidth={3} /> : <Check size={18} strokeWidth={4} />}
                        </div>

                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-base font-black text-neutral-900 dark:text-neutral-50">
                                    {tt(`status.${item.status}`)}
                                </span>
                                {item.isInternal && (
                                    <Badge variant="warning" className="text-[10px] h-5 px-2 rounded-lg font-black uppercase tracking-widest border-2 border-warning/10">
                                        {tt('internal')}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-fg bg-surface-2 px-2.5 py-1 rounded-lg">
                                    <User size={10} strokeWidth={3} />
                                    {item.by}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-fg/60 uppercase tracking-widest">
                                    <Clock size={10} strokeWidth={3} />
                                    {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: dateLocale })}
                                </div>
                            </div>

                            {item.note && (
                                <div className={cn(
                                    "relative mt-3 p-5 rounded-3xl text-sm font-medium leading-relaxed border-2 transition-all",
                                    item.isInternal
                                        ? "bg-warning/5 border-warning/10 text-neutral-800 dark:text-neutral-200"
                                        : "bg-surface border-border/40 text-neutral-600 dark:text-neutral-400 shadow-sm"
                                )}>
                                    <MessageSquare size={14} className="absolute -top-1.5 -left-1.5 text-primary bg-white dark:bg-neutral-900 rounded-lg p-0.5" strokeWidth={3} />
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


