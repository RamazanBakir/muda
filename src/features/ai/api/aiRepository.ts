// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI REPOSITORY — Feedback storage and metrics calculation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { v4 as uuidv4 } from "uuid";
import { 
    AIFeedback, 
    AIMetrics, 
    AIDecision, 
    AIFinalDecision,
    AIOverrideReasonType 
} from "../model/types";
import { IssueCategory, IssuePriority } from "@/features/issue/model/types";

const AI_FEEDBACK_STORAGE_KEY = "muda_ai_feedback";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEEDBACK STORAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getFeedbackFromStorage(): AIFeedback[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(AI_FEEDBACK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveFeedbackToStorage(feedback: AIFeedback[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(AI_FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
}

export const aiRepository = {
    /**
     * Record AI feedback when suggestion is accepted or overridden
     */
    async recordFeedback(params: {
        issueId: string;
        accepted: boolean;
        overrideFields?: {
            category?: IssueCategory;
            unitId?: string;
            priority?: IssuePriority;
        };
        overrideReason?: AIOverrideReasonType;
        byRole: string;
        byName: string;
    }): Promise<AIFeedback> {
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate latency
        
        const feedback: AIFeedback = {
            id: uuidv4(),
            issueId: params.issueId,
            accepted: params.accepted,
            overrideFields: params.overrideFields,
            overrideReason: params.overrideReason,
            byRole: params.byRole,
            byName: params.byName,
            createdAt: new Date().toISOString(),
        };
        
        const allFeedback = getFeedbackFromStorage();
        allFeedback.unshift(feedback);
        
        // Keep only last 100 feedback items
        if (allFeedback.length > 100) {
            allFeedback.splice(100);
        }
        
        saveFeedbackToStorage(allFeedback);
        return feedback;
    },

    /**
     * Get all feedback for an issue
     */
    async getFeedbackForIssue(issueId: string): Promise<AIFeedback[]> {
        return getFeedbackFromStorage().filter(f => f.issueId === issueId);
    },

    /**
     * Get recent feedback
     */
    async getRecentFeedback(limit: number = 10): Promise<AIFeedback[]> {
        return getFeedbackFromStorage().slice(0, limit);
    },

    /**
     * Calculate AI metrics (mock implementation)
     */
    async getMetrics(): Promise<AIMetrics> {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const allFeedback = getFeedbackFromStorage();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const todayFeedback = allFeedback.filter(
            f => new Date(f.createdAt) >= today
        );
        const weekFeedback = allFeedback.filter(
            f => new Date(f.createdAt) >= weekAgo
        );
        
        const acceptedCount = weekFeedback.filter(f => f.accepted).length;
        const overrideCount = weekFeedback.filter(f => !f.accepted).length;
        const totalCount = weekFeedback.length || 1; // Avoid division by zero
        
        // Mock confusion pairs (would be calculated from override patterns)
        const confusionPairs: AIMetrics["confusionPairs"] = [
            { category1: "transportation", category2: "parks", count: 12 },
            { category1: "water_sewer", category2: "waste", count: 8 },
            { category1: "parks", category2: "waste", count: 5 },
        ];
        
        // Add mock baseline data for demo
        const baselineRouted = 47;
        const baselineAccepted = 38;
        
        return {
            totalRoutedToday: todayFeedback.length + 12, // Add baseline
            totalRoutedWeek: weekFeedback.length + baselineRouted,
            acceptanceRate: weekFeedback.length > 0 
                ? (acceptedCount / totalCount) 
                : (baselineAccepted / baselineRouted),
            overrideRate: weekFeedback.length > 0 
                ? (overrideCount / totalCount)
                : (1 - baselineAccepted / baselineRouted),
            lowConfidenceRate: 0.18, // Mock
            avgConfidence: 0.78, // Mock
            avgProcessingTimeMs: 45, // Mock
            confusionPairs,
            recentFeedback: allFeedback.slice(0, 10),
        };
    },

    /**
     * Apply AI suggestion to create final decision
     */
    applyAISuggestion(aiDecision: AIDecision): AIFinalDecision {
        return {
            category: aiDecision.predictedCategory.value,
            unitId: aiDecision.predictedUnit.value.id,
            unitName: aiDecision.predictedUnit.value.name,
            priority: aiDecision.predictedPriority.value,
            decidedBy: "ai",
            decidedAt: new Date().toISOString(),
        };
    },

    /**
     * Create human override decision
     */
    createHumanOverride(
        aiDecision: AIDecision,
        override: {
            category: IssueCategory;
            unitId: string;
            unitName: string;
            priority: IssuePriority;
            reason: string;
            byRole: string;
            byName: string;
        }
    ): AIFinalDecision {
        return {
            category: override.category,
            unitId: override.unitId,
            unitName: override.unitName,
            priority: override.priority,
            decidedBy: "human",
            decidedAt: new Date().toISOString(),
            humanOverride: {
                byRole: override.byRole,
                byName: override.byName,
                reason: override.reason,
                originalCategory: aiDecision.predictedCategory.value,
                originalUnitId: aiDecision.predictedUnit.value.id,
                originalPriority: aiDecision.predictedPriority.value,
                timestamp: new Date().toISOString(),
            },
        };
    },

    /**
     * Clear all feedback (for testing)
     */
    clearAllFeedback(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem(AI_FEEDBACK_STORAGE_KEY);
        }
    },
};

