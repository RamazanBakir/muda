/**
 * Notification Service
 * 
 * Handles notification data and role-based filtering.
 * This service provides mock notifications scoped to specific units and neighborhoods.
 */

import { ActivityEvent, ActivityType } from "../model/types";
import { UserSession } from "@/features/auth/model/types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UNIT_IDS = {
    WATER: "unit-water",
    TRANSPORT: "unit-transport",
    PARK: "unit-park",
    WASTE: "unit-waste",
} as const;

export const NEIGHBORHOODS = {
    ORHANIYE: "Orhaniye",
    KOTEKLI: "Kötekli",
    CAMIKEBIR: "Camikebir",
    MUSLUHITTIN: "Musluhittin",
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA GENERATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MockNotification {
    id: string;
    type: ActivityType;
    issueId: string;
    issueTitle: string;
    actorName: string;
    actorRole: string;
    details: string;
    minutesAgo: number;
    isPublic: boolean;
    // Scoping
    unitId?: string;
    neighborhoodId?: string;
}

const MOCK_NOTIFICATIONS_DATA: MockNotification[] = [
    // ── Su ve Kanalizasyon Birimi ──
    {
        id: "notif-water-1",
        type: "status_change",
        issueId: "ISS-1007",
        issueTitle: "Su Borusu Patlaması - Orhaniye",
        actorName: "Su ve Kanalizasyon Birimi",
        actorRole: "Birim",
        details: "Bildirim 'İşleme Alındı' durumuna güncellendi. Ekipler sahaya yönlendirildi.",
        minutesAgo: 15,
        isPublic: true,
        unitId: UNIT_IDS.WATER,
        neighborhoodId: NEIGHBORHOODS.ORHANIYE,
    },
    {
        id: "notif-water-2",
        type: "assignment_change",
        issueId: "ISS-1015",
        issueTitle: "Kanalizasyon Tıkanıklığı - Kötekli",
        actorName: "Çağrı Merkezi",
        actorRole: "Operatör",
        details: "Talep Su ve Kanalizasyon Birimi'ne atandı.",
        minutesAgo: 60,
        isPublic: true,
        unitId: UNIT_IDS.WATER,
        neighborhoodId: NEIGHBORHOODS.KOTEKLI,
    },
    {
        id: "notif-water-3",
        type: "status_change",
        issueId: "ISS-1020",
        issueTitle: "Su Kesintisi Bildirimi - Orhaniye",
        actorName: "Su ve Kanalizasyon Birimi",
        actorRole: "Birim",
        details: "Sorun giderildi. Su akışı normale döndü.",
        minutesAgo: 180,
        isPublic: true,
        unitId: UNIT_IDS.WATER,
        neighborhoodId: NEIGHBORHOODS.ORHANIYE,
    },

    // ── Ulaşım Birimi ──
    {
        id: "notif-transport-1",
        type: "assignment_change",
        issueId: "ISS-1002",
        issueTitle: "Kaldırım Onarımı - Camikebir",
        actorName: "Çağrı Merkezi",
        actorRole: "Operatör",
        details: "Talep Ulaşım Dairesi'ne atandı.",
        minutesAgo: 45,
        isPublic: true,
        unitId: UNIT_IDS.TRANSPORT,
        neighborhoodId: NEIGHBORHOODS.CAMIKEBIR,
    },
    {
        id: "notif-transport-2",
        type: "status_change",
        issueId: "ISS-1010",
        issueTitle: "Trafik Işığı Arızası - Musluhittin",
        actorName: "Ulaşım Dairesi",
        actorRole: "Birim",
        details: "Arıza giderildi. Işıklar normal çalışıyor.",
        minutesAgo: 300,
        isPublic: true,
        unitId: UNIT_IDS.TRANSPORT,
        neighborhoodId: NEIGHBORHOODS.MUSLUHITTIN,
    },
    {
        id: "notif-transport-3",
        type: "priority_change",
        issueId: "ISS-1025",
        issueTitle: "Yol Çökmesi - Orhaniye",
        actorName: "AI Sistem",
        actorRole: "Otomatik",
        details: "Öncelik 'Yüksek' olarak güncellendi. Güvenlik riski tespit edildi.",
        minutesAgo: 120,
        isPublic: true,
        unitId: UNIT_IDS.TRANSPORT,
        neighborhoodId: NEIGHBORHOODS.ORHANIYE,
    },

    // ── Park ve Bahçeler Birimi ──
    {
        id: "notif-park-1",
        type: "note_added",
        issueId: "ISS-1005",
        issueTitle: "Park Aydınlatması - Kötekli",
        actorName: "Ayşe Demir",
        actorRole: "Muhtar",
        details: "Mahalledeki diğer vatandaşlar da aynı sorunu bildirdi. Acil müdahale gerekiyor.",
        minutesAgo: 120,
        isPublic: true,
        unitId: UNIT_IDS.PARK,
        neighborhoodId: NEIGHBORHOODS.KOTEKLI,
    },
    {
        id: "notif-park-2",
        type: "status_change",
        issueId: "ISS-1006",
        issueTitle: "Ağaç Budama Talebi - Orhaniye",
        actorName: "Park ve Bahçeler",
        actorRole: "Birim",
        details: "Budama işlemi planlandı. Hafta sonu yapılacak.",
        minutesAgo: 240,
        isPublic: true,
        unitId: UNIT_IDS.PARK,
        neighborhoodId: NEIGHBORHOODS.ORHANIYE,
    },

    // ── Temizlik Birimi ──
    {
        id: "notif-waste-1",
        type: "status_change",
        issueId: "ISS-1003",
        issueTitle: "Çöp Konteyner Talebi - Camikebir",
        actorName: "Temizlik İşleri",
        actorRole: "Birim",
        details: "Talep başarıyla çözüme kavuşturuldu. Yeni konteyner yerleştirildi.",
        minutesAgo: 300,
        isPublic: true,
        unitId: UNIT_IDS.WASTE,
        neighborhoodId: NEIGHBORHOODS.CAMIKEBIR,
    },
    {
        id: "notif-waste-2",
        type: "assignment_change",
        issueId: "ISS-1030",
        issueTitle: "Moloz Toplama - Musluhittin",
        actorName: "Çağrı Merkezi",
        actorRole: "Operatör",
        details: "Talep Temizlik İşleri'ne atandı.",
        minutesAgo: 400,
        isPublic: true,
        unitId: UNIT_IDS.WASTE,
        neighborhoodId: NEIGHBORHOODS.MUSLUHITTIN,
    },

    // ── Genel Bildirimler (Herkes için) ──
    {
        id: "notif-general-1",
        type: "issue_created",
        issueId: "ISS-1035",
        issueTitle: "Yeni Vatandaş Bildirimi",
        actorName: "Sistem",
        actorRole: "Otomatik",
        details: "Yeni bir bildirim sisteme eklendi ve ilgili birime yönlendirildi.",
        minutesAgo: 30,
        isPublic: true,
    },
];

/**
 * Converts mock data to ActivityEvent with proper timestamps
 */
function createActivityEvent(mock: MockNotification): ActivityEvent {
    return {
        id: mock.id,
        type: mock.type,
        issueId: mock.issueId,
        issueTitle: mock.issueTitle,
        actorName: mock.actorName,
        actorRole: mock.actorRole,
        details: mock.details,
        timestamp: new Date(Date.now() - mock.minutesAgo * 60 * 1000).toISOString(),
        isPublic: mock.isPublic,
        unitId: mock.unitId,
        neighborhoodId: mock.neighborhoodId,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILTERING LOGIC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Filter notifications based on user role and scope
 */
export function filterNotificationsByRole(
    notifications: ActivityEvent[],
    session: UserSession
): ActivityEvent[] {
    return notifications.filter((notification) => {
        switch (session.role) {
            case "citizen":
                // Citizens only see public notifications
                return notification.isPublic;

            case "muhtar":
                // Muhtars see notifications from their neighborhood + public announcements
                if (!notification.neighborhoodId) {
                    // General announcements visible to all
                    return notification.isPublic;
                }
                return notification.neighborhoodId === session.neighborhoodId;

            case "unit":
                // Units see notifications assigned to their unit + general announcements
                if (!notification.unitId) {
                    // General announcements visible to all
                    return true;
                }
                return notification.unitId === session.unitId;

            case "call_center":
                // Call center sees everything
                return true;

            default:
                return notification.isPublic;
        }
    });
}

/**
 * Sort notifications by timestamp (newest first)
 */
export function sortNotificationsByDate(notifications: ActivityEvent[]): ActivityEvent[] {
    return [...notifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUBLIC API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get mock notifications for demo purposes
 */
export function getMockNotifications(): ActivityEvent[] {
    return MOCK_NOTIFICATIONS_DATA.map(createActivityEvent);
}

/**
 * Get filtered and sorted notifications for a user session
 */
export function getNotificationsForUser(
    session: UserSession,
    additionalNotifications: ActivityEvent[] = []
): ActivityEvent[] {
    // Combine mock notifications with any additional (stored) notifications
    const allNotifications = [...getMockNotifications(), ...additionalNotifications];
    
    // Filter by role
    const filtered = filterNotificationsByRole(allNotifications, session);
    
    // Sort by date
    return sortNotificationsByDate(filtered);
}

/**
 * Get unread count for user
 * In a real app, this would be based on read status stored per user
 */
export function getUnreadCount(
    notifications: ActivityEvent[],
    _session: UserSession
): number {
    // Mock: first 3 notifications are "unread" for demo
    return Math.min(3, notifications.length);
}

/**
 * Get role-specific empty message key
 */
export function getEmptyMessageKey(role: UserSession["role"]): string {
    switch (role) {
        case "citizen":
            return "emptyPublic";
        case "muhtar":
            return "emptyNeighborhood";
        case "unit":
            return "emptyUnit";
        case "call_center":
            return "emptyAll";
        default:
            return "empty";
    }
}

