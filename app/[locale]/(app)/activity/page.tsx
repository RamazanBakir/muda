"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent } from "@/shared/ui/card";
import { useSession } from "@/features/auth";
import { activityRepository, ActivityEvent } from "@/features/activity";
import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useRouter } from "@/navigation";
import { Check, Clock, User, AlertCircle, MessageSquare, History, ArrowUpRight, Bell, Zap } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useTranslations, useLocale } from "next-intl";
import { EmptyState } from "@/shared/ui/empty-state";

type ActivityType = 'issue_created' | 'status_change' | 'assignment_change' | 'priority_change' | 'note_added';

// Mock notifications for demo
const MOCK_ACTIVITIES: ActivityEvent[] = [
    {
        id: "mock-1",
        type: "status_change",
        issueId: "ISS-1007",
        issueTitle: "Su Borusu Patlaması",
        actorName: "Su ve Kanalizasyon Birimi",
        actorRole: "Birim",
        details: "Bildirim 'İşleme Alındı' durumuna güncellendi. Ekipler sahaya yönlendirildi.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        isPublic: true,
    },
    {
        id: "mock-2",
        type: "assignment_change",
        issueId: "ISS-1002",
        issueTitle: "Kaldırım Onarımı",
        actorName: "Çağrı Merkezi",
        actorRole: "Operatör",
        details: "Talep Yol Bakım ve Ulaşım Birimi'ne atandı.",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        isPublic: true,
    },
    {
        id: "mock-3",
        type: "note_added",
        issueId: "ISS-1005",
        issueTitle: "Park Aydınlatması",
        actorName: "Ahmet Yılmaz",
        actorRole: "Muhtar",
        details: "Mahalledeki diğer vatandaşlar da aynı sorunu bildirdi. Acil müdahale gerekiyor.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isPublic: true,
    },
    {
        id: "mock-4",
        type: "status_change",
        issueId: "ISS-1003",
        issueTitle: "Çöp Konteyner Talebi",
        actorName: "Temizlik İşleri",
        actorRole: "Birim",
        details: "Talep başarıyla çözüme kavuşturuldu. Yeni konteyner yerleştirildi.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        isPublic: true,
    },
    {
        id: "mock-5",
        type: "issue_created",
        issueId: "ISS-1010",
        issueTitle: "Trafik Işığı Arızası",
        actorName: "Vatandaş",
        actorRole: "Bildirim Sahibi",
        details: "Kavşaktaki trafik ışıkları çalışmıyor. Trafik akışı tehlikeli durumda.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        isPublic: true,
    },
    {
        id: "mock-6",
        type: "priority_change",
        issueId: "ISS-1008",
        issueTitle: "Yol Çökmesi",
        actorName: "AI Sistem",
        actorRole: "Otomatik",
        details: "Öncelik 'Yüksek' olarak güncellendi. Güvenlik riski tespit edildi.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isPublic: true,
    },
    {
        id: "mock-7",
        type: "assignment_change",
        issueId: "ISS-1006",
        issueTitle: "Ağaç Budama Talebi",
        actorName: "Park ve Bahçeler",
        actorRole: "Birim",
        details: "Talep Park ve Bahçeler Müdürlüğü'ne devredildi.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        isPublic: true,
    },
];

function getActivityIcon(type: ActivityType) {
    const icons = {
        issue_created: <AlertCircle className="w-4 h-4" />,
        status_change: <Check className="w-4 h-4" />,
        assignment_change: <User className="w-4 h-4" />,
        priority_change: <Zap className="w-4 h-4" />,
        note_added: <MessageSquare className="w-4 h-4" />
    };
    return icons[type] || <AlertCircle className="w-4 h-4" />;
}

function getActivityColor(type: ActivityType) {
    const styles = {
        issue_created: "bg-[hsl(var(--blue-6))]",
        status_change: "bg-[hsl(var(--green-6))]",
        assignment_change: "bg-[hsl(var(--purple-6))]",
        priority_change: "bg-[hsl(var(--amber-6))]",
        note_added: "bg-[hsl(var(--neutral-6))]"
    };
    return styles[type] || "bg-[hsl(var(--neutral-6))]";
}

