// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI MOCK ENGINE — Deterministic keyword-based classification
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { IssueCategory, IssuePriority, IssueLocation } from "@/features/issue/model/types";
import { 
    AIDecision, 
    AIPrediction, 
    AISignal, 
    AISuggestedAction,
    AI_MODEL_INFO 
} from "../model/types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KEYWORD DICTIONARIES — For category classification
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CATEGORY_KEYWORDS: Record<IssueCategory, { keywords: string[]; weight: number }[]> = {
    water_sewer: [
        { keywords: ["su", "water", "kanalizasyon", "sewer", "gider", "taşma", "overflow"], weight: 0.9 },
        { keywords: ["logar", "manhole", "boru", "pipe", "sızıntı", "leak", "tıkanık"], weight: 0.85 },
        { keywords: ["musluk", "faucet", "arıtma", "şebeke", "network"], weight: 0.7 },
        { keywords: ["koku", "smell", "pis", "dirty"], weight: 0.4 },
    ],
    transportation: [
        { keywords: ["yol", "road", "trafik", "traffic", "kavşak", "junction", "ışık", "light"], weight: 0.9 },
        { keywords: ["otobüs", "bus", "durak", "stop", "kaldırım", "sidewalk", "asfalt", "asphalt"], weight: 0.85 },
        { keywords: ["çukur", "pothole", "işaret", "sign", "levha", "geçit", "crossing"], weight: 0.8 },
        { keywords: ["park", "parking", "araç", "vehicle", "motor"], weight: 0.5 },
    ],
    parks: [
        { keywords: ["park", "bahçe", "garden", "yeşil", "green", "ağaç", "tree"], weight: 0.9 },
        { keywords: ["bank", "bench", "çeşme", "fountain", "oyun", "playground"], weight: 0.85 },
        { keywords: ["çim", "grass", "bitki", "plant", "budama", "pruning"], weight: 0.75 },
        { keywords: ["lamba", "lamp", "aydınlatma", "lighting"], weight: 0.5 },
    ],
    waste: [
        { keywords: ["çöp", "garbage", "atık", "waste", "temizlik", "cleaning"], weight: 0.9 },
        { keywords: ["konteyner", "container", "poşet", "bag", "moloz", "rubble"], weight: 0.85 },
        { keywords: ["sokak", "street", "süpürme", "sweeping", "toplama", "collection"], weight: 0.7 },
        { keywords: ["koku", "smell", "pislik", "dirt"], weight: 0.4 },
    ],
};

// Priority keywords
const PRIORITY_KEYWORDS: Record<IssuePriority, string[]> = {
    high: ["acil", "urgent", "tehlike", "danger", "kaza", "accident", "risk", "tehlikeli", "dangerous", "ciddi", "serious", "hemen", "immediately"],
    medium: ["önemli", "important", "dikkat", "attention", "gerekli", "necessary", "sorun", "problem"],
    low: ["küçük", "small", "minör", "minor", "basit", "simple", "zamanla", "eventually"],
};

// Unit mapping
const UNIT_MAPPING: Record<IssueCategory, { id: string; name: string }> = {
    water_sewer: { id: "unit-water", name: "Su ve Kanalizasyon" },
    transportation: { id: "unit-roads", name: "Yol Bakım ve Ulaşım" },
    parks: { id: "unit-parks", name: "Park ve Bahçeler" },
    waste: { id: "unit-waste", name: "Temizlik İşleri" },
};

// Hotspot locations (mock high-priority areas)
const HOTSPOTS: Array<{ lat: number; lng: number; radius: number; boost: number }> = [
    { lat: 37.215, lng: 28.363, radius: 0.01, boost: 0.15 }, // City center
    { lat: 37.034, lng: 27.425, radius: 0.02, boost: 0.1 },  // Bodrum
];

