"use client";

import { useEffect, useState as useReactState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/navigation";
import dynamic from "next/dynamic";
import { Container } from "@/shared/ui/container";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { SectionCard } from "@/shared/ui/section-card";
import { InfoCard, InfoRow } from "@/shared/ui/info-card";
import { useSession } from "@/features/auth";
import { issueRepository, Issue } from "@/features/issue";
import { IssueTimeline } from "@/features/issue/ui/IssueTimeline";
import { IssueDetailActions } from "@/features/issue/ui/IssueDetailActions";
import { MediaGallery, MediaEmptyState } from "@/features/issue/ui/MediaGallery";
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
    MapPinOff
} from "lucide-react";
import { cn } from "@/shared/lib/cn";

// Dynamic imports for Leaflet components (client-side only)
const MiniMapView = dynamic(
    () => import("@/features/map/ui/MiniMapView").then(mod => mod.MiniMapView),
    { 
        ssr: false,
        loading: () => (
            <div className="w-full h-48 bg-[hsl(var(--neutral-2))] animate-pulse flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[hsl(var(--neutral-5))]" />
            </div>
        )
    }
);

const StreetViewButton = dynamic(
    () => import("@/features/map/ui/StreetViewModal").then(mod => mod.StreetViewButton),
    { ssr: false }
);

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
            <Container className="space-y-6 pt-6">
                <Skeleton className="h-12 w-1/3 rounded-xl" />
                <div className="grid lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] w-full lg:col-span-2 rounded-xl" />
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                </div>
            </Container>
        );
    }

    if (!issue) {
        return (
            <Container className="py-24 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-surface-2 mb-4 text-muted-fg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-fg">{td('notFoundTitle')}</h1>
                <p className="text-sm text-muted-fg mt-2 max-w-sm mx-auto">{td('notFoundDesc')}</p>
                <Button size="sm" className="mt-6" onClick={() => router.back()}>{td('backToList')}</Button>
            </Container>
        );
    }

    return (
        <Container className="pb-16">
            <div className="py-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="group pl-0 text-muted-fg hover:text-primary text-xs font-medium"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="mr-1 w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    {td('backToList')}
                </Button>
            </div>

            <PageHeader
                title={issue.title}
                description={
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--neutral-2))] rounded-md border border-[hsl(var(--neutral-4))] text-xs font-medium text-[hsl(var(--neutral-7))]">
                            {td('idLabel')}: {issue.id}
                        </span>
                        <span className="text-[hsl(var(--neutral-5))]">•</span>
                        <span className="text-xs text-muted-fg">
                            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: dateLocale })}
                        </span>
                    </div>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--neutral-4))] p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-all duration-200">
                            <span className="block text-xs font-medium text-[hsl(var(--neutral-7))] mb-2">{td('status')}</span>
                            <StatusBadge status={issue.status} showIcon />
                        </div>
                        <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--neutral-4))] p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-all duration-200">
                            <span className="block text-xs font-medium text-[hsl(var(--neutral-7))] mb-2">{td('priority')}</span>
                            <PriorityBadge priority={issue.priority} showIcon />
                        </div>
                        <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--neutral-4))] p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-all duration-200 col-span-2 md:col-span-1">
                            <span className="block text-xs font-medium text-[hsl(var(--neutral-7))] mb-2">{td('category')}</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-fg px-2 py-1 bg-secondary rounded-lg w-fit">
                                <Tag size={14} className="text-primary" />
                                {t(`category.${issue.category}`)}
                            </div>
                        </div>
                    </div>

                    <SectionCard title={td('description')}>
                        <p className="whitespace-pre-wrap leading-relaxed text-fg text-sm">
                            {issue.description}
                        </p>
                    </SectionCard>

                    {/* Media Gallery - Photos & Videos */}
                    <SectionCard title={td('attachments') || 'Ekler'}>
                        {(issue.media.photos.length > 0 || (issue.media.videos && issue.media.videos.length > 0)) ? (
                            <MediaGallery 
                                photos={issue.media.photos} 
                                videos={issue.media.videos} 
                            />
                        ) : (
                            <MediaEmptyState />
                        )}
                    </SectionCard>

                    <SectionCard
                        title={td('location')}
                        headerAction={
                            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                                <MapPin size={12} />
                                {issue.location.district}
                            </div>
                        }
                        noPadding
                    >
                        {/* Leaflet Map with Street View Button */}
                        <div className="relative">
                            {issue.location.lat && issue.location.lng ? (
                                <>
                                    <MiniMapView
                                        lat={issue.location.lat}
                                        lng={issue.location.lng}
                                        zoom={16}
                                        popupContent={issue.location.neighborhood || issue.location.addressText}
                                        height="h-52"
                                    />
                                    {/* Street View Button - positioned on map */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <StreetViewButton
                                            lat={issue.location.lat}
                                            lng={issue.location.lng}
                                            address={`${issue.location.neighborhood || ''}, ${issue.location.district || ''}`}
                                            variant="compact"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-52 bg-[hsl(var(--neutral-2))] flex flex-col items-center justify-center text-[hsl(var(--neutral-6))] gap-2">
                                    <MapPinOff size={28} className="opacity-50" />
                                    <span className="text-xs font-medium">{td('noCoordinates') || 'Koordinat bilgisi yok'}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Location Details */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[hsl(var(--neutral-3))]">
                            <InfoRow label={td('district')} icon={<Building2 size={14} />}>
                                {issue.location.district} / {issue.location.neighborhood}
                            </InfoRow>
                            <InfoRow label={td('address')} icon={<MapPin size={14} />}>
                                {issue.location.street || issue.location.addressText || "-"}
                            </InfoRow>
                        </div>
                    </SectionCard>

                    <SectionCard title={t('issues.timelineLabel') || "Timeline"}>
                        <IssueTimeline timeline={issue.timeline} role={session.role} />
                    </SectionCard>
                </div>

                <div className="space-y-4">
                    <IssueDetailActions issue={issue} role={session.role} onUpdate={setIssue} />
                    
                    <InfoCard title={td('reporter')} icon={<User size={14} />}>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary text-primary-fg flex items-center justify-center font-semibold text-lg">
                                {issue.reporter.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-semibold text-fg">{issue.reporter.name}</div>
                                <div className="text-xs text-primary font-medium">{t(`roles.${issue.reporter.type}`)}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-fg bg-surface-2 p-2 rounded-lg">
                            <Calendar size={12} className="text-primary" />
                            {td('createdAt')}: {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: dateLocale })}
                        </div>
                    </InfoCard>

                    <InfoCard title={td('assignedUnit')} icon={<Building2 size={14} />}>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-secondary text-secondary-fg flex items-center justify-center">
                                <Building2 size={18} />
                            </div>
                            <div>
                                <div className="font-semibold text-fg">
                                    {issue.assignedUnit?.name || td('notAssigned')}
                                </div>
                                <div className="text-xs text-muted-fg">
                                    {issue.assignedUnit ? td('assignedDesc') : td('pendingAssignment')}
                                </div>
                            </div>
                        </div>
                    </InfoCard>
                </div>
            </div>
        </Container>
    );
}