export default function ActivityPage() {
    const { session } = useSession();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("activity");
    const [activities, setActivities] = useState<ActivityEvent[]>([]);

    useEffect(() => {
        if (!session) return;
        
        const load = async () => {
            const stored = await activityRepository.getAll();
            
            // Combine stored activities with mock data
            const combined = [...stored, ...MOCK_ACTIVITIES];
            
            const filtered = combined.filter(a => {
                if (session.role === 'citizen') return a.isPublic;
                if (session.role === 'unit') return a.unitId === session.unitId || !a.unitId;
                if (session.role === 'muhtar') return a.neighborhoodId === session.neighborhoodId;
                return true;
            });
            
            // Sort by timestamp
            filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            setActivities(filtered);
        };
        
        load();
    }, [session]);

    if (!session) return null;

    const dateLocale = locale === 'tr' ? tr : enUS;

    // Group activities by date
    const grouped = activities.reduce((acc, curr) => {
        const date = format(new Date(curr.timestamp), "d MMMM yyyy", { locale: dateLocale });
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
    }, {} as Record<string, ActivityEvent[]>);

    return (
        <Container className="max-w-3xl space-y-6 pb-16 animate-in fade-in duration-500">
            <PageHeader
                title={t("title")}
                description={t("description")}
                actions={
                    <div className={cn(
                        "flex items-center gap-2",
                        "px-3 py-1.5 rounded-lg",
                        "bg-[hsl(var(--green-1))]",
                        "border border-[hsl(var(--green-3))]",
                        "text-xs font-medium text-[hsl(var(--green-7))]"
                    )}>
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--green-6))] animate-pulse" />
                        {t("liveStream")}
                    </div>
                }
            />

            {/* Timeline */}
            <div className="relative">
                {/* Timeline line */}
                <div className={cn(
                    "absolute left-[19px] top-6 bottom-0 w-px",
                    "bg-gradient-to-b from-[hsl(var(--neutral-4))] to-transparent"
                )} />

                {Object.entries(grouped).map(([date, items]) => (
                    <div key={date} className="relative mb-8">
                        {/* Date Header */}
                        <div className="sticky top-16 z-10 mb-4 ml-11">
                            <span className={cn(
                                "inline-flex px-3 py-1 rounded-full",
                                "text-xs font-semibold",
                                "bg-[hsl(var(--neutral-11))] text-[hsl(var(--surface))]",
                                "shadow-md"
                            )}>
                                {date}
                            </span>
                        </div>

                        {/* Activity Items */}
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="relative pl-11 group">
                                    {/* Icon */}
                                    <div className={cn(
                                        "absolute left-0 top-3",
                                        "w-[38px] h-[38px] rounded-xl",
                                        "flex items-center justify-center",
                                        "text-white shadow-sm",
                                        "transition-transform duration-200",
                                        "group-hover:scale-110",
                                        getActivityColor(item.type as ActivityType)
                                    )}>
                                        {getActivityIcon(item.type as ActivityType)}
                                    </div>

                                    {/* Card */}
                                    <Card
                                        className={cn(
                                            "cursor-pointer",
                                            "border-[hsl(var(--neutral-4))]",
                                            "hover:border-[hsl(var(--blue-4))]",
                                            "hover:shadow-md",
                                            "transition-all duration-200",
                                            "group-hover:-translate-y-0.5"
                                        )}
                                        onClick={() => router.push(`/issues/${item.issueId}`)}
                                    >
                                        <CardContent className="p-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className={cn(
                                                        "w-7 h-7 rounded-full flex-shrink-0",
                                                        "bg-[hsl(var(--neutral-2))]",
                                                        "flex items-center justify-center"
                                                    )}>
                                                        <User size={12} className="text-[hsl(var(--neutral-7))]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-sm text-[hsl(var(--neutral-11))] truncate">
                                                            {item.actorName}
                                                        </div>
                                                        <div className="text-xs text-[hsl(var(--neutral-6))]">
                                                            {item.actorRole}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "flex items-center gap-1",
                                                    "text-[10px] text-[hsl(var(--neutral-6))]",
                                                    "flex-shrink-0"
                                                )}>
                                                    <Clock size={10} />
                                                    {format(new Date(item.timestamp), "HH:mm")}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="space-y-1.5">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1",
                                                    "text-sm font-medium",
                                                    "text-[hsl(var(--blue-7))]",
                                                    "hover:text-[hsl(var(--blue-8))]"
                                                )}>
                                                    {item.issueTitle}
                                                    <ArrowUpRight size={12} />
                                                </div>
                                                <p className={cn(
                                                    "text-sm leading-relaxed",
                                                    "text-[hsl(var(--neutral-8))]"
                                                )}>
                                                    {item.details}
                                                </p>
                                            </div>

                                            {/* Public Badge */}
                                            {item.isPublic && (
                                                <div className={cn(
                                                    "inline-flex items-center gap-1 mt-3",
                                                    "px-2 py-0.5 rounded",
                                                    "text-[10px] font-medium",
                                                    "bg-[hsl(var(--green-1))]",
                                                    "text-[hsl(var(--green-7))]"
                                                )}>
                                                    <Check size={10} />
                                                    {t("public")}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {Object.keys(grouped).length === 0 && (
                    <div className="py-16">
                        <EmptyState
                            icon={<History size={32} />}
                            title={t("empty")}
                            description=""
                        />
                    </div>
                )}
            </div>
        </Container>
    );
}