// Reason templates
const REASON_TEMPLATES: Record<IssueCategory, string[]> = {
    water_sewer: [
        "Açıklamada su/kanalizasyon anahtar kelimeleri tespit edildi",
        "Altyapı kaynaklı sorun belirtileri mevcut",
        "Bölgede benzer talepler çözümlenmiş",
    ],
    transportation: [
        "Ulaşım/yol ile ilgili terimler tespit edildi",
        "Trafik güvenliği etkisi değerlendirildi",
        "Konum bilgisi ana arter üzerinde",
    ],
    parks: [
        "Park ve yeşil alan terimleri tespit edildi",
        "Kamusal alan bakımı gereksinimi belirlendi",
        "Çevresel faktörler değerlendirildi",
    ],
    waste: [
        "Temizlik/atık anahtar kelimeleri tespit edildi",
        "Çevresel hijyen faktörleri değerlendirildi",
        "Bölge temizlik takvimi kontrol edildi",
    ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[ğ]/g, "g")
        .replace(/[ü]/g, "u")
        .replace(/[ş]/g, "s")
        .replace(/[ı]/g, "i")
        .replace(/[ö]/g, "o")
        .replace(/[ç]/g, "c");
}

function calculateCategoryScore(text: string, category: IssueCategory): number {
    const normalized = normalizeText(text);
    const rules = CATEGORY_KEYWORDS[category];
    
    let totalScore = 0;
    let matchCount = 0;
    
    for (const rule of rules) {
        for (const keyword of rule.keywords) {
            if (normalized.includes(normalizeText(keyword))) {
                totalScore += rule.weight;
                matchCount++;
            }
        }
    }
    
    // Normalize score
    return matchCount > 0 ? Math.min(totalScore / matchCount, 0.95) : 0.1;
}

function calculatePriorityScore(text: string): { priority: IssuePriority; confidence: number } {
    const normalized = normalizeText(text);
    
    // Check high priority first
    for (const keyword of PRIORITY_KEYWORDS.high) {
        if (normalized.includes(normalizeText(keyword))) {
            return { priority: "high", confidence: 0.85 };
        }
    }
    
    // Check medium
    for (const keyword of PRIORITY_KEYWORDS.medium) {
        if (normalized.includes(normalizeText(keyword))) {
            return { priority: "medium", confidence: 0.75 };
        }
    }
    
    // Default to medium with lower confidence
    return { priority: "medium", confidence: 0.6 };
}

