import { Issue, IssueStatus, IssuePriority, IssueCategory, AssignedTo } from "../model/types";
import { UserRole } from "@/features/auth/model/types";
import { activityRepository } from "@/features/activity";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "muda_issues";

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
        ]
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
        reporter: { type: "mukhtar", id: "mukhtar-1", name: "Mehmet Demir" },
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
        ]
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
            { status: "in_progress", by: "Su ve Kanalizasyon", date: new Date(Date.now() - 1000 * 60 * 10).toISOString() }
        ]
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
        } else if (filters.role === "mukhtar" && filters.neighborhoodId) {
            issues = issues.filter(i => i.location.neighborhood?.toLowerCase() === filters.neighborhoodId?.toLowerCase() || i.reporter.type === "mukhtar");
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

    async createIssue(issueData: Omit<Issue, "id" | "createdAt" | "updatedAt" | "timeline" | "status" | "media">): Promise<Issue> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const issues = this.getIssuesFromStorage();

        const newIssue: Issue = {
            ...issueData,
            id: `ISS-${1000 + issues.length + 1}`,
            status: "created",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            media: { photos: [] },
            timeline: [{
                status: "created",
                by: issueData.reporter.name,
                date: new Date().toISOString()
            }]
        };

        issues.unshift(newIssue);
        this.saveIssuesToStorage(issues);

        activityRepository.logIssueChange(newIssue, "issue_created", "Yeni bildirim oluşturuldu.", { name: newIssue.reporter.name, role: newIssue.reporter.type }, true);

        return newIssue;
    }
};
