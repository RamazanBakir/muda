"use client";

import { useEffect, useState } from "react";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { useSession } from "@/features/auth";
import { useRouter } from "next/navigation";
import { aiRepository, AIMetrics, AI_MODEL_INFO } from "@/features/ai";
import { ConfidenceMeter } from "@/features/ai/ui";
import { cn } from "@/shared/lib/cn";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
    Sparkles,
    TrendingUp,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    RefreshCw,
    Cpu,
    Activity,
    BarChart3,
    ArrowRight,
    Zap,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
    water_sewer: "Su & Kanalizasyon",
    transportation: "Ulaşım & Yol",
    parks: "Park & Bahçeler",
    waste: "Temizlik & Atık",
};

export default function AIMetricsPage() {
    const { session } = useSession();
    const router = useRouter();
    const [metrics, setMetrics] = useState<AIMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && session.role !== "call_center" && session.role !== "unit") {
            router.push("/dashboard");
        }
    }, [session, router]);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            const data = await aiRepository.getMetrics();
            setMetrics(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, []);

    if (!session || (session.role !== "call_center" && session.role !== "unit")) return null;

    return (
        <Container className="pb-16">
            <PageHeader
                title="AI Sistem Durumu"
                description="Yapay zekâ yönlendirme sistemi performans metrikleri ve analiz"
                actions={
                    <Button variant="outline" size="sm" onClick={loadMetrics} className="gap-1.5">
                        <RefreshCw size={14} />
                        Yenile
                    </Button>
                }
            />

            {/* Model Info Card */}
            <div className={cn(
                "mt-6 p-4 rounded-lg",
                "bg-gradient-to-r from-[hsl(var(--blue-1))] to-[hsl(var(--surface))]",
                "border border-[hsl(var(--blue-3))]"
            )}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--blue-6))] flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[hsl(var(--neutral-11))]">
                                {AI_MODEL_INFO.version}
                            </h3>
                            <p className="text-xs text-[hsl(var(--neutral-7))]">
                                Son güncelleme: {AI_MODEL_INFO.lastUpdated}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--green-2))] text-[hsl(var(--green-8))] text-xs font-medium">
                            <Activity size={10} />
                            Aktif
                        </span>
                        {AI_MODEL_INFO.capabilities.map((cap) => (
                            <span
                                key={cap}
                                className="px-2 py-1 rounded-full bg-[hsl(var(--blue-2))] text-[hsl(var(--blue-8))] text-xs font-medium"
                            >
                                {cap === "category_classification" && "Kategori"}
                                {cap === "unit_routing" && "Yönlendirme"}
                                {cap === "priority_scoring" && "Önceliklendirme"}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                    ))}
                </div>
            ) : metrics ? (
                <>
                    {/* Primary Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-[hsl(var(--blue-6))] mb-3">
                                <Sparkles size={16} />
                                <span className="text-xs font-medium uppercase tracking-wide">Bugün</span>
                            </div>
                            <p className="text-3xl font-bold text-[hsl(var(--neutral-11))]">
                                {metrics.totalRoutedToday}
                            </p>
                            <p className="text-xs text-[hsl(var(--neutral-7))] mt-1">
                                Yönlendirilen talep
                            </p>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-[hsl(var(--blue-6))] mb-3">
                                <BarChart3 size={16} />
                                <span className="text-xs font-medium uppercase tracking-wide">Haftalık</span>
                            </div>
                            <p className="text-3xl font-bold text-[hsl(var(--neutral-11))]">
                                {metrics.totalRoutedWeek}
                            </p>
                            <p className="text-xs text-[hsl(var(--neutral-7))] mt-1">
                                Toplam yönlendirme
                            </p>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-[hsl(var(--green-6))] mb-3">
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-medium uppercase tracking-wide">Kabul</span>
                            </div>
                            <p className="text-3xl font-bold text-[hsl(var(--green-7))]">
                                %{Math.round(metrics.acceptanceRate * 100)}
                            </p>
                            <p className="text-xs text-[hsl(var(--neutral-7))] mt-1">
                                Kabul oranı
                            </p>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-[hsl(var(--amber-6))] mb-3">
                                <XCircle size={16} />
                                <span className="text-xs font-medium uppercase tracking-wide">Düzeltme</span>
                            </div>
                            <p className="text-3xl font-bold text-[hsl(var(--amber-7))]">
                                %{Math.round(metrics.overrideRate * 100)}
                            </p>
                            <p className="text-xs text-[hsl(var(--neutral-7))] mt-1">
                                Manuel düzeltme
                            </p>
                        </Card>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-[hsl(var(--neutral-7))] uppercase tracking-wide">
                                    Ortalama Güvenirlik
                                </span>
                                <ConfidenceMeter value={metrics.avgConfidence} size="sm" />
                            </div>
                            <div className="mt-2">
                                <ProgressBar 
                                    value={metrics.avgConfidence * 100} 
                                    size="sm"
                                    showLabels={false}
                                />
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-[hsl(var(--amber-6))] mb-3">
                                <AlertTriangle size={16} />
                                <span className="text-xs font-medium uppercase tracking-wide">
                                    Düşük Güvenirlik
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-[hsl(var(--neutral-11))]">
                                %{Math.round(metrics.lowConfidenceRate * 100)}
                            </p>
                            <p className="text-xs text-[hsl(var(--neutral-7))] mt-1">
                                &lt;60% güvenirlikli tahminler
                            </p>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-[hsl(var(--blue-6))] mb-3">
                                <Zap size={16} />
                                <span className="text-xs font-medium uppercase tracking-wide">
                                    İşlem Süresi
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-[hsl(var(--neutral-11))]">
                                {metrics.avgProcessingTimeMs}ms
                            </p>
                            <p className="text-xs text-[hsl(var(--neutral-7))] mt-1">
                                Ortalama analiz süresi
                            </p>
                        </Card>
                    </div>

                    {/* Confusion Pairs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Card className="p-4">
                            <h3 className="text-sm font-semibold text-[hsl(var(--neutral-11))] mb-4 flex items-center gap-2">
                                <TrendingUp size={16} className="text-[hsl(var(--amber-6))]" />
                                En Çok Karıştırılan Kategoriler
                            </h3>
                            <div className="space-y-3">
                                {metrics.confusionPairs.map((pair, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--neutral-2))]"
                                    >
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-[hsl(var(--neutral-9))]">
                                                {CATEGORY_LABELS[pair.category1]}
                                            </span>
                                            <ArrowRight size={12} className="text-[hsl(var(--neutral-6))]" />
                                            <span className="font-medium text-[hsl(var(--neutral-9))]">
                                                {CATEGORY_LABELS[pair.category2]}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-[hsl(var(--amber-7))] bg-[hsl(var(--amber-2))] px-2 py-1 rounded">
                                            {pair.count} kez
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Recent Feedback */}
                        <Card className="p-4">
                            <h3 className="text-sm font-semibold text-[hsl(var(--neutral-11))] mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-[hsl(var(--blue-6))]" />
                                Son Geri Bildirimler
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {metrics.recentFeedback.length === 0 ? (
                                    <p className="text-sm text-[hsl(var(--neutral-6))] text-center py-4">
                                        Henüz geri bildirim yok
                                    </p>
                                ) : (
                                    metrics.recentFeedback.map((feedback) => (
                                        <div
                                            key={feedback.id}
                                            className={cn(
                                                "p-3 rounded-lg border",
                                                feedback.accepted
                                                    ? "bg-[hsl(var(--green-1))] border-[hsl(var(--green-3))]"
                                                    : "bg-[hsl(var(--amber-1))] border-[hsl(var(--amber-3))]"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {feedback.accepted ? (
                                                        <CheckCircle2 size={14} className="text-[hsl(var(--green-7))]" />
                                                    ) : (
                                                        <XCircle size={14} className="text-[hsl(var(--amber-7))]" />
                                                    )}
                                                    <span className="text-xs font-medium text-[hsl(var(--neutral-9))]">
                                                        {feedback.issueId}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-[hsl(var(--neutral-6))]">
                                                    {formatDistanceToNow(new Date(feedback.createdAt), {
                                                        addSuffix: true,
                                                        locale: tr,
                                                    })}
                                                </span>
                                            </div>
                                            {feedback.overrideReason && (
                                                <p className="text-xs text-[hsl(var(--neutral-7))] mt-1">
                                                    Sebep: {feedback.overrideReason}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Info Banner */}
                    <div className={cn(
                        "mt-6 p-4 rounded-lg",
                        "bg-[hsl(var(--neutral-2))] border border-[hsl(var(--neutral-4))]"
                    )}>
                        <p className="text-xs text-[hsl(var(--neutral-7))] text-center">
                            Bu metrikler demo amaçlıdır. Gerçek bir sistemde, metrikler backend API'den alınacaktır.
                            <br />
                            AI modeli, kullanıcı geri bildirimleri ile sürekli olarak iyileştirilmektedir.
                        </p>
                    </div>
                </>
            ) : (
                <Card className="p-8 text-center mt-6">
                    <AlertTriangle className="w-12 h-12 text-[hsl(var(--amber-6))] mx-auto mb-3" />
                    <p className="text-sm text-[hsl(var(--neutral-7))]">
                        Metrikler yüklenirken bir hata oluştu.
                    </p>
                    <Button variant="outline" size="sm" onClick={loadMetrics} className="mt-4">
                        Tekrar Dene
                    </Button>
                </Card>
            )}
        </Container>
    );
}

