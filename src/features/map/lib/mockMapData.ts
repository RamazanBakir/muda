/**
 * Mock Map Data Service
 * 
 * Generates realistic mock data points across Muğla districts
 * for demonstrating map visualization features.
 */

import { IssueCategory, IssuePriority, IssueStatus } from "@/features/issue/model/types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MUĞLA DISTRICT CENTERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MUGLA_DISTRICTS = {
    mentese: { name: "Menteşe", lat: 37.2153, lng: 28.3636, weight: 3 },
    bodrum: { name: "Bodrum", lat: 37.0344, lng: 27.4305, weight: 2 },
    fethiye: { name: "Fethiye", lat: 36.6514, lng: 29.1266, weight: 2 },
    marmaris: { name: "Marmaris", lat: 36.8551, lng: 28.2744, weight: 2 },
    milas: { name: "Milas", lat: 37.3167, lng: 27.7833, weight: 1.5 },
    dalaman: { name: "Dalaman", lat: 36.7667, lng: 28.8000, weight: 1 },
    ortaca: { name: "Ortaca", lat: 36.8389, lng: 28.7667, weight: 1 },
    koycegiz: { name: "Köyceğiz", lat: 36.9722, lng: 28.6875, weight: 0.8 },
    datca: { name: "Datça", lat: 36.7333, lng: 27.6833, weight: 0.8 },
    ula: { name: "Ula", lat: 37.1000, lng: 28.4167, weight: 0.7 },
    yatagan: { name: "Yatağan", lat: 37.3333, lng: 28.1333, weight: 0.7 },
    kavaklidere: { name: "Kavaklıdere", lat: 37.4333, lng: 28.3833, weight: 0.5 },
    seydikemer: { name: "Seydikemer", lat: 36.6833, lng: 29.3500, weight: 0.5 },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ISSUE TEMPLATES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ISSUE_TEMPLATES: Record<IssueCategory, { titles: string[], icon: string }> = {
    transportation: {
        titles: [
            "Yol Çukuru",
            "Trafik Işığı Arızası",
            "Kaldırım Hasarı",
            "Yol Çökmesi",
            "Otobüs Durağı Sorunu",
            "Yaya Geçidi Silinmiş",
            "Trafik Levhası Eksik"
        ],
        icon: "🚗"
    },
    water_sewer: {
        titles: [
            "Su Borusu Patlaması",
            "Kanalizasyon Tıkanıklığı",
            "Logar Kapağı Kırık",
            "Su Kesintisi",
            "Rögar Taşması",
            "Su Sızıntısı",
            "Pis Su Kokusu"
        ],
        icon: "💧"
    },
    parks: {
        titles: [
            "Park Aydınlatması Arızalı",
            "Kırık Bank",
            "Ağaç Budama Gerekli",
            "Çocuk Parkı Bakım",
            "Çim Alan Kurumuş",
            "Çeşme Çalışmıyor",
            "Bank Boyama"
        ],
        icon: "🌳"
    },
    waste: {
        titles: [
            "Çöp Konteyneri Dolu",
            "Moloz Atıkları",
            "Sokak Temizliği",
            "Çöp Kokusu",
            "Konteyner Kırık",
            "Atık Toplama Gecikmesi",
            "Çöp Birikintisi"
        ],
        icon: "🗑️"
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MapIssuePoint {
    id: string;
    lat: number;
    lng: number;
    title: string;
    category: IssueCategory;
    priority: IssuePriority;
    status: IssueStatus;
    district: string;
    createdAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePointNearCenter(center: { lat: number; lng: number }, radiusKm: number = 5): { lat: number; lng: number } {
    // Approximate: 1 degree lat ≈ 111km, 1 degree lng ≈ 111km * cos(lat)
    const latOffset = (Math.random() - 0.5) * 2 * (radiusKm / 111);
    const lngOffset = (Math.random() - 0.5) * 2 * (radiusKm / (111 * Math.cos(center.lat * Math.PI / 180)));
    
    return {
        lat: center.lat + latOffset,
        lng: center.lng + lngOffset
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA GENERATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let mockDataCache: MapIssuePoint[] | null = null;

/**
 * Generate mock map issue points across Muğla
 */
export function generateMockMapData(count: number = 50): MapIssuePoint[] {
    if (mockDataCache && mockDataCache.length === count) {
        return mockDataCache;
    }

    const points: MapIssuePoint[] = [];
    const categories: IssueCategory[] = ["transportation", "water_sewer", "parks", "waste"];
    const priorities: IssuePriority[] = ["high", "medium", "low"];
    const statuses: IssueStatus[] = ["created", "triaged", "in_progress", "resolved"];
    
    // Calculate total weight for district distribution
    const totalWeight = Object.values(MUGLA_DISTRICTS).reduce((sum, d) => sum + d.weight, 0);
    
    for (let i = 0; i < count; i++) {
        // Select district based on weight
        let randomWeight = Math.random() * totalWeight;
        let selectedDistrict = MUGLA_DISTRICTS.mentese;
        
        for (const district of Object.values(MUGLA_DISTRICTS)) {
            randomWeight -= district.weight;
            if (randomWeight <= 0) {
                selectedDistrict = district;
                break;
            }
        }
        
        const category = getRandomElement(categories);
        const template = ISSUE_TEMPLATES[category];
        const point = generatePointNearCenter(selectedDistrict, 3);
        
        // Priority distribution: 20% high, 50% medium, 30% low
        const priorityRoll = Math.random();
        let priority: IssuePriority = "medium";
        if (priorityRoll < 0.2) priority = "high";
        else if (priorityRoll > 0.7) priority = "low";
        
        // Status distribution: 30% created, 25% triaged, 30% in_progress, 15% resolved
        const statusRoll = Math.random();
        let status: IssueStatus = "in_progress";
        if (statusRoll < 0.3) status = "created";
        else if (statusRoll < 0.55) status = "triaged";
        else if (statusRoll > 0.85) status = "resolved";
        
        points.push({
            id: `MAP-${1000 + i}`,
            lat: point.lat,
            lng: point.lng,
            title: getRandomElement(template.titles),
            category,
            priority,
            status,
            district: selectedDistrict.name,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    mockDataCache = points;
    return points;
}

/**
 * Get all district centers for map bounds
 */
export function getDistrictCenters(): Array<{ name: string; lat: number; lng: number }> {
    return Object.values(MUGLA_DISTRICTS).map(d => ({
        name: d.name,
        lat: d.lat,
        lng: d.lng
    }));
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: IssueCategory): string {
    return ISSUE_TEMPLATES[category]?.icon || "📍";
}

/**
 * Get category color (for markers)
 */
export function getCategoryColor(category: IssueCategory): string {
    const colors: Record<IssueCategory, string> = {
        transportation: "#3b82f6", // Blue
        water_sewer: "#06b6d4", // Cyan
        parks: "#22c55e", // Green
        waste: "#f59e0b" // Amber
    };
    return colors[category];
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: IssuePriority): string {
    const colors: Record<IssuePriority, string> = {
        high: "#ef4444", // Red
        medium: "#f59e0b", // Amber
        low: "#22c55e" // Green
    };
    return colors[priority];
}

/**
 * Get status color
 */
export function getStatusColor(status: IssueStatus): string {
    const colors: Record<IssueStatus, string> = {
        created: "#94a3b8", // Slate
        triaged: "#8b5cf6", // Purple
        in_progress: "#3b82f6", // Blue
        resolved: "#22c55e" // Green
    };
    return colors[status];
}

