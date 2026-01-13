"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent } from "@/shared/ui/card";
import { useSession } from "@/features/auth";
import { activityRepository, ActivityEvent } from "@/features/activity";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/shared/ui/badge";
import { useRouter } from "next/navigation";
import { Check, Clock, User, AlertCircle, MessageSquare, History, ArrowUpRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export default function ActivityPage() {
    const { session } = useSession();
    const router = useRouter();
    const [activities, setActivities] = useState<ActivityEvent[]>([]);

    useEffect(() => {
        if (!session) return;
        const load = async () => {
            const all = await activityRepository.getAll();
            const filtered = all.filter(a => {
                if (session.role === 'citizen') return a.isPublic;
                if (session.role === 'unit') return a.unitId === session.unitId || !a.unitId;
                if (session.role === 'mukhtar') return a.neighborhoodId === session.neighborhoodId;
                return true;
            });
            setActivities(filtered);
        };
        load();
    }, [session]);

    if (!session) return null;

    // Group by Date
    const grouped = activities.reduce((acc, curr) => {
        const date = format(new Date(curr.timestamp), "d MMMM yyyy", { locale: tr });
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
    }, {} as Record<string, ActivityEvent[]>);

    return (
        <Container className="max-w-4xl space-y-12 pb-24 animate-in fade-in duration-700">
            <PageHeader
                title="Aktivite Merkezi"
                description="Bildirimler ve sistem güncellemeleri."
                actions={
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-fg bg-surface px-4 py-2 rounded-xl border-2 border-border shadow-sm">
                        <History size={14} className="text-primary" />
                        Canlı Akış
                    </div>
                }
            />

            <div className="relative before:absolute before:left-10 before:top-4 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-border before:via-border/40 before:to-transparent">
                {Object.entries(grouped).map(([date, items]) => (
                    <div key={date} className="relative mb-16">
                        <div className="sticky top-24 z-10 mb-10 ml-20">
                            <span className="bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900 border-4 border-white dark:border-neutral-900 px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl">
                                {date}
                            </span>
                        </div>

                        <div className="space-y-8">
                            {items.map((item) => (
                                <div key={item.id} className="relative pl-24 group">
                                    {/* Icon */}
                                    <div className={cn(
                                        "absolute left-[20px] top-4 w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl z-10 border-4 border-white dark:border-neutral-900 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                                        item.type === 'issue_created' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                                            item.type === 'status_change' ? 'bg-success text-white shadow-success/20' :
                                                item.type === 'assignment_change' ? 'bg-purple-500 text-white shadow-purple-500/20' :
                                                    item.type === 'priority_change' ? 'bg-warning text-white shadow-warning/20' :
                                                        'bg-neutral-500 text-white shadow-neutral-500/20'
                                    )}>
                                        {item.type === 'issue_created' && <AlertCircle className="w-5 h-5" strokeWidth={3} />}
                                        {item.type === 'status_change' && <Check className="w-5 h-5" strokeWidth={4} />}
                                        {item.type === 'assignment_change' && <User className="w-5 h-5" strokeWidth={3} />}
                                        {item.type === 'priority_change' && <AlertCircle className="w-5 h-5" strokeWidth={3} />}
                                        {item.type === 'note_added' && <MessageSquare className="w-5 h-5" strokeWidth={3} />}
                                    </div>

                                    {/* Card */}
                                    <Card
                                        className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-none bg-surface group-hover:-translate-y-1"
                                        onClick={() => router.push(`/issues/${item.issueId}`)}
                                    >
                                        <CardContent className="p-8 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center">
                                                        <User size={14} className="text-muted-fg" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-sm text-neutral-900 dark:text-neutral-50">{item.actorName}</div>
                                                        <div className="text-[10px] font-bold text-muted-fg uppercase tracking-widest">{item.actorRole}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-surface-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-fg opacity-80">
                                                    <Clock size={10} strokeWidth={3} />
                                                    {format(new Date(item.timestamp), "HH:mm")}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="inline-flex items-center gap-1.5 text-primary text-sm font-black uppercase tracking-wide">
                                                    {item.issueTitle}
                                                    <ArrowUpRight size={14} strokeWidth={3} />
                                                </div>
                                                <div className="text-base font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                    {item.details}
                                                </div>
                                            </div>

                                            {item.isPublic && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-success bg-success/5 px-2 py-1 rounded-lg w-fit">
                                                    <Check size={10} strokeWidth={4} />
                                                    Herkese Açık
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(grouped).length === 0 && (
                    <div className="pl-24 py-24 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-surface-2 flex items-center justify-center text-muted-fg/40 border-2 border-dashed border-border">
                            <History size={32} />
                        </div>
                        <div className="font-medium text-muted-fg italic">Henüz aktivite kaydı bulunmuyor.</div>
                    </div>
                )}
            </div>
        </Container>
    );
}

