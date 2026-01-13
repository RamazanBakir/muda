"use client";

import { useSession } from "@/features/auth";
import { activityRepository, ActivityEvent } from "@/features/activity";
import { Button } from "@/shared/ui/button";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Badge } from "@/shared/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export function ActivityButton() {
    const { session } = useSession();
    const router = useRouter();
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!session) return;
        const load = async () => {
            const all = await activityRepository.getAll();
            // Filter by role scope
            const filtered = all.filter(a => {
                if (session.role === 'citizen') return a.isPublic; // Citizen only sees public
                if (session.role === 'unit') return a.unitId === session.unitId || !a.unitId; // Unit sees generic + their unit
                if (session.role === 'mukhtar') return a.neighborhoodId === session.neighborhoodId;
                return true; // Call center sees all
            });
            setActivities(filtered);
            setUnreadCount(Math.floor(Math.random() * 3)); // Mock unread for demo
        };
        load();
        const interval = setInterval(load, 10000);
        return () => clearInterval(interval);
    }, [session]);

    if (!session) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-surface animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">Bildirimler</h4>
                    <span className="text-xs text-muted-foreground">{unreadCount} yeni</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y">
                    {activities.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Bildirim yok.</div>
                    ) : (
                        activities.slice(0, 5).map(activity => (
                            <div key={activity.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => router.push(`/issues/${activity.issueId}`)}>
                                <div className="text-sm font-medium line-clamp-1">{activity.details}</div>
                                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                                    <span>{activity.actorName}</span>
                                    <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: tr })}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-2 border-t bg-muted/20">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={() => router.push('/activity')}>
                        Tümünü Gör
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
