"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/shared/ui/card";
import { useSession } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart, PieChart, Activity, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface ProgressBarProps {
    value: number;
    label: string;
    subLabel: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'muted';
}

function ProgressBar({ value, label, subLabel, variant = 'primary' }: ProgressBarProps) {
    const barColors = {
        primary: "bg-primary",
        secondary: "bg-secondary-fg",
        tertiary: "bg-success",
        muted: "bg-muted-fg"
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium items-end">
                <span className="text-fg">{label}</span>
                <span className="text-muted-fg">{subLabel}</span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColors[variant])}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

interface StatusCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    variant: 'default' | 'primary' | 'warning' | 'success';
    percentage: string;
}

function StatusCard({ label, value, icon, variant, percentage }: StatusCardProps) {
    const styles = {
        default: { bg: "bg-surface-2", text: "text-muted-fg", bar: "bg-muted-fg" },
        primary: { bg: "bg-secondary", text: "text-primary", bar: "bg-primary" },
        warning: { bg: "bg-warning/5", text: "text-warning", bar: "bg-warning" },
        success: { bg: "bg-success/5", text: "text-success", bar: "bg-success" }
    };

    return (
        <div className={cn("p-5 rounded-xl border border-border space-y-3 transition-all hover:shadow-md", styles[variant].bg)}>
            <div className="flex items-center justify-between">
                <span className={cn("w-5 h-5", styles[variant].text)}>{icon}</span>
                <span className="text-xs font-medium text-muted-fg">{label}</span>
            </div>
            <div className="text-3xl font-bold text-fg leading-none">{value}</div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", styles[variant].bar)} style={{ width: percentage }} />
            </div>
        </div>
    );
}

export default function UnitAnalyticsPage() {
    const { session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session && session.role !== 'unit') {
            router.push('/dashboard');
        }
    }, [session]);

    if (!session) return null;

    return (
        <Container className="space-y-8 pb-16 animate-in fade-in duration-500">
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

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="p-5">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <PieChart className="w-5 h-5 text-primary" />
                            Kategori Dağılımı
                        </CardTitle>
                        <CardDescription className="text-sm">Birim sorumluluğundaki taleplerin türlerine göre dağılımı.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 pb-6 space-y-5">
                        <ProgressBar value={45} label="Su Arızası" subLabel="134 Kayıt (%45)" variant="primary" />
                        <ProgressBar value={20} label="Kanalizasyon" subLabel="58 Kayıt (%20)" variant="secondary" />
                        <ProgressBar value={15} label="Mazgal Bakım" subLabel="42 Kayıt (%15)" variant="tertiary" />
                        <ProgressBar value={20} label="Diğer" subLabel="55 Kayıt (%20)" variant="muted" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-5">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <BarChart className="w-5 h-5 text-primary" />
                            Haftalık Çözüm Performansı
                        </CardTitle>
                        <CardDescription className="text-sm">Günlük kapatılan talep sayısı (Son 7 Gün).</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[240px] flex items-end justify-between gap-3 px-5 pb-6">
                        {[12, 28, 18, 35, 42, 24, 38].map((h, i) => (
                            <div key={i} className="w-full flex flex-col justify-end group h-full relative">
                                <div
                                    className="w-full bg-secondary hover:bg-primary/20 rounded-lg transition-all duration-300 relative"
                                    style={{ height: `${(h / 50) * 100}%` }}
                                >
                                    <div className="h-full w-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity rounded-md" />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-fg text-surface text-xs font-medium py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10">
                                        {h} Talep
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-center text-muted-fg mt-3">
                                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="p-5 border-b border-border">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Talep Durum Özeti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatusCard
                                label="Yeni Gelen"
                                value="24"
                                icon={<AlertCircle className="w-5 h-5" />}
                                variant="default"
                                percentage="10%"
                            />
                            <StatusCard
                                label="İşlemde"
                                value="45"
                                icon={<Clock className="w-5 h-5" />}
                                variant="primary"
                                percentage="45%"
                            />
                            <StatusCard
                                label="Beklemede"
                                value="12"
                                icon={<AlertCircle className="w-5 h-5" />}
                                variant="warning"
                                percentage="20%"
                            />
                            <StatusCard
                                label="Çözüldü"
                                value="856"
                                icon={<CheckCircle2 className="w-5 h-5" />}
                                variant="success"
                                percentage="100%"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}

