"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardContent } from "@/shared/ui/card";
import { useSession } from "@/features/auth";
import { activityRepository, ActivityEvent } from "@/features/activity";
import { getNotificationsForUser } from "@/features/activity/lib/notificationService";
import { useEffect, useState, useCallback } from "react";
import { format, formatDistanceToNow, Locale } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useRouter } from "@/navigation";
import { 
    Check, 
    Clock, 
    User, 
    AlertCircle, 
    MessageSquare, 
    History, 
    ArrowUpRight, 
    Zap,
    Building2,
    MapPin
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useTranslations, useLocale } from "next-intl";
import { EmptyState } from "@/shared/ui/empty-state";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLING HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ActivityType = 'issue_created' | 'status_change' | 'assignment_change' | 'priority_change' | 'note_added';

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUB-COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface RoleBadgeProps {
    role: string;
    neighborhoodId?: string;
    unitName?: string;
}

function RoleBadge({ role, neighborhoodId, unitName }: RoleBadgeProps) {
    const t = useTranslations("activity");
    
    const getRoleInfo = () => {
        switch (role) {
            case "muhtar":
                return {
                    icon: <MapPin size={12} />,
                    label: neighborhoodId ? `${neighborhoodId} Mahallesi` : t("neighborhoodScope"),
                    color: "bg-[hsl(var(--purple-1))] text-[hsl(var(--purple-7))] border-[hsl(var(--purple-3))]"
                };
            case "unit":
                return {
                    icon: <Building2 size={12} />,
                    label: unitName || t("unitScope"),
                    color: "bg-[hsl(var(--blue-1))] text-[hsl(var(--blue-7))] border-[hsl(var(--blue-3))]"
                };
            case "call_center":
                return {
                    icon: <History size={12} />,
                    label: t("allScope"),
                    color: "bg-[hsl(var(--green-1))] text-[hsl(var(--green-7))] border-[hsl(var(--green-3))]"
                };
            default:
                return null;
        }
    };

    const info = getRoleInfo();
    if (!info) return null;

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5",
            "px-3 py-1.5 rounded-lg",
            "text-xs font-medium border",
            info.color
        )}>
            {info.icon}
            {info.label}
        </div>
    );
}

interface ActivityCardProps {
    activity: ActivityEvent;
    dateLocale: Locale;
    onNavigate: (issueId: string) => void;
    showPublicBadge?: boolean;
}

function ActivityCard({ activity, dateLocale, onNavigate, showPublicBadge }: ActivityCardProps) {
    const t = useTranslations("activity");
    
    return (
        <div className="relative pl-11 group">
            {/* Icon */}
            <div className={cn(
                "absolute left-0 top-3",
                "w-[38px] h-[38px] rounded-xl",
                "flex items-center justify-center",
                "text-white shadow-sm",
                "transition-transform duration-200",
                "group-hover:scale-110",
                getActivityColor(activity.type as ActivityType)
            )}>
                {getActivityIcon(activity.type as ActivityType)}
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
                onClick={() => onNavigate(activity.issueId)}
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
                                    {activity.actorName}
                                </div>
                                <div className="text-xs text-[hsl(var(--neutral-6))]">
                                    {activity.actorRole}
                                </div>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1",
                            "text-[10px] text-[hsl(var(--neutral-6))]",
                            "flex-shrink-0"
                        )}>
                            <Clock size={10} />
                            {format(new Date(activity.timestamp), "HH:mm")}
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
                            {activity.issueTitle}
                            <ArrowUpRight size={12} />
                        </div>
                        <p className={cn(
                            "text-sm leading-relaxed",
                            "text-[hsl(var(--neutral-8))]"
                        )}>
                            {activity.details}
                        </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {/* Neighborhood Badge */}
                        {activity.neighborhoodId && (
                            <span className={cn(
                                "inline-flex items-center gap-1",
                                "px-2 py-0.5 rounded",
                                "text-[10px] font-medium",
                                "bg-[hsl(var(--purple-1))]",
                                "text-[hsl(var(--purple-7))]"
                            )}>
                                <MapPin size={10} />
                                {activity.neighborhoodId}
                            </span>
                        )}
                        
                        {/* Public Badge */}
                        {showPublicBadge && activity.isPublic && (
                            <span className={cn(
                                "inline-flex items-center gap-1",
                                "px-2 py-0.5 rounded",
                                "text-[10px] font-medium",
                                "bg-[hsl(var(--green-1))]",
                                "text-[hsl(var(--green-7))]"
                            )}>
                                <Check size={10} />
                                {t("public")}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function ActivityPage() {
    const { session } = useSession();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("activity");
    const [activities, setActivities] = useState<ActivityEvent[]>([]);

    const loadActivities = useCallback(async () => {
        if (!session) return;
        
        // Get stored activities
        const storedActivities = await activityRepository.getAll();
        
        // Get filtered notifications for this user
        const filtered = getNotificationsForUser(session, storedActivities);
        
        setActivities(filtered);
    }, [session]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    if (!session) return null;

    const dateLocale = locale === 'tr' ? tr : enUS;

    // Group activities by date
    const grouped = activities.reduce((acc, curr) => {
        const date = format(new Date(curr.timestamp), "d MMMM yyyy", { locale: dateLocale });
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
    }, {} as Record<string, ActivityEvent[]>);

    const handleNavigate = (issueId: string) => {
        router.push(`/issues/${issueId}`);
    };

    // Get role-specific description
    const getRoleDescription = () => {
        switch (session.role) {
            case "muhtar":
                return t("descriptionMuhtar") || `${session.neighborhoodId} Mahallesi için aktiviteler`;
            case "unit":
                return t("descriptionUnit") || `${session.name} birimi için aktiviteler`;
            case "call_center":
                return t("descriptionCallCenter") || "Tüm sistem aktiviteleri";
            default:
                return t("description");
        }
    };

    return (
        <Container className="max-w-3xl space-y-6 pb-16 animate-in fade-in duration-500">
            <PageHeader
                title={t("title")}
                description={getRoleDescription()}
                actions={
                    <div className="flex items-center gap-3">
                        {/* Role Badge */}
                        <RoleBadge 
                            role={session.role} 
                            neighborhoodId={session.neighborhoodId}
                            unitName={session.name}
                        />
                        
                        {/* Live indicator */}
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
                                <ActivityCard
                                    key={item.id}
                                    activity={item}
                                    dateLocale={dateLocale}
                                    onNavigate={handleNavigate}
                                    showPublicBadge={session.role === "call_center"}
                                />
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
