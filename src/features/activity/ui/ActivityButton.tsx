"use client";

import { useSession } from "@/features/auth";
import { activityRepository, ActivityEvent } from "@/features/activity";
import { Button } from "@/shared/ui/button";
import { Bell, Check, AlertCircle, User, Clock, ArrowRight, MessageSquare, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "@/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { cn } from "@/shared/lib/cn";
import { useLocale, useTranslations } from "next-intl";

// Mock notifications for demo purposes
const MOCK_NOTIFICATIONS: ActivityEvent[] = [
    {
        id: "mock-1",
        type: "status_change",
        issueId: "ISS-1007",
        issueTitle: "Su Borusu Patlaması",
        actorName: "Sistem",
        actorRole: "AI",
        details: "Bildiriminiz 'İşleme Alındı' durumuna güncellendi",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
        isPublic: true,
    },
    {
        id: "mock-2",
        type: "assignment_change",
        issueId: "ISS-1002",
        issueTitle: "Kaldırım Onarımı",
        actorName: "Yol Bakım Birimi",
        actorRole: "Birim",
        details: "Talebiniz ilgili birime atandı",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
        isPublic: true,
    },
    {
        id: "mock-3",
        type: "note_added",
        issueId: "ISS-1005",
        issueTitle: "Park Aydınlatması",
        actorName: "Ahmet Yılmaz",
        actorRole: "Muhtar",
        details: "Sorununuza yeni bir not eklendi",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        isPublic: true,
    },
    {
        id: "mock-4",
        type: "status_change",
        issueId: "ISS-1003",
        issueTitle: "Çöp Konteyner Talebi",
        actorName: "Temizlik İşleri",
        actorRole: "Birim",
        details: "Talebiniz çözüme kavuşturuldu ✓",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        isPublic: true,
    },
    {
        id: "mock-5",
        type: "issue_created",
        issueId: "ISS-1010",
        issueTitle: "Trafik Işığı Arızası",
        actorName: "Vatandaş",
        actorRole: "Bildirim",
        details: "Yeni bir bildirim oluşturuldu",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        isPublic: true,
    },
];

function getNotificationIcon(type: string) {
    switch (type) {
        case "status_change":
            return <Check size={12} />;
        case "assignment_change":
            return <User size={12} />;
        case "note_added":
            return <MessageSquare size={12} />;
        case "priority_change":
            return <AlertCircle size={12} />;
        default:
            return <Bell size={12} />;
    }
}

function getNotificationColor(type: string) {
    switch (type) {
        case "status_change":
            return "bg-[hsl(var(--green-6))] text-white";
        case "assignment_change":
            return "bg-[hsl(var(--blue-6))] text-white";
        case "note_added":
            return "bg-[hsl(var(--purple-6))] text-white";
        case "priority_change":
            return "bg-[hsl(var(--amber-6))] text-white";
        default:
            return "bg-[hsl(var(--neutral-6))] text-white";
    }
}

export function ActivityButton() {
    const { session } = useSession();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("notifications");
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!session) return;
        
        const load = async () => {
            const stored = await activityRepository.getAll();
            
            // Combine stored activities with mock notifications
            const combined = [...stored, ...MOCK_NOTIFICATIONS];
            
            // Filter by role scope
            const filtered = combined.filter(a => {
                if (session.role === 'citizen') return a.isPublic;
                if (session.role === 'unit') return a.unitId === session.unitId || !a.unitId;
                if (session.role === 'muhtar') return a.neighborhoodId === session.neighborhoodId;
                return true; // Call center sees all
            });
            
            // Sort by timestamp (newest first)
            filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            setActivities(filtered);
            // Mock: show 3 as unread for demo
            setUnreadCount(3);
        };
        
        load();
        const interval = setInterval(load, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [session]);

    if (!session) return null;

    const handleNotificationClick = (issueId: string) => {
        setIsOpen(false);
        router.push(`/issues/${issueId}`);
    };

    const handleViewAll = () => {
        setIsOpen(false);
        router.push('/activity');
    };

    const dateLocale = locale === 'tr' ? tr : enUS;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                        "relative group h-9 w-9",
                        "hover:bg-[hsl(var(--neutral-2))]",
                        "transition-colors duration-150"
                    )}
                >
                    <Bell className={cn(
                        "w-[18px] h-[18px]",
                        "text-[hsl(var(--neutral-7))]",
                        "group-hover:text-[hsl(var(--neutral-9))]",
                        "transition-colors"
                    )} />
                    {unreadCount > 0 && (
                        <span className={cn(
                            "absolute top-1 right-1",
                            "w-2 h-2 rounded-full",
                            "bg-[hsl(var(--red-6))]",
                            "ring-2 ring-[hsl(var(--surface))]",
                            "animate-pulse"
                        )} />
                    )}
                </Button>
            </PopoverTrigger>
            
            <PopoverContent 
                className={cn(
                    "w-[360px] p-0",
                    "border border-[hsl(var(--neutral-4))]",
                    "shadow-[var(--shadow-elevated)]"
                )} 
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className={cn(
                    "flex items-center justify-between",
                    "px-4 py-3",
                    "border-b border-[hsl(var(--neutral-3))]",
                    "bg-[hsl(var(--neutral-1))]"
                )}>
                    <div className="flex items-center gap-2">
                        <Bell size={16} className="text-[hsl(var(--neutral-7))]" />
                        <h4 className="font-semibold text-sm text-[hsl(var(--neutral-11))]">
                            {t("title")}
                        </h4>
                    </div>
                    {unreadCount > 0 && (
                        <span className={cn(
                            "px-2 py-0.5 rounded-full",
                            "text-[10px] font-medium",
                            "bg-[hsl(var(--blue-2))] text-[hsl(var(--blue-7))]"
                        )}>
                            {unreadCount} {t("new")}
                        </span>
                    )}
                </div>
                
                {/* Notification List */}
                <div className="max-h-[320px] overflow-y-auto">
                    {activities.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className={cn(
                                "w-12 h-12 rounded-xl mb-3",
                                "bg-[hsl(var(--neutral-2))]",
                                "flex items-center justify-center"
                            )}>
                                <Bell size={20} className="text-[hsl(var(--neutral-5))]" />
                            </div>
                            <p className="text-sm text-[hsl(var(--neutral-7))]">
                                {t("empty")}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[hsl(var(--neutral-3))]">
                            {activities.slice(0, 5).map((activity, index) => (
                                <button
                                    key={activity.id}
                                    className={cn(
                                        "w-full text-left",
                                        "px-4 py-3",
                                        "hover:bg-[hsl(var(--neutral-2))]",
                                        "transition-colors duration-150",
                                        "focus:outline-none focus:bg-[hsl(var(--neutral-2))]",
                                        // Unread indicator
                                        index < unreadCount && "bg-[hsl(var(--blue-1)/0.5)]"
                                    )}
                                    onClick={() => handleNotificationClick(activity.issueId)}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex-shrink-0",
                                            "flex items-center justify-center",
                                            getNotificationColor(activity.type)
                                        )}>
                                            {getNotificationIcon(activity.type)}
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    "text-[hsl(var(--neutral-11))]"
                                                )}>
                                                    {activity.issueTitle}
                                                </p>
                                                {index < unreadCount && (
                                                    <span className="w-2 h-2 rounded-full bg-[hsl(var(--blue-6))] flex-shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className={cn(
                                                "text-xs mt-0.5 line-clamp-2",
                                                "text-[hsl(var(--neutral-7))]"
                                            )}>
                                                {activity.details}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] text-[hsl(var(--neutral-6))]">
                                                    {activity.actorName}
                                                </span>
                                                <span className="text-[10px] text-[hsl(var(--neutral-5))]">•</span>
                                                <span className="text-[10px] text-[hsl(var(--neutral-6))] flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {formatDistanceToNow(new Date(activity.timestamp), { 
                                                        addSuffix: true, 
                                                        locale: dateLocale 
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                {activities.length > 0 && (
                    <div className={cn(
                        "px-3 py-2",
                        "border-t border-[hsl(var(--neutral-3))]",
                        "bg-[hsl(var(--neutral-1))]"
                    )}>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                                "w-full h-9",
                                "text-xs font-medium",
                                "text-[hsl(var(--blue-7))]",
                                "hover:text-[hsl(var(--blue-8))]",
                                "hover:bg-[hsl(var(--blue-1))]",
                                "flex items-center justify-center gap-1"
                            )}
                            onClick={handleViewAll}
                        >
                            {t("viewAll")}
                            <ArrowRight size={12} />
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
