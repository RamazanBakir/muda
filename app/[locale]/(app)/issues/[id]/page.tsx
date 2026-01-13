"use client";

import { useEffect, useState as useReactState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/navigation";
import { Container } from "@/shared/ui/container";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { useSession } from "@/features/auth";
import { issueRepository, Issue } from "@/features/issue";
import { IssueTimeline } from "@/features/issue/ui/IssueTimeline";
import { IssueDetailActions } from "@/features/issue/ui/IssueDetailActions";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import * as dateLocales from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { StatusBadge, PriorityBadge } from "@/shared/ui/badge/status-badge";
import {
    ChevronLeft,
    MapPin,
    User,
    Building2,
    Calendar,
    Tag,
    Image as ImageIcon
} from "lucide-react";

export default function IssueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { session } = useSession();
    const [issue, setIssue] = useReactState<Issue | null>(null);
    const [loading, setLoading] = useReactState(true);
    const t = useTranslations();
    const td = useTranslations("issueDetail");
    const localeStr = useLocale();
    const dateLocale = localeStr === 'tr' ? dateLocales.tr : dateLocales.enUS;

    useEffect(() => {
        if (!params.id) return;
        const fetchIssue = async () => {
            setLoading(true);
            try {
                const data = await issueRepository.getIssue(params.id as string);
                setIssue(data || null);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchIssue();
    }, [params.id]);

    if (!session) return null;

    if (loading) {
        return (
            <Container className="space-y-10 pt-8">
                <Skeleton className="h-16 w-1/3 mb-10 rounded-2xl" />
                <div className="grid lg:grid-cols-3 gap-10">
                    <Skeleton className="h-[500px] w-full lg:col-span-2 rounded-3xl" />
                    <Skeleton className="h-[300px] w-full rounded-3xl" />
                </div>
            </Container>
        );
    }

    if (!issue) {
        return (
            <Container className="py-32 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100 dark:bg-neutral-800 mb-6 text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">{td('notFoundTitle')}</h1>
                <p className="text-lg text-muted-fg mt-3 max-w-sm mx-auto font-medium">{td('notFoundDesc')}</p>
                <Button size="lg" className="mt-10" onClick={() => router.back()}>{td('backToList')}</Button>
            </Container>
        );
    }

    return (
        <Container className="pb-24">
            {/* Breadcrumb nav */}
            <div className="py-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="group pl-0 text-muted-fg hover:text-primary font-bold text-xs uppercase tracking-widest transition-all"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="mr-1 w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                    {td('backToList')}
                </Button>
            </div>

            <PageHeader
                title={issue.title}
                description={
                    <div className="flex items-center gap-3 mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 rounded-lg border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-fg">
                            {td('idLabel')}: {issue.id}
                        </span>
                        <div className="h-4 w-px bg-border/60" />
                        <span className="text-sm font-medium text-muted-fg">
                            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: dateLocale })}
                        </span>
                    </div>
                }
                actions={
                    <IssueDetailActions issue={issue} role={session.role} onUpdate={setIssue} />
                }
            />

            <div className="grid gap-10 lg:grid-cols-3 mt-12">
                {/* MAIN CONTENT */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-surface border-2 border-border/40 p-5 rounded-2xl shadow-sm">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-muted-fg mb-3 opacity-60">{td('status')}</span>
                            <StatusBadge status={issue.status} showIcon />
                        </div>
                        <div className="bg-surface border-2 border-border/40 p-5 rounded-2xl shadow-sm">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-muted-fg mb-3 opacity-60">{td('priority')}</span>
                            <PriorityBadge priority={issue.priority} showIcon />
                        </div>
                        <div className="bg-surface border-2 border-border/40 p-5 rounded-2xl shadow-sm col-span-2 md:col-span-1">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-muted-fg mb-3 opacity-60">{td('category')}</span>
                            <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-50 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit">
                                <Tag size={14} className="text-primary" strokeWidth={3} />
                                {t(`category.${issue.category}`)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border-2 border-border/40 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b-2 border-border/30 bg-surface-2 flex items-center justify-between">
                            <h3 className="font-black text-xs uppercase tracking-widest text-muted-fg opacity-80">{td('description')}</h3>
                        </div>
                        <div className="p-8">
                            <p className="whitespace-pre-wrap leading-[1.8] text-neutral-800 dark:text-neutral-200 font-medium text-lg">
                                {issue.description}
                            </p>
                            {issue.media.photos.length > 0 && (
                                <div className="mt-10 pt-8 border-t-2 border-border/20">
                                    <div className="flex items-center gap-2 mb-6 text-xs font-black uppercase tracking-widest text-muted-fg">
                                        <ImageIcon size={14} />
                                        {td('photos')}
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="aspect-[4/3] bg-surface-2 rounded-2xl w-full border-2 border-dashed border-border flex items-center justify-center text-muted-fg group cursor-pointer hover:border-primary/40 transition-colors">
                                            <ImageIcon size={32} className="opacity-20 group-hover:opacity-40 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-surface border-2 border-border/40 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b-2 border-border/30 bg-surface-2 flex items-center justify-between">
                            <h3 className="font-black text-xs uppercase tracking-widest text-muted-fg opacity-80">{td('location')}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                                <MapPin size={14} />
                                {issue.location.district}
                            </div>
                        </div>
                        <div className="p-0">
                            {/* Map Placeholder */}
                            <div className="w-full h-80 bg-neutral-100 flex items-center justify-center text-muted-fg/60 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/OpenStreetMap.png')] bg-cover relative grayscale-[0.5] contrast-[1.1]">
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="h-16 w-16 bg-primary text-primary-fg rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                                        <MapPin size={32} fill="currentColor" fillOpacity={0.2} />
                                    </div>
                                    <div className="mt-4 bg-surface p-3 rounded-2xl shadow-xl border-2 border-primary/20 flex flex-col items-center max-w-[200px] text-center">
                                        <span className="font-black text-[10px] uppercase tracking-tighter text-neutral-900 mb-1">{issue.location.neighborhood}</span>
                                        <span className="text-[9px] text-muted-fg leading-tight font-bold">{issue.location.addressText || "-"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface">
                                <div className="space-y-2">
                                    <span className="block text-[10px] uppercase font-black tracking-widest text-muted-fg opacity-60">{td('district')}</span>
                                    <span className="font-bold text-neutral-900 dark:text-neutral-50 text-base flex items-center gap-2">
                                        <Building2 size={16} className="text-primary/60" />
                                        {issue.location.district} / {issue.location.neighborhood}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-[10px] uppercase font-black tracking-widest text-muted-fg opacity-60">{td('address')}</span>
                                    <span className="font-bold text-neutral-900 dark:text-neutral-50 text-base flex items-center gap-2">
                                        <MapPin size={16} className="text-primary/60" />
                                        {issue.location.street || issue.location.addressText || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border-2 border-border/40 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b-2 border-border/30 bg-surface-2">
                            <h3 className="font-black text-xs uppercase tracking-widest text-muted-fg opacity-80">{t('issues.timelineLabel') || "Timeline"}</h3>
                        </div>
                        <div className="p-8">
                            <IssueTimeline timeline={issue.timeline} role={session.role} />
                        </div>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="space-y-8">

                    {/* Reporter Info */}
                    <div className="bg-surface border-2 border-border/40 rounded-3xl shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-border/20 pb-4">
                            <h3 className="font-black text-xs uppercase tracking-widest text-muted-fg opacity-60">{td('reporter')}</h3>
                            <User size={16} className="text-muted-fg opacity-40" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary text-primary-fg flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20">
                                {issue.reporter.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-black text-neutral-900 dark:text-neutral-50 text-lg">{issue.reporter.name}</div>
                                <div className="text-xs font-bold text-primary uppercase tracking-wider">{t(`roles.${issue.reporter.type}`)}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-muted-fg bg-surface-2 p-3 rounded-xl border border-border/40">
                            <Calendar size={14} className="text-primary/60" />
                            {td('createdAt')}: {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: dateLocale })}
                        </div>
                    </div>

                    {/* Assignment Info */}
                    <div className="bg-surface border-2 border-border/40 rounded-3xl shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between border-b-2 border-border/20 pb-4">
                            <h3 className="font-black text-xs uppercase tracking-widest text-muted-fg opacity-60">{td('assignedUnit')}</h3>
                            <Building2 size={16} className="text-muted-fg opacity-40" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-secondary text-secondary-fg flex items-center justify-center shadow-lg shadow-primary/10">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <div className="font-black text-neutral-900 dark:text-neutral-50 text-lg">
                                    {issue.assignedUnit?.name || td('notAssigned')}
                                </div>
                                <div className="text-xs font-bold text-muted-fg leading-relaxed">
                                    {issue.assignedUnit ? td('assignedDesc') : td('pendingAssignment')}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Container>
    );
}
