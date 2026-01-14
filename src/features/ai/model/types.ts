// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI DECISION TYPES — Core domain model for AI-assisted routing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { IssueCategory, IssuePriority } from "@/features/issue/model/types";

/**
 * Prediction with confidence score
 */
export interface AIPrediction<T> {
    value: T;
    confidence: number; // 0.0 - 1.0
}

/**
 * Signal that influenced AI decision
 */
export interface AISignal {
    type: "text" | "photo" | "location" | "history";
    label: string;
    weight: number; // 0.0 - 1.0
}

/**
 * Suggested action from AI
 */
export interface AISuggestedAction {
    type: "reroute" | "set_priority" | "request_info" | "escalate";
    label: string;
    targetValue?: string;
}

/**
 * Final decision record
 */
export interface AIFinalDecision {
    category: IssueCategory;
    unitId: string;
    unitName: string;
    priority: IssuePriority;
    decidedBy: "ai" | "human";
    decidedAt: string;
    humanOverride?: {
        byRole: string;
        byName: string;
        reason: string;
        originalCategory?: IssueCategory;
        originalUnitId?: string;
        originalPriority?: IssuePriority;
        timestamp: string;
    };
}

/**
 * Complete AI Decision payload attached to an issue
 */
export interface AIDecision {
    isEnabled: boolean;
    modelVersion: string;
    
    // Predictions
    predictedCategory: AIPrediction<IssueCategory>;
    predictedUnit: AIPrediction<{ id: string; name: string }>;
    predictedPriority: AIPrediction<IssuePriority>;
    
    // Overall confidence
    overallConfidence: number;
    
    // Explainability
    reasons: string[]; // 2-4 bullet reasons
    signals: AISignal[];
    suggestedActions: AISuggestedAction[];
    
    // Timestamps
    createdAt: string;
    processingTimeMs: number;
    
    // Final resolution
    finalDecision?: AIFinalDecision;
}

/**
 * AI Feedback for learning (mock)
 */
export interface AIFeedback {
    id: string;
    issueId: string;
    accepted: boolean;
    overrideFields?: {
        category?: IssueCategory;
        unitId?: string;
        priority?: IssuePriority;
    };
    overrideReason?: string;
    byRole: string;
    byName: string;
    createdAt: string;
}

/**
 * AI System metrics (for dashboard)
 */
export interface AIMetrics {
    totalRoutedToday: number;
    totalRoutedWeek: number;
    acceptanceRate: number; // 0-1
    overrideRate: number; // 0-1
    lowConfidenceRate: number; // 0-1
    avgConfidence: number;
    avgProcessingTimeMs: number;
    confusionPairs: Array<{
        category1: IssueCategory;
        category2: IssueCategory;
        count: number;
    }>;
    recentFeedback: AIFeedback[];
}

/**
 * Override reason options
 */
export const AI_OVERRIDE_REASONS = [
    { value: "wrong_category", label: "Yanlış Kategori" },
    { value: "wrong_unit", label: "Yanlış Birim" },
    { value: "wrong_priority", label: "Yanlış Öncelik" },
    { value: "needs_more_info", label: "Daha Fazla Bilgi Gerekli" },
    { value: "special_case", label: "Özel Durum" },
    { value: "other", label: "Diğer" },
] as const;

export type AIOverrideReasonType = typeof AI_OVERRIDE_REASONS[number]["value"];

/**
 * Model version info
 */
export const AI_MODEL_INFO = {
    version: "MUDA-v1.2.0-beta",
    lastUpdated: "2026-01-10",
    capabilities: ["category_classification", "unit_routing", "priority_scoring"],
};

