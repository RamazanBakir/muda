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

type ActivityType = 'issue_created' | 'status_change' | 'assignment_change' | 'priority_change' | 'note_added';

function getActivityIcon(type: ActivityType) {
    const icons = {
        issue_created: <AlertCircle className="w-4 h-4" />,
        status_change: <Check className="w-4 h-4" />,
        assignment_change: <User className="w-4 h-4" />,
        priority_change: <AlertCircle className="w-4 h-4" />,
        note_added: <MessageSquare className="w-4 h-4" />
    };
    return icons[type] || <AlertCircle className="w-4 h-4" />;
}

function getActivityStyle(type: ActivityType) {
    const styles = {
        issue_created: "bg-primary text-primary-fg",
        status_change: "bg-success text-surface",
        assignment_change: "bg-secondary-fg text-surface",
        priority_change: "bg-warning text-surface",
        note_added: "bg-muted-fg text-surface"
    };
    return styles[type] || "bg-muted-fg text-surface";
}

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

    const grouped = activities.reduce((acc, curr) => {
        const date = format(new Date(curr.timestamp), "d MMMM yyyy", { locale: tr });
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
    }, {} as Record<string, ActivityEvent[]>);

    return (
        <Container className="max-w-3xl space-y-8 pb-16 animate-in fade-in duration-500">
            <PageHeader
                title="Aktivite Merkezi"
                description="Bildirimler ve sistem güncellemeleri."
                actions={
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-fg bg-surface px-3 py-1.5 rounded-lg border border-border">
                        <History size={14} className="text-primary" />
                        Canlı Akış
                    </div>
                }
            />

            <div className="relative before:absolute before:left-5 before:top-4 before:bottom-0 before:w-px before:bg-border">
                {Object.entries(grouped).map(([date, items]) => (
                    <div key={date} className="relative mb-10">
                        <div className="sticky top-20 z-10 mb-6 ml-12">
                            <span className="bg-fg text-surface px-4 py-1.5 rounded-full text-xs font-semibold shadow-md">
                                {date}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="relative pl-14 group">
                                    <div className={cn(
                                        "absolute left-2 top-4 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm z-10 transition-all duration-200 group-hover:scale-110",
                                        getActivityStyle(item.type as ActivityType)
                                    )}>
                                        {getActivityIcon(item.type as ActivityType)}
                                    </div>

                                    <Card
                                        className="hover:shadow-md transition-all duration-300 cursor-pointer group-hover:-translate-y-0.5"
                                        onClick={() => router.push(`/issues/${item.issueId}`)}
                                    >
                                        <CardContent className="p-4 flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center">
                                                        <User size={12} className="text-muted-fg" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm text-fg">{item.actorName}</div>
                                                        <div className="text-xs text-muted-fg">{item.actorRole}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-fg">
                                                    <Clock size={12} />
                                                    {format(new Date(item.timestamp), "HH:mm")}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                                                    {item.issueTitle}
                                                    <ArrowUpRight size={12} />
                                                </div>
                                                <div className="text-sm text-muted-fg leading-relaxed">
                                                    {item.details}
                                                </div>
                                            </div>

                                            {item.isPublic && (
                                                <div className="flex items-center gap-1 text-xs font-medium text-success bg-success/5 px-2 py-1 rounded w-fit">
                                                    <Check size={12} />
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
                    <div className="pl-14 py-16 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-muted-fg border border-dashed border-border">
                            <History size={24} />
                        </div>
                        <div className="text-sm text-muted-fg">Henüz aktivite kaydı bulunmuyor.</div>
                    </div>
                )}
            </div>
        </Container>
    );
}

