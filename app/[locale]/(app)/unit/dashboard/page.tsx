"use client";

import Link from "next/link";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useSession } from "@/features/auth";
import { STRINGS } from "@/shared/config/strings";
import { issueRepository, Issue } from "@/features/issue";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge, PriorityBadge } from "@/shared/ui/badge/status-badge";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { ArrowRight, BellRing } from "lucide-react";

export default function UnitDashboardPage() {
    const { session } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({ open: 0, critical: 0, resolved: 0 });
    const [recentIssues, setRecentIssues] = useState<Issue[]>([]);

    useEffect(() => {
        if (session && session.role !== 'unit') {
            router.push('/dashboard'); // protect route
            return;
        }

        const load = async () => {
            const issues = await issueRepository.getIssues({ unitId: session?.unitId, role: 'unit' });
            setStats({
                open: issues.filter(i => ['created', 'triaged', 'in_progress'].includes(i.status)).length,
                critical: issues.filter(i => i.priority === 'high' && i.status !== 'resolved').length,
                resolved: issues.filter(i => i.status === 'resolved').length
            });
            // Sort by date desc and take 5
            const recent = [...issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
            setRecentIssues(recent);
        };
        load();
        const interval = setInterval(load, 10000); // Poll for updates
        return () => clearInterval(interval);
    }, [session]);

    if (!session || session.role !== 'unit') return null;

    return (
        <Container className="space-y-8 animate-in fade-in pb-12">
            <PageHeader
                title={`${session.name}`}
                description="Birim Operasyon Paneli"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push('/unit/analytics')}>Analizler</Button>
                        <Button onClick={() => router.push('/map')}>Harita & Canlı Takip</Button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-transparent border-blue-100 dark:border-blue-800 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold uppercase text-blue-700 dark:text-blue-300 tracking-wider">Açık İşler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-800 dark:text-slate-100">{stats.open}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Müdahale/Çözüm bekleyen
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-transparent border-red-100 dark:border-red-800 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold uppercase text-red-700 dark:text-red-300 tracking-wider">Kritik & Acil</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-800 dark:text-slate-100">{stats.critical}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-red-600 dark:text-red-400 font-medium">
                            Öncelikli aksiyon gerekli
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-transparent border-green-100 dark:border-green-800 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold uppercase text-green-700 dark:text-green-300 tracking-wider">Tamamlanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-800 dark:text-slate-100">{stats.resolved}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Toplam çözülen talep
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {/* Quick List - Expanded to take more space */}
                <Card className="md:col-span-2 lg:col-span-3 h-full flex flex-col border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="border-b bg-muted/5 pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Son Gelen İş Akışı</CardTitle>
                                <CardDescription>Birim sorumluluğuna atanan en yeni talepler.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/issues')} className="text-xs">
                                Tümünü Listele <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <div className="divide-y divide-border">
                            {recentIssues.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground italic">Henüz kayıt yok.</div>
                            ) : (
                                recentIssues.map(i => (
                                    <div key={i.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => router.push(`/issues/${i.id}`)}>
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-1">
                                                <StatusBadge status={i.status} showIcon />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm group-hover:text-primary transition-colors">{i.title}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5 flex gap-2 items-center">
                                                    <span>{i.location.district} / {i.location.neighborhood}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{formatDistanceToNow(new Date(i.createdAt), { addSuffix: true, locale: tr })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <PriorityBadge priority={i.priority} />
                                            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{i.id.slice(-6)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Unit Actions / Info */}
                <Card className="h-full border-amber-200 dark:border-amber-900 shadow-sm flex flex-col bg-amber-50/30 dark:bg-amber-950/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-amber-900 dark:text-amber-100">
                            <BellRing className="w-4 h-4 text-amber-600" />
                            Duyurular & Emirler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        <div className="bg-white/60 dark:bg-black/20 p-3 rounded border border-amber-100 dark:border-amber-900 text-sm text-amber-900 dark:text-amber-100/90 shadow-sm">
                            <strong>Nöbetçi Ekip:</strong> Bu hafta sonu su arıza ekibi tam kadro sahada olacaktır.
                        </div>
                        <div className="bg-white/60 dark:bg-black/20 p-3 rounded border border-amber-100 dark:border-amber-900 text-sm text-amber-900 dark:text-amber-100/90 shadow-sm">
                            <strong>Sistem:</strong> Canlı takip modülü aktiftir. Lütfen tabletlerinizi "Sürekli Konum" moduna alınız.
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto border-t border-amber-200/50 pt-4">
                        <Button size="sm" variant="outline" className="w-full bg-white/50 hover:bg-white border-amber-200 text-amber-800">Arşiv</Button>
                    </CardFooter>
                </Card>
            </div>
        </Container>
    );
}
