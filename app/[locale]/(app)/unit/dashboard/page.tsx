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
import { ArrowRight, BellRing, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface StatCardProps {
    title: string;
    value: number;
    description: string;
    variant: 'primary' | 'danger' | 'success';
    icon: React.ReactNode;
}

function StatCard({ title, value, description, variant, icon }: StatCardProps) {
    const styles = {
        primary: "bg-secondary border-primary/10",
        danger: "bg-danger/5 border-danger/10",
        success: "bg-success/5 border-success/10"
    };
    const titleStyles = {
        primary: "text-primary",
        danger: "text-danger",
        success: "text-success"
    };
    const iconStyles = {
        primary: "text-primary",
        danger: "text-danger",
        success: "text-success"
    };

    return (
        <Card className={cn("border transition-all hover:shadow-md", styles[variant])}>
            <CardHeader className="pb-2">
                <CardTitle className={cn("text-xs font-semibold uppercase tracking-wider flex items-center gap-2", titleStyles[variant])}>
                    <span className={iconStyles[variant]}>{icon}</span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-fg">{value}</div>
                <p className="text-xs text-muted-fg mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}

export default function UnitDashboardPage() {
    const { session } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({ open: 0, critical: 0, resolved: 0 });
    const [recentIssues, setRecentIssues] = useState<Issue[]>([]);

    useEffect(() => {
        if (session && session.role !== 'unit') {
            router.push('/dashboard');
            return;
        }

        const load = async () => {
            const issues = await issueRepository.getIssues({ unitId: session?.unitId, role: 'unit' });
            setStats({
                open: issues.filter(i => ['created', 'triaged', 'in_progress'].includes(i.status)).length,
                critical: issues.filter(i => i.priority === 'high' && i.status !== 'resolved').length,
                resolved: issues.filter(i => i.status === 'resolved').length
            });
            const recent = [...issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
            setRecentIssues(recent);
        };
        load();
        const interval = setInterval(load, 10000);
        return () => clearInterval(interval);
    }, [session]);

    if (!session || session.role !== 'unit') return null;

    return (
        <Container className="space-y-6 animate-in fade-in pb-12">
            <PageHeader
                title={session.name}
                description="Birim Operasyon Paneli"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push('/unit/analytics')}>Analizler</Button>
                        <Button size="sm" onClick={() => router.push('/map')}>Harita & Canlı Takip</Button>
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Açık İşler"
                    value={stats.open}
                    description="Müdahale/Çözüm bekleyen"
                    variant="primary"
                    icon={<Clock className="w-3.5 h-3.5" />}
                />
                <StatCard
                    title="Kritik & Acil"
                    value={stats.critical}
                    description="Öncelikli aksiyon gerekli"
                    variant="danger"
                    icon={<AlertTriangle className="w-3.5 h-3.5" />}
                />
                <StatCard
                    title="Tamamlanan"
                    value={stats.resolved}
                    description="Toplam çözülen talep"
                    variant="success"
                    icon={<CheckCircle className="w-3.5 h-3.5" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                <Card className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
                    <CardHeader className="border-b border-border pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Son Gelen İş Akışı</CardTitle>
                                <CardDescription className="text-sm">Birim sorumluluğuna atanan en yeni talepler.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/issues')} className="text-xs">
                                Tümünü Listele <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <div className="divide-y divide-border">
                            {recentIssues.length === 0 ? (
                                <div className="p-8 text-center text-muted-fg italic text-sm">Henüz kayıt yok.</div>
                            ) : (
                                recentIssues.map(i => (
                                    <div key={i.id} className="flex items-center justify-between p-4 hover:bg-surface-2 transition-colors group cursor-pointer" onClick={() => router.push(`/issues/${i.id}`)}>
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-0.5">
                                                <StatusBadge status={i.status} showIcon />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-fg group-hover:text-primary transition-colors">{i.title}</div>
                                                <div className="text-xs text-muted-fg mt-0.5 flex gap-2 items-center">
                                                    <span>{i.location.district} / {i.location.neighborhood}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border"></span>
                                                    <span>{formatDistanceToNow(new Date(i.createdAt), { addSuffix: true, locale: tr })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <PriorityBadge priority={i.priority} />
                                            <span className="text-[10px] text-muted-fg font-mono bg-surface-2 px-1.5 py-0.5 rounded">{i.id.slice(-6)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full flex flex-col bg-warning/5 border-warning/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-warning-fg">
                            <BellRing className="w-4 h-4 text-warning" />
                            Duyurular & Emirler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        <div className="bg-surface p-3 rounded-lg border border-border text-sm text-fg">
                            <strong className="text-fg">Nöbetçi Ekip:</strong> <span className="text-muted-fg">Bu hafta sonu su arıza ekibi tam kadro sahada olacaktır.</span>
                        </div>
                        <div className="bg-surface p-3 rounded-lg border border-border text-sm text-fg">
                            <strong className="text-fg">Sistem:</strong> <span className="text-muted-fg">Canlı takip modülü aktiftir. Lütfen tabletlerinizi "Sürekli Konum" moduna alınız.</span>
                        </div>
                    </CardContent>
                    <CardFooter className="mt-auto border-t border-border pt-4">
                        <Button size="sm" variant="outline" className="w-full">Arşiv</Button>
                    </CardFooter>
                </Card>
            </div>
        </Container>
    );
}
