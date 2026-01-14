import { Issue, IssueStatus, IssuePriority, IssueCategory, AssignedTo } from "../model/types";
import { UserRole } from "@/features/auth/model/types";
import { activityRepository } from "@/features/activity";
import { generateAIDecision } from "@/features/ai";
import { AIDecision } from "@/features/ai/model/types";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "muda_issues";

// --- MOCK AI DECISIONS ---
const createMockAIDecision = (
    category: IssueCategory, 
    unitId: string, 
    unitName: string, 
    priority: IssuePriority,
    confidence: number,
    decidedBy: "ai" | "human" = "ai"
): AIDecision => ({
    isEnabled: true,
    modelVersion: "MUDA-v1.2.0-beta",
    predictedCategory: { value: category, confidence },
    predictedUnit: { value: { id: unitId, name: unitName }, confidence },
    predictedPriority: { value: priority, confidence: confidence - 0.05 },
    overallConfidence: confidence,
    reasons: [
        "Metin analizi ile kategori belirlendi",
        "Konum bilgisi değerlendirildi",
        confidence > 0.8 ? "Yüksek güvenirlikle eşleşme sağlandı" : "Benzer kayıtlar incelendi"
    ],
    signals: [
        { type: "text", label: "Metin analizi", weight: confidence },
        { type: "location", label: "Konum: Belirlendi", weight: 0.75 }
    ],
    suggestedActions: confidence < 0.6 ? [{ type: "request_info", label: "Daha fazla detay istenmesi önerilir" }] : [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    processingTimeMs: Math.floor(Math.random() * 50) + 20,
    finalDecision: {
        category,
        unitId,
        unitName,
        priority,
        decidedBy,
        decidedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    }
});

// --- MOCK DATA ---
const MOCK_ISSUES: Issue[] = [
    {
        id: "ISS-1001",
        title: "Cumhuriyet Caddesi Çukur Sorunu",
        description: "Ana caddede büyük bir çukur var, araçlar için tehlikeli.",
        location: {
            lat: 37.215,
            lng: 28.363,
            addressText: "Menteşe, Emirbeyazıt Mh, Cumhuriyet Cd.",
            district: "mentese",
            neighborhood: "emirbeyazit"
        },
        category: "transportation",
        priority: "high",
        status: "created",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        reporter: { type: "citizen", id: "user-1", name: "Ahmet Yılmaz" },
        media: { photos: [] },
        timeline: [
            { status: "created", by: "Ahmet Yılmaz", date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
        ],
        ai: createMockAIDecision("transportation", "unit-roads", "Yol Bakım ve Ulaşım", "high", 0.89)
    },
    {
        id: "ISS-1002",
        title: "Sokak Lambası Yanmıyor",
        description: "Parkın yanındaki 3 lamba akşamları çalışmıyor.",
        location: {
            lat: 37.034,
            lng: 27.425,
            district: "bodrum",
            neighborhood: "konacik",
            addressText: "Konacık, Atatürk Blv."
        },
        category: "parks",
        priority: "medium",
        status: "in_progress",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        reporter: { type: "muhtar", id: "muhtar-1", name: "Mehmet Demir" },
        assignedUnit: { id: "unit-light", name: "Aydınlatma Şefliği" },
        assignedTo: { type: "team", id: "team-park-a", name: "Park Bahçeler Ekibi" },
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4h remaining
        media: { 
            photos: [
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
            ],
            videos: [
                "https://www.w3schools.com/html/mov_bbb.mp4"
            ]
        },
        timeline: [
            { status: "created", by: "Mehmet Demir", date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
            { status: "triaged", by: "Çağrı Merkezi", date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
            { status: "in_progress", by: "Aydınlatma Şefliği", date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), note: "Ekip yönlendirildi." }
        ],
        ai: createMockAIDecision("parks", "unit-parks", "Park ve Bahçeler", "medium", 0.72, "human")
    },
    // ... Add more diverse data for heatmap later or let user add them via live sim
    {
        id: "ISS-1007",
        title: "Logar Kapağı Açık",
        description: "Tehlike arz ediyor. Yaya ve araç trafiği için ciddi bir risk oluşturmaktadır. Acil müdahale gerekmektedir.",
        location: { lat: 37.210, lng: 28.360, district: "mentese", neighborhood: "orhaniye", addressText: "Orhaniye Mh." },
        category: "water_sewer",
        priority: "high",
        status: "in_progress",
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        reporter: { type: "citizen", id: "user-3", name: "Fatma Şahin" },
        assignedUnit: { id: "unit-water", name: "Su ve Kanalizasyon" },
        media: { 
            photos: [
                "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&q=80",
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
                "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=800&q=80"
            ],
            videos: []
        },
        timeline: [
            { status: "created", by: "Fatma Şahin", date: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
            { status: "in_progress", by: "Su ve Kanalizasyon", date: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
            { status: "in_progress", by: "AI Sistemi", date: new Date(Date.now() - 1000 * 60 * 119).toISOString(), note: "AI önerisi oluşturuldu ve uygulandı", isInternal: true }
        ],
        ai: createMockAIDecision("water_sewer", "unit-water", "Su ve Kanalizasyon", "high", 0.93)
    },
    {
        id: "ISS-1008",
        title: "Çöp Konteyneri Taşıyor",
        description: "Mahalle girişindeki konteyner haftalardır boşaltılmıyor, çevreye kötü koku yayılıyor.",
        location: { lat: 37.220, lng: 28.370, district: "mentese", neighborhood: "muslubahce", addressText: "Muslubahçe Mh. Pazar Yeri Karşısı" },
        category: "waste",
        priority: "medium",
        status: "created",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        reporter: { type: "citizen", id: "user-4", name: "Ali Kara" },
        media: { photos: [] },
        timeline: [
            { status: "created", by: "Ali Kara", date: new Date(Date.now() - 1000 * 60 * 45).toISOString() }
        ],
        ai: createMockAIDecision("waste", "unit-waste", "Temizlik İşleri", "medium", 0.55)
    },
    {
        id: "ISS-1009",
        title: "Park Bankları Kırık",
        description: "Çocuk parkındaki bankların çoğu kırılmış, oturulamıyor.",
        location: { lat: 37.025, lng: 27.430, district: "bodrum", neighborhood: "turgutreis", addressText: "Turgutreis Mh. Sahil Parkı" },
        category: "parks",
        priority: "low",
        status: "triaged",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        reporter: { type: "muhtar", id: "muhtar-2", name: "Zeynep Aydın" },
        assignedUnit: { id: "unit-parks", name: "Park ve Bahçeler" },
        media: { photos: ["https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=800&q=80"] },
        timeline: [
            { status: "created", by: "Zeynep Aydın", date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
            { status: "triaged", by: "Çağrı Merkezi", date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), note: "AI önerisi manuel olarak düzeltildi" }
        ],
        ai: {
            ...createMockAIDecision("parks", "unit-parks", "Park ve Bahçeler", "low", 0.81),
            finalDecision: {
                category: "parks",
                unitId: "unit-parks",
                unitName: "Park ve Bahçeler",
                priority: "low",
                decidedBy: "human",
                decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                humanOverride: {
                    byRole: "call_center",
                    byName: "Operatör Ayşe",
                    reason: "Öncelik düşürüldü - acil değil",
                    originalPriority: "medium",
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
                }
            }
        }
    }
];

export const issueRepository = {
    getIssuesFromStorage(): Issue[] {
        if (typeof window === "undefined") return MOCK_ISSUES;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ISSUES));
            return MOCK_ISSUES;
        }
        return JSON.parse(stored);
    },

    saveIssuesToStorage(issues: Issue[]) {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
        }
    },

    async getIssues(filters: {
        role: UserRole;
        userId?: string;
        neighborhoodId?: string;
        unitId?: string;
        status?: IssueStatus;
        priority?: IssuePriority;
        assignedToId?: string;
        dateRange?: { start: Date, end: Date };
        search?: string;
    }): Promise<Issue[]> {
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency

        let issues = this.getIssuesFromStorage();

        // 1. Role Scoping
        if (filters.role === "citizen" && filters.userId) {
            issues = issues.filter(i => i.reporter.id === filters.userId);
        } else if (filters.role === "muhtar" && filters.neighborhoodId) {
            issues = issues.filter(i => i.location.neighborhood?.toLowerCase() === filters.neighborhoodId?.toLowerCase() || i.reporter.type === "muhtar");
        } else if (filters.role === "unit" && filters.unitId) {
            // Unit sees issues assigned to their unit
            issues = issues.filter(i => i.assignedUnit?.id === filters.unitId);
        }

        // 2. Attribute Filtering
        if (filters.status) issues = issues.filter(i => i.status === filters.status);
        if (filters.priority) issues = issues.filter(i => i.priority === filters.priority);
        if (filters.assignedToId) issues = issues.filter(i => i.assignedTo?.id === filters.assignedToId);

        if (filters.dateRange) {
            issues = issues.filter(i => {
                const d = new Date(i.createdAt);
                return d >= filters.dateRange!.start && d <= filters.dateRange!.end;
            });
        }

        if (filters.search) {
            const q = filters.search.toLowerCase();
            issues = issues.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
        }

        // Sort by date desc
        return issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async getIssue(id: string): Promise<Issue | undefined> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.getIssuesFromStorage().find(i => i.id === id);
    },

    async updateIssue(id: string, updates: Partial<Issue>, actor: { name: string, role: string }): Promise<Issue> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const issues = this.getIssuesFromStorage();
        const index = issues.findIndex(i => i.id === id);
        if (index === -1) throw new Error("Issue not found");

        const oldIssue = issues[index];
        const newIssue = { ...oldIssue, ...updates, updatedAt: new Date().toISOString() };

        // --- Activity & Timeline Logic ---

        // Status Change
        if (updates.status && updates.status !== oldIssue.status) {
            newIssue.timeline.unshift({
                date: new Date().toISOString(),
                status: updates.status,
                by: actor.name,
                note: `Durum güncellendi: ${updates.status}`,
                isInternal: false
            });
            activityRepository.logIssueChange(newIssue, "status_change", `Durum ${updates.status} olarak güncellendi.`, actor);
        }

        // Priority Change
        if (updates.priority && updates.priority !== oldIssue.priority) {
            newIssue.timeline.unshift({
                date: new Date().toISOString(),
                status: newIssue.status,
                by: actor.name,
                note: `Öncelik değiştirildi: ${updates.priority}`,
                isInternal: false
            });
            activityRepository.logIssueChange(newIssue, "priority_change", `Öncelik ${updates.priority} yapıldı.`, actor);
        }

        // Assignment Change
        // Simple equality check for assignedTo object
        const assignedToChanged =
            (updates.assignedTo && !oldIssue.assignedTo) ||
            (updates.assignedTo && oldIssue.assignedTo && updates.assignedTo.id !== oldIssue.assignedTo.id);

        if (assignedToChanged) {
            const assigneeName = updates.assignedTo?.name || "Bilinmiyor";
            newIssue.timeline.unshift({
                date: new Date().toISOString(),
                status: newIssue.status,
                by: actor.name,
                note: `İş atandı: ${assigneeName}`,
                isInternal: true
            });
            activityRepository.logIssueChange(newIssue, "assignment_change", `İş ${assigneeName} ekibine atandı.`, actor);
        }

        issues[index] = newIssue;
        this.saveIssuesToStorage(issues);
        return newIssue;
    },

    async addNote(id: string, note: string, isInternal: boolean, actor: { name: string, role: string }) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const issues = this.getIssuesFromStorage();
        const index = issues.findIndex(i => i.id === id);
        if (index === -1) throw new Error("Not found");
        const issue = issues[index];

        const timelineItem = {
            date: new Date().toISOString(),
            status: issue.status,
            note: note,
            by: actor.name,
            isInternal
        };

        issue.timeline.unshift(timelineItem);

        // Only internal notes don't generate public activity, but we log everything to activity repo 
        // and let activity repo handle visibility based on 'isPublic' flag
        activityRepository.logIssueChange(issue, "note_added", `${isInternal ? 'Dahili' : 'Genel'} not eklendi.`, actor, !isInternal);

        issues[index] = issue;
        this.saveIssuesToStorage(issues);
    },

    async createIssue(issueData: Omit<Issue, "id" | "createdAt" | "updatedAt" | "timeline" | "status" | "media" | "ai">): Promise<Issue> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const issues = this.getIssuesFromStorage();

        // Generate AI decision for the new issue
        const aiDecision = generateAIDecision({
            description: issueData.description,
            category: issueData.category,
            location: issueData.location,
            hasPhoto: false,
        });

        const newIssue: Issue = {
            ...issueData,
            id: `ISS-${1000 + issues.length + 1}`,
            status: "created",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            media: { photos: [] },
            timeline: [
                {
                    status: "created",
                    by: issueData.reporter.name,
                    date: new Date().toISOString()
                },
                {
                    status: "created",
                    by: "AI Sistemi",
                    date: new Date().toISOString(),
                    note: `AI önerisi oluşturuldu: ${aiDecision.predictedUnit.value.name} (%${Math.round(aiDecision.overallConfidence * 100)} güvenirlik)`,
                    isInternal: true
                }
            ],
            ai: aiDecision
        };

        issues.unshift(newIssue);
        this.saveIssuesToStorage(issues);

        activityRepository.logIssueChange(newIssue, "issue_created", "Yeni bildirim oluşturuldu.", { name: newIssue.reporter.name, role: newIssue.reporter.type }, true);

        return newIssue;
    },

    /**
     * Apply AI suggestion to an issue
     */
    async applyAISuggestion(issueId: string, actor: { name: string, role: string }): Promise<Issue> {
        const issues = this.getIssuesFromStorage();
        const index = issues.findIndex(i => i.id === issueId);
        if (index === -1) throw new Error("Issue not found");
        
        const issue = issues[index];
        if (!issue.ai) throw new Error("No AI decision found");
        
        // Apply AI suggestions
        issue.category = issue.ai.predictedCategory.value;
        issue.priority = issue.ai.predictedPriority.value;
        issue.assignedUnit = {
            id: issue.ai.predictedUnit.value.id,
            name: issue.ai.predictedUnit.value.name
        };
        issue.status = "triaged";
        issue.updatedAt = new Date().toISOString();
        
        // Update AI final decision
        issue.ai.finalDecision = {
            category: issue.ai.predictedCategory.value,
            unitId: issue.ai.predictedUnit.value.id,
            unitName: issue.ai.predictedUnit.value.name,
            priority: issue.ai.predictedPriority.value,
            decidedBy: "ai",
            decidedAt: new Date().toISOString()
        };
        
        // Add timeline entry
        issue.timeline.unshift({
            status: "triaged",
            by: actor.name,
            date: new Date().toISOString(),
            note: `AI önerisi uygulandı: ${issue.ai.predictedUnit.value.name}`,
            isInternal: false
        });
        
        issues[index] = issue;
        this.saveIssuesToStorage(issues);
        
        activityRepository.logIssueChange(issue, "ai_applied", `AI önerisi uygulandı.`, actor, true);
        
        return issue;
    },

    /**
     * Override AI suggestion with human decision
     */
    async overrideAISuggestion(
        issueId: string, 
        override: {
            category: IssueCategory;
            unitId: string;
            unitName: string;
            priority: IssuePriority;
            reason: string;
        },
        actor: { name: string, role: string }
    ): Promise<Issue> {
        const issues = this.getIssuesFromStorage();
        const index = issues.findIndex(i => i.id === issueId);
        if (index === -1) throw new Error("Issue not found");
        
        const issue = issues[index];
        if (!issue.ai) throw new Error("No AI decision found");
        
        // Store original values for reference
        const originalCategory = issue.ai.predictedCategory.value;
        const originalUnitId = issue.ai.predictedUnit.value.id;
        const originalPriority = issue.ai.predictedPriority.value;
        
        // Apply human override
        issue.category = override.category;
        issue.priority = override.priority;
        issue.assignedUnit = {
            id: override.unitId,
            name: override.unitName
        };
        issue.status = "triaged";
        issue.updatedAt = new Date().toISOString();
        
        // Update AI final decision with override
        issue.ai.finalDecision = {
            category: override.category,
            unitId: override.unitId,
            unitName: override.unitName,
            priority: override.priority,
            decidedBy: "human",
            decidedAt: new Date().toISOString(),
            humanOverride: {
                byRole: actor.role,
                byName: actor.name,
                reason: override.reason,
                originalCategory,
                originalUnitId,
                originalPriority,
                timestamp: new Date().toISOString()
            }
        };
        
        // Add timeline entry
        issue.timeline.unshift({
            status: "triaged",
            by: actor.name,
            date: new Date().toISOString(),
            note: `AI önerisi düzeltildi: ${override.unitName} (Sebep: ${override.reason})`,
            isInternal: false
        });
        
        issues[index] = issue;
        this.saveIssuesToStorage(issues);
        
        activityRepository.logIssueChange(issue, "ai_overridden", `AI önerisi manuel olarak değiştirildi.`, actor, true);
        
        return issue;
    },

    /**
     * Re-run AI analysis on an issue
     */
    async rerunAIAnalysis(issueId: string): Promise<Issue> {
        const issues = this.getIssuesFromStorage();
        const index = issues.findIndex(i => i.id === issueId);
        if (index === -1) throw new Error("Issue not found");
        
        const issue = issues[index];
        
        // Generate new AI decision
        const newAiDecision = generateAIDecision({
            description: issue.description,
            category: issue.category,
            location: issue.location,
            hasPhoto: issue.media.photos.length > 0,
            photoCount: issue.media.photos.length
        });
        
        issue.ai = newAiDecision;
        issue.updatedAt = new Date().toISOString();
        
        // Add timeline entry
        issue.timeline.unshift({
            status: issue.status,
            by: "AI Sistemi",
            date: new Date().toISOString(),
            note: `AI analizi yeniden çalıştırıldı: %${Math.round(newAiDecision.overallConfidence * 100)} güvenirlik`,
            isInternal: true
        });
        
        issues[index] = issue;
        this.saveIssuesToStorage(issues);
        
        return issue;
    }
};
