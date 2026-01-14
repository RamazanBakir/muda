"use client";

import { useEffect, useState, useMemo } from "react";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { useSession } from "@/features/auth";
import { useRouter } from "next/navigation";
import { issueRepository, Issue } from "@/features/issue";
import { AIBadge, AIInsightCard, AIOverrideDialog, AIOverrideResult } from "@/features/ai/ui";
import { aiRepository } from "@/features/ai";
import { cn } from "@/shared/lib/cn";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { StatusBadge, PriorityBadge } from "@/shared/ui/badge/status-badge";
import {
    Search,
    Filter,
    Sparkles,
    X,
    ChevronRight,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    Inbox,
} from "lucide-react";

type FilterPreset = "all" | "low_confidence" | "unassigned" | "needs_info" | "high_priority";

const CATEGORY_LABELS: Record<string, string> = {
    water_sewer: "Su & Kanalizasyon",
    transportation: "Ulaşım & Yol",
    parks: "Park & Bahçeler",
    waste: "Temizlik & Atık",
};

export default function CallCenterTriagePage() {
    const { session } = useSession();
    const router = useRouter();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [filterPreset, setFilterPreset] = useState<FilterPreset>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [isRerunning, setIsRerunning] = useState(false);
    const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);

    useEffect(() => {
        if (session && session.role !== "call_center" && session.role !== "unit") {
            router.push("/dashboard");
        }
    }, [session, router]);

    const loadIssues = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await issueRepository.getIssues({
                role: session.role,
            });
            setIssues(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIssues();
        const interval = setInterval(loadIssues, 30000);
        return () => clearInterval(interval);
    }, [session]);

    // Apply filters
    const filteredIssues = useMemo(() => {
        let result = [...issues];

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (i) =>
                    i.title.toLowerCase().includes(q) ||
                    i.description.toLowerCase().includes(q) ||
                    i.id.toLowerCase().includes(q)
            );
        }

        // Preset filters
        switch (filterPreset) {
            case "low_confidence":
                result = result.filter((i) => i.ai && i.ai.overallConfidence < 0.6);
                break;
            case "unassigned":
                result = result.filter((i) => i.status === "created");
                break;
            case "needs_info":
                result = result.filter(
                    (i) =>
                        i.ai &&
                        i.ai.suggestedActions.some((a) => a.type === "request_info")
                );
                break;
            case "high_priority":
                result = result.filter((i) => i.priority === "high");
                break;
        }

        return result;
    }, [issues, filterPreset, searchQuery]);

    // Handle AI apply
    const handleApplyAI = async () => {
        if (!selectedIssue || !session) return;
        setIsApplying(true);
        try {
            const updated = await issueRepository.applyAISuggestion(selectedIssue.id, {
                name: session.name,
                role: session.role,
            });

            // Record feedback
            await aiRepository.recordFeedback({
                issueId: selectedIssue.id,
                accepted: true,
                byRole: session.role,
                byName: session.name,
            });

            setSelectedIssue(updated);
            loadIssues();
        } finally {
            setIsApplying(false);
        }
    };

    // Handle AI override
    const handleOverride = async (result: AIOverrideResult) => {
        if (!selectedIssue || !session) return;
        setIsApplying(true);
        try {
            const updated = await issueRepository.overrideAISuggestion(
                selectedIssue.id,
                {
                    category: result.category,
                    unitId: result.unitId,
                    unitName: result.unitName,
                    priority: result.priority,
                    reason: result.reason,
                },
                {
                    name: session.name,
                    role: session.role,
                }
            );

            // Record feedback
            await aiRepository.recordFeedback({
                issueId: selectedIssue.id,
                accepted: false,
                overrideFields: {
                    category: result.category,
                    unitId: result.unitId,
                    priority: result.priority,
                },
                overrideReason: result.reason,
                byRole: session.role,
                byName: session.name,
            });

            setSelectedIssue(updated);
            setOverrideDialogOpen(false);
            loadIssues();
        } finally {
            setIsApplying(false);
        }
    };

    // Handle AI rerun
    const handleRerun = async () => {
        if (!selectedIssue) return;
        setIsRerunning(true);
        try {
            const updated = await issueRepository.rerunAIAnalysis(selectedIssue.id);
            setSelectedIssue(updated);
            loadIssues();
        } finally {
            setIsRerunning(false);
        }
    };

    if (!session || (session.role !== "call_center" && session.role !== "unit")) return null;

    // Stats
    const stats = {
        total: issues.length,
        lowConfidence: issues.filter((i) => i.ai && i.ai.overallConfidence < 0.6).length,
        unassigned: issues.filter((i) => i.status === "created").length,
        highPriority: issues.filter((i) => i.priority === "high").length,
    };

    return (
        <Container className="pb-16">
            <PageHeader
                title="AI Triaj Merkezi"
                description="Yapay zekâ destekli bildirim yönlendirme ve önceliklendirme"
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <button
                    onClick={() => setFilterPreset("all")}
                    className={cn(
                        "p-4 rounded-lg text-left transition-all",
                        "bg-[hsl(var(--surface))] border",
                        filterPreset === "all"
                            ? "border-[hsl(var(--blue-5))] shadow-md"
                            : "border-[hsl(var(--neutral-4))] hover:border-[hsl(var(--neutral-5))]"
                    )}
                >
                    <Inbox className="w-5 h-5 text-[hsl(var(--blue-6))] mb-2" />
                    <p className="text-2xl font-bold text-[hsl(var(--neutral-11))]">{stats.total}</p>
                    <p className="text-xs text-[hsl(var(--neutral-7))]">Toplam Talep</p>
                </button>

                <button
                    onClick={() => setFilterPreset("low_confidence")}
                    className={cn(
                        "p-4 rounded-lg text-left transition-all",
                        "bg-[hsl(var(--surface))] border",
                        filterPreset === "low_confidence"
                            ? "border-[hsl(var(--amber-5))] shadow-md"
                            : "border-[hsl(var(--neutral-4))] hover:border-[hsl(var(--neutral-5))]"
                    )}
                >
                    <AlertTriangle className="w-5 h-5 text-[hsl(var(--amber-6))] mb-2" />
                    <p className="text-2xl font-bold text-[hsl(var(--neutral-11))]">{stats.lowConfidence}</p>
                    <p className="text-xs text-[hsl(var(--neutral-7))]">Düşük Güvenirlik</p>
                </button>

                <button
                    onClick={() => setFilterPreset("unassigned")}
                    className={cn(
                        "p-4 rounded-lg text-left transition-all",
                        "bg-[hsl(var(--surface))] border",
                        filterPreset === "unassigned"
                            ? "border-[hsl(var(--blue-5))] shadow-md"
                            : "border-[hsl(var(--neutral-4))] hover:border-[hsl(var(--neutral-5))]"
                    )}
                >
                    <Clock className="w-5 h-5 text-[hsl(var(--blue-6))] mb-2" />
                    <p className="text-2xl font-bold text-[hsl(var(--neutral-11))]">{stats.unassigned}</p>
                    <p className="text-xs text-[hsl(var(--neutral-7))]">Bekleyen</p>
                </button>

                <button
                    onClick={() => setFilterPreset("high_priority")}
                    className={cn(
                        "p-4 rounded-lg text-left transition-all",
                        "bg-[hsl(var(--surface))] border",
                        filterPreset === "high_priority"
                            ? "border-[hsl(var(--red-5))] shadow-md"
                            : "border-[hsl(var(--neutral-4))] hover:border-[hsl(var(--neutral-5))]"
                    )}
                >
                    <Sparkles className="w-5 h-5 text-[hsl(var(--red-6))] mb-2" />
                    <p className="text-2xl font-bold text-[hsl(var(--neutral-11))]">{stats.highPriority}</p>
                    <p className="text-xs text-[hsl(var(--neutral-7))]">Yüksek Öncelik</p>
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3 mt-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--neutral-6))]" />
                    <Input
                        placeholder="Talep ara (ID, başlık, açıklama...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select
                    value={filterPreset}
                    onChange={(e) => setFilterPreset(e.target.value as FilterPreset)}
                    className="w-48"
                >
                    <option value="all">Tüm Talepler</option>
                    <option value="low_confidence">Düşük Güvenirlik</option>
                    <option value="unassigned">Bekleyen</option>
                    <option value="needs_info">Bilgi Gereken</option>
                    <option value="high_priority">Yüksek Öncelik</option>
                </Select>
                <Button variant="ghost" size="sm" onClick={loadIssues} className="gap-1.5">
                    <RefreshCw size={14} />
                    Yenile
                </Button>
            </div>

            {/* Main Content - Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                {/* Issue List */}
                <div className="lg:col-span-2 space-y-2">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))
                    ) : filteredIssues.length === 0 ? (
                        <EmptyState
                            icon={<Inbox className="w-12 h-12" />}
                            title="Talep Bulunamadı"
                            description="Seçilen kriterlere uygun talep yok."
                        />
                    ) : (
                        filteredIssues.map((issue) => (
                            <button
                                key={issue.id}
                                onClick={() => setSelectedIssue(issue)}
                                className={cn(
                                    "w-full p-4 rounded-lg text-left transition-all",
                                    "bg-[hsl(var(--surface))] border",
                                    selectedIssue?.id === issue.id
                                        ? "border-[hsl(var(--blue-5))] shadow-md ring-2 ring-[hsl(var(--blue-5)/0.2)]"
                                        : "border-[hsl(var(--neutral-4))] hover:border-[hsl(var(--neutral-5))]"
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-medium text-[hsl(var(--neutral-6))]">
                                                {issue.id}
                                            </span>
                                            <StatusBadge status={issue.status} />
                                            <PriorityBadge priority={issue.priority} />
                                        </div>
                                        <h3 className="font-medium text-sm text-[hsl(var(--neutral-11))] truncate">
                                            {issue.title}
                                        </h3>
                                        <p className="text-xs text-[hsl(var(--neutral-7))] line-clamp-1 mt-1">
                                            {issue.description}
                                        </p>
                                    </div>
                                    {issue.ai && (
                                        <AIBadge
                                            confidence={issue.ai.overallConfidence}
                                            decidedBy={issue.ai.finalDecision?.decidedBy}
                                            size="xs"
                                        />
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[hsl(var(--neutral-3))]">
                                    <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--neutral-6))]">
                                        <MapPin size={10} />
                                        {issue.location.neighborhood || issue.location.district}
                                    </div>
                                    <span className="text-[10px] text-[hsl(var(--neutral-6))]">
                                        {formatDistanceToNow(new Date(issue.createdAt), {
                                            addSuffix: true,
                                            locale: tr,
                                        })}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* AI Insight Panel */}
                <div className="lg:col-span-3">
                    {selectedIssue ? (
                        <div className="space-y-4 sticky top-4">
                            {/* Issue Detail Header */}
                            <Card className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-[hsl(var(--neutral-6))]">
                                                {selectedIssue.id}
                                            </span>
                                            <StatusBadge status={selectedIssue.status} showIcon />
                                            <PriorityBadge priority={selectedIssue.priority} showIcon />
                                        </div>
                                        <h2 className="text-lg font-semibold text-[hsl(var(--neutral-11))]">
                                            {selectedIssue.title}
                                        </h2>
                                        <p className="text-sm text-[hsl(var(--neutral-8))] mt-2 line-clamp-3">
                                            {selectedIssue.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-3 text-xs text-[hsl(var(--neutral-7))]">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {selectedIssue.location.district} / {selectedIssue.location.neighborhood}
                                            </span>
                                            <span>•</span>
                                            <span>{selectedIssue.reporter.name}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedIssue(null)}
                                        className="flex-shrink-0"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            </Card>

                            {/* AI Insight Card */}
                            {selectedIssue.ai ? (
                                <AIInsightCard
                                    aiDecision={selectedIssue.ai}
                                    onApply={
                                        selectedIssue.status === "created" ? handleApplyAI : undefined
                                    }
                                    onOverride={
                                        selectedIssue.status === "created"
                                            ? () => setOverrideDialogOpen(true)
                                            : undefined
                                    }
                                    onRerun={handleRerun}
                                    isApplying={isApplying}
                                    isRerunning={isRerunning}
                                    readOnly={selectedIssue.status !== "created"}
                                />
                            ) : (
                                <Card className="p-6 text-center">
                                    <Sparkles className="w-8 h-8 text-[hsl(var(--neutral-5))] mx-auto mb-2" />
                                    <p className="text-sm text-[hsl(var(--neutral-7))]">
                                        Bu talep için AI analizi mevcut değil.
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleRerun}
                                        isLoading={isRerunning}
                                        className="mt-4"
                                    >
                                        <Sparkles size={14} className="mr-1.5" />
                                        AI Analizi Çalıştır
                                    </Button>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            {selectedIssue.status !== "created" && (
                                <div className={cn(
                                    "p-4 rounded-lg",
                                    "bg-[hsl(var(--green-1))] border border-[hsl(var(--green-3))]"
                                )}>
                                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--green-8))]">
                                        <CheckCircle2 size={16} />
                                        <span className="font-medium">
                                            Bu talep zaten yönlendirilmiş
                                        </span>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--green-7))] mt-1">
                                        Atanan birim: {selectedIssue.assignedUnit?.name || "Belirlenmedi"}
                                    </p>
                                </div>
                            )}

                            {/* View Full Detail Link */}
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                onClick={() => router.push(`/issues/${selectedIssue.id}`)}
                            >
                                <span>Detaylı Görüntüle</span>
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--blue-1))] flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-[hsl(var(--blue-6))]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[hsl(var(--neutral-11))] mb-2">
                                AI Triaj Paneli
                            </h3>
                            <p className="text-sm text-[hsl(var(--neutral-7))] max-w-sm mx-auto">
                                Soldaki listeden bir talep seçerek AI önerisini görüntüleyin ve
                                hızlıca yönlendirme yapın.
                            </p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Override Dialog */}
            {selectedIssue?.ai && (
                <AIOverrideDialog
                    open={overrideDialogOpen}
                    onClose={() => setOverrideDialogOpen(false)}
                    aiDecision={selectedIssue.ai}
                    onOverride={handleOverride}
                    isLoading={isApplying}
                />
            )}
        </Container>
    );
}