function checkHotspots(location?: IssueLocation): number {
    if (!location?.lat || !location?.lng) return 0;
    
    for (const hotspot of HOTSPOTS) {
        const distance = Math.sqrt(
            Math.pow(location.lat - hotspot.lat, 2) + 
            Math.pow(location.lng - hotspot.lng, 2)
        );
        if (distance <= hotspot.radius) {
            return hotspot.boost;
        }
    }
    return 0;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN AI ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AIEngineInput {
    description: string;
    category?: IssueCategory;
    location?: IssueLocation;
    hasPhoto?: boolean;
    photoCount?: number;
}

/**
 * Generate AI decision from issue data
 */
export function generateAIDecision(input: AIEngineInput): AIDecision {
    const startTime = performance.now();
    
    // Calculate category scores
    const categoryScores: Array<{ category: IssueCategory; score: number }> = [
        { category: "water_sewer", score: calculateCategoryScore(input.description, "water_sewer") },
        { category: "transportation", score: calculateCategoryScore(input.description, "transportation") },
        { category: "parks", score: calculateCategoryScore(input.description, "parks") },
        { category: "waste", score: calculateCategoryScore(input.description, "waste") },
    ];
    
    // Sort by score
    categoryScores.sort((a, b) => b.score - a.score);
    const topCategory = categoryScores[0];
    const secondCategory = categoryScores[1];
    
    // Calculate ambiguity
    const ambiguity = Math.abs(topCategory.score - secondCategory.score) < 0.15;
    
    // Get priority
    const priorityResult = calculatePriorityScore(input.description);
    
    // Check hotspots for priority boost
    const hotspotBoost = checkHotspots(input.location);
    if (hotspotBoost > 0 && priorityResult.priority !== "high") {
        priorityResult.priority = "high";
        priorityResult.confidence = Math.min(priorityResult.confidence + hotspotBoost, 0.9);
    }
    
    // Photo confidence boost
    const photoBoost = input.hasPhoto ? 0.08 : 0;
    
    // Build signals
    const signals: AISignal[] = [
        { type: "text", label: "Metin analizi", weight: topCategory.score },
    ];
    
    if (input.location?.lat && input.location?.lng) {
        signals.push({ 
            type: "location", 
            label: `Konum: ${input.location.district || "Belirlendi"}`, 
            weight: 0.7 + hotspotBoost 
        });
    }
    
    if (input.hasPhoto) {
        signals.push({ 
            type: "photo", 
            label: `${input.photoCount || 1} fotoğraf eklendi`, 
            weight: 0.75 
        });
    }
    
    // Calculate overall confidence
    let overallConfidence = (topCategory.score + photoBoost) * (ambiguity ? 0.85 : 1);
    overallConfidence = Math.min(Math.max(overallConfidence, 0.45), 0.95);
    
    // Add some variance for realism
    const variance = (Math.random() - 0.5) * 0.1;
    overallConfidence = Math.min(Math.max(overallConfidence + variance, 0.45), 0.95);
    
    // Build reasons
    const reasons = [
        REASON_TEMPLATES[topCategory.category][0],
        ...(input.location ? [REASON_TEMPLATES[topCategory.category][2]] : []),
        ...(overallConfidence > 0.8 ? ["Yüksek güvenirlikle eşleşme sağlandı"] : []),
    ];
    
    // Build suggested actions
    const suggestedActions: AISuggestedAction[] = [];
    
    if (ambiguity) {
        suggestedActions.push({
            type: "request_info",
            label: "Daha fazla detay istenmesi önerilir",
        });
    }
    
    if (priorityResult.priority === "high") {
        suggestedActions.push({
            type: "escalate",
            label: "Acil değerlendirme önerilir",
        });
    }
    
    const processingTime = performance.now() - startTime;
    
    return {
        isEnabled: true,
        modelVersion: AI_MODEL_INFO.version,
        
        predictedCategory: {
            value: topCategory.category,
            confidence: Math.min(topCategory.score + photoBoost, 0.95),
        },
        
        predictedUnit: {
            value: UNIT_MAPPING[topCategory.category],
            confidence: Math.min(topCategory.score + photoBoost, 0.95),
        },
        
        predictedPriority: {
            value: priorityResult.priority,
            confidence: priorityResult.confidence,
        },
        
        overallConfidence,
        reasons,
        signals,
        suggestedActions,
        
        createdAt: new Date().toISOString(),
        processingTimeMs: Math.round(processingTime),
    };
}

/**
 * Re-run AI analysis (for triage)
 */
export function rerunAIAnalysis(input: AIEngineInput, previousDecision?: AIDecision): AIDecision {
    const newDecision = generateAIDecision(input);
    
    // If there's a previous decision, add a signal about re-analysis
    if (previousDecision) {
        newDecision.signals.push({
            type: "history",
            label: "Yeniden analiz yapıldı",
            weight: 0.5,
        });
        
        // Slightly adjust confidence if category changed
        if (previousDecision.predictedCategory.value !== newDecision.predictedCategory.value) {
            newDecision.reasons.push("Önceki analizden farklı kategori önerildi");
        }
    }
    
    return newDecision;
}

/**
 * Check if AI suggestion should be shown (for devtools error simulation)
 */
export function shouldShowAI(): boolean {
    if (typeof window === "undefined") return true;
    
    const devTools = window.MudaDevTools;
    if (!devTools) return true;
    
    // AI error rate simulation
    const aiErrorRate = devTools.settings?.errorRate || 0;
    return Math.random() > aiErrorRate * 0.5; // AI is more resilient than API
}

