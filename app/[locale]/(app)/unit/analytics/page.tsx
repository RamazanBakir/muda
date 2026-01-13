"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/shared/ui/card";
import { useSession } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart, PieChart, Activity, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";

// Simple progress bar component for charts
const ProgressBar = ({ value, color = "bg-primary", label, subLabel }: { value: number, color?: string, label: string, subLabel: string }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest items-end">
            <span className="text-neutral-900 dark:text-neutral-50">{label}</span>
            <span className="text-muted-fg opacity-60">{subLabel}</span>
        </div>
        <div className="h-3 bg-surface-2 rounded-xl overflow-hidden border border-border/40 p-[2px]">
            <div
                className={cn("h-full rounded-lg transition-all duration-1000 ease-out shadow-sm", color)}
                style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);

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
        <Container className="space-y-12 pb-24 animate-in fade-in duration-700">
            <PageHeader
                title="Birim Analizleri"
                description="Performans ve talep dağılım grafikleri."
                actions={
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-fg bg-surface px-4 py-2.5 rounded-xl border-2 border-border shadow-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" strokeWidth={3} />
                        Son 30 Gün
                    </div>
                }
            />

            <div className="grid gap-10 md:grid-cols-2">
                <Card className="border-none shadow-xl">
                    <CardHeader className="p-8">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <PieChart className="w-6 h-6 text-primary" />
                            Kategori Dağılımı
                        </CardTitle>
                        <CardDescription className="text-base">Birim sorumluluğundaki taleplerin türlerine göre dağılımı.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-10 space-y-8">
                        <ProgressBar value={45} label="Su Arızası" subLabel="134 Kayıt (%45)" color="bg-blue-500 shadow-blue-500/20" />
                        <ProgressBar value={20} label="Kanalizasyon" subLabel="58 Kayıt (%20)" color="bg-indigo-500 shadow-indigo-500/20" />
                        <ProgressBar value={15} label="Mazgal Bakım" subLabel="42 Kayıt (%15)" color="bg-cyan-500 shadow-cyan-500/20" />
                        <ProgressBar value={20} label="Diğer" subLabel="55 Kayıt (%20)" color="bg-neutral-400 shadow-neutral-400/20" />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl">
                    <CardHeader className="p-8">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <BarChart className="w-6 h-6 text-primary" />
                            Haftalık Çözüm Performansı
                        </CardTitle>
                        <CardDescription className="text-base">Günlük kapatılan talep sayısı (Son 7 Gün).</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px] flex items-end justify-between gap-4 px-8 pb-10 mt-4">
                        {[12, 28, 18, 35, 42, 24, 38].map((h, i) => (
                            <div key={i} className="w-full flex flex-col justify-end group h-full relative">
                                <div
                                    className="w-full bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-300 relative border-2 border-transparent hover:border-primary/20"
                                    style={{ height: `${(h / 50) * 100}%` }}
                                >
                                    <div className="h-full w-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity rounded-[10px] scale-x-[0.3] group-hover:scale-x-100 origin-center duration-500" />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900 text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-1 whitespace-nowrap z-10">
                                        {h} Talep
                                    </div>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-center text-muted-fg mt-4 opacity-60">
                                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="md:col-span-2 border-none shadow-xl overflow-hidden">
                    <CardHeader className="p-8 border-b-2 border-border/30 bg-surface-2">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            Talep Durum Özeti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: "Yeni Gelen", val: "24", icon: AlertCircle, color: "text-neutral-500", bg: "bg-surface-2", bar: "bg-neutral-400", pct: "10%" },
                                { label: "İşlemde", val: "45", icon: Clock, color: "text-blue-600", bg: "bg-blue-50/50 dark:bg-blue-900/10", bar: "bg-blue-500", pct: "45%" },
                                { label: "Beklemede", val: "12", icon: AlertCircle, color: "text-warning", bg: "bg-warning/5", bar: "bg-warning", pct: "20%" },
                                { label: "Çözüldü", val: "856", icon: CheckCircle2, color: "text-success", bg: "bg-success/5", bar: "bg-success", pct: "100%" }
                            ].map((s, idx) => (
                                <div key={idx} className={cn("p-6 rounded-[32px] border-2 border-border/40 space-y-4 transition-all hover:scale-105 hover:shadow-lg", s.bg)}>
                                    <div className="flex items-center justify-between">
                                        <s.icon className={cn("w-5 h-5", s.color)} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-fg/60">{s.label}</span>
                                    </div>
                                    <div className="text-4xl font-black text-neutral-900 dark:text-neutral-50 leading-none">{s.val}</div>
                                    <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", s.bar)} style={{ width: s.pct }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Container>
    );
}

