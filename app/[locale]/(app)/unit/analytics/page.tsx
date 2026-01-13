"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/shared/ui/card";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { MetricCard } from "@/shared/ui/metric-card";
import { BarChart } from "@/shared/ui/bar-chart";
import { useSession } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart as BarChartIcon, PieChart, Activity, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const CATEGORY_DATA = [
    { label: "Su Arızası", value: 45, count: 134, variant: "primary" as const },
    { label: "Kanalizasyon", value: 20, count: 58, variant: "secondary" as const },
    { label: "Mazgal Bakım", value: 15, count: 42, variant: "success" as const },
    { label: "Diğer", value: 20, count: 55, variant: "muted" as const }
];

const WEEKLY_DATA = [
    { label: "Pzt", value: 12 },
    { label: "Sal", value: 28 },
    { label: "Çar", value: 18 },
    { label: "Per", value: 35 },
    { label: "Cum", value: 42 },
    { label: "Cmt", value: 24 },
    { label: "Paz", value: 38 }
];

const STATUS_DATA = [
    { label: "Yeni Gelen", value: "24", icon: <AlertCircle className="w-5 h-5" />, variant: "default" as const, progress: 10 },
    { label: "İşlemde", value: "45", icon: <Clock className="w-5 h-5" />, variant: "primary" as const, progress: 45 },
    { label: "Beklemede", value: "12", icon: <AlertCircle className="w-5 h-5" />, variant: "warning" as const, progress: 20 },
    { label: "Çözüldü", value: "856", icon: <CheckCircle2 className="w-5 h-5" />, variant: "success" as const, progress: 100 }
];

export default function UnitAnalyticsPage() {
    const { session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session && session.role !== 'unit') {
            router.push('/dashboard');
        }
    }, [session, router]);

    if (!session) return null;

    return (
        <Container className="space-y-6 pb-16 animate-in fade-in duration-500">
            <PageHeader
                title="Birim Analizleri"
                description="Performans ve talep dağılım grafikleri."
                actions={
                    <div className="text-xs font-medium text-muted-fg bg-surface px-3 py-2 rounded-lg border border-border flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Son 30 Gün
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <PieChart className="w-4 h-4 text-primary" />
                            Kategori Dağılımı
                        </CardTitle>
                        <CardDescription className="text-xs">Taleplerin türlerine göre dağılımı</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-4">
                        {CATEGORY_DATA.map((item) => (
                            <ProgressBar
                                key={item.label}
                                value={item.value}
                                label={item.label}
                                subLabel={`${item.count} Kayıt (%${item.value})`}
                                variant={item.variant}
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <BarChartIcon className="w-4 h-4 text-primary" />
                            Haftalık Çözüm Performansı
                        </CardTitle>
                        <CardDescription className="text-xs">Günlük kapatılan talep sayısı</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <BarChart
                            data={WEEKLY_DATA}
                            height={180}
                            maxValue={50}
                            tooltipFormatter={(v) => `${v} Talep`}
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="p-4 border-b border-border">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Talep Durum Özeti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {STATUS_DATA.map((item) => (
                                <MetricCard
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                    icon={item.icon}
                                    variant={item.variant}
                                    progress={item.progress}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}
