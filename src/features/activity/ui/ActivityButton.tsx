"use client";

import { useSession } from "@/features/auth";
import { activityRepository, ActivityEvent } from "@/features/activity";
import { 
    getNotificationsForUser, 
    getUnreadCount 
} from "../lib/notificationService";
import { Button } from "@/shared/ui/button";
import { 
    Bell, 
    Check, 
    AlertCircle, 
    User, 
    Clock, 
    ArrowRight, 
    MessageSquare, 
    Zap 
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { formatDistanceToNow, Locale } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { cn } from "@/shared/lib/cn";
import { useLocale, useTranslations } from "next-intl";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATION STYLING HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getNotificationIcon(type: string) {
    switch (type) {
        case "status_change":
            return <Check size={12} />;
        case "assignment_change":
            return <User size={12} />;
        case "note_added":
            return <MessageSquare size={12} />;
        case "priority_change":
            return <Zap size={12} />;
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NotificationItemProps {
    notification: ActivityEvent;
    isUnread: boolean;
    dateLocale: Locale;
    onClick: () => void;
}

function NotificationItem({ notification, isUnread, dateLocale, onClick }: NotificationItemProps) {
    return (
        <button
            className={cn(
                "w-full text-left",
                "px-4 py-3",
                "hover:bg-[hsl(var(--neutral-2))]",
                "transition-colors duration-150",
                "focus:outline-none focus:bg-[hsl(var(--neutral-2))]",
                isUnread && "bg-[hsl(var(--blue-1)/0.5)]"
            )}
            onClick={onClick}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div className={cn(
                    "w-8 h-8 rounded-lg flex-shrink-0",
                    "flex items-center justify-center",
                    getNotificationColor(notification.type)
                )}>
                    {getNotificationIcon(notification.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                            "text-sm font-medium truncate",
                            "text-[hsl(var(--neutral-11))]"
                        )}>
                            {notification.issueTitle}
                        </p>
                        {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[hsl(var(--blue-6))] flex-shrink-0 mt-1.5" />
                        )}
                    </div>
                    <p className={cn(
                        "text-xs mt-0.5 line-clamp-2",
                        "text-[hsl(var(--neutral-7))]"
                    )}>
                        {notification.details}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-[hsl(var(--neutral-6))]">
                            {notification.actorName}
                        </span>
                        <span className="text-[10px] text-[hsl(var(--neutral-5))]">•</span>
                        <span className="text-[10px] text-[hsl(var(--neutral-6))] flex items-center gap-1">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(notification.timestamp), { 
                                addSuffix: true, 
                                locale: dateLocale 
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

interface NotificationEmptyStateProps {
    message: string;
}

function NotificationEmptyState({ message }: NotificationEmptyStateProps) {
    return (
        <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className={cn(
                "w-12 h-12 rounded-xl mb-3",
                "bg-[hsl(var(--neutral-2))]",
                "flex items-center justify-center"
            )}>
                <Bell size={20} className="text-[hsl(var(--neutral-5))]" />
            </div>
            <p className="text-sm text-[hsl(var(--neutral-7))]">
                {message}
            </p>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ActivityButton() {
    const { session } = useSession();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("notifications");
    
    const [notifications, setNotifications] = useState<ActivityEvent[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Load notifications based on user role
    const loadNotifications = useCallback(async () => {
        if (!session) return;
        
        // Get stored activities
        const storedActivities = await activityRepository.getAll();
        
        // Get filtered notifications for this user
        const filtered = getNotificationsForUser(session, storedActivities);
        
        setNotifications(filtered);
        setUnreadCount(getUnreadCount(filtered, session));
    }, [session]);

    useEffect(() => {
        loadNotifications();
        
        // Refresh periodically
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

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

    // Role-specific header subtitle
    const getRoleSubtitle = () => {
        switch (session.role) {
            case "muhtar":
                return session.neighborhoodId ? `${session.neighborhoodId} Mahallesi` : "";
            case "unit":
                return session.name || "";
            case "call_center":
                return t("allNotifications") || "Tüm Bildirimler";
            default:
                return "";
        }
    };

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
                    "px-4 py-3",
                    "border-b border-[hsl(var(--neutral-3))]",
                    "bg-[hsl(var(--neutral-1))]"
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-[hsl(var(--neutral-7))]" />
                            <div>
                                <h4 className="font-semibold text-sm text-[hsl(var(--neutral-11))]">
                                    {t("title")}
                                </h4>
                                {getRoleSubtitle() && (
                                    <p className="text-[10px] text-[hsl(var(--neutral-6))]">
                                        {getRoleSubtitle()}
                                    </p>
                                )}
                            </div>
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
                </div>
                
                {/* Notification List */}
                <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <NotificationEmptyState message={t("empty")} />
                    ) : (
                        <div className="divide-y divide-[hsl(var(--neutral-3))]">
                            {notifications.slice(0, 5).map((notification, index) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    isUnread={index < unreadCount}
                                    dateLocale={dateLocale}
                                    onClick={() => handleNotificationClick(notification.issueId)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                {notifications.length > 0 && (
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
