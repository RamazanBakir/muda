"use client";

import { useEffect, useState } from "react";
import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { useSession } from "@/features/auth";
import {
    issueRepository,
    Issue,
    IssueStatus,
    IssuePriority,
    IssueCard
} from "@/features/issue";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Chip } from "@/shared/ui/chip";
import { useTranslations } from "next-intl";

export default function IssuesPage() {
    const { session } = useSession();
    const t = useTranslations();
    const ti = useTranslations("issues");

    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState<IssueStatus | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<IssuePriority | null>(null);
    const [search, setSearch] = useState("");

    const fetchIssues = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await issueRepository.getIssues({
                role: session.role,
                userId: session.userId,
                neighborhoodId: session.neighborhoodId,
                unitId: session.unitId,
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
            });
            setIssues(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [session, statusFilter, priorityFilter]);

    const filteredIssues = issues.filter(i =>
        !search ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase()) ||
        i.id.toLowerCase().includes(search.toLowerCase())
    );

    if (!session) return null;

    const statuses: IssueStatus[] = ['created', 'triaged', 'in_progress', 'resolved'];
    const priorities: IssuePriority[] = ['high', 'medium', 'low'];

    const getPageDescription = () => {
        switch (session.role) {
            case 'citizen': return ti('descCitizen');
            case 'mukhtar': return ti('descMukhtar');
            case 'unit': return ti('descUnit');
            default: return ti('descAdmin');
        }
    };

    return (
        <Container>
            <PageHeader
                title={ti('title')}
                description={getPageDescription()}
            />

            <div className="flex flex-col lg:flex-row gap-6 mb-8">
                {/* Filters Panel */}
                <div className="lg:w-64 flex-shrink-0 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">{ti('searchLabel')}</label>
                        <div className="relative">
                            <Input
                                placeholder={ti('searchPlaceholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">{ti('statusLabel')}</label>
                        <div className="flex flex-wrap gap-2">
                            <Chip active={statusFilter === null} onClick={() => setStatusFilter(null)} className="w-full justify-center">{ti('allFilter')}</Chip>
                            {statuses.map(s => (
                                <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} className="w-full justify-center">
                                    {t(`status.${s}`)}
                                </Chip>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">{ti('priorityLabel')}</label>
                        <div className="flex flex-wrap gap-2">
                            <Chip active={priorityFilter === null} onClick={() => setPriorityFilter(null)}>{ti('allFilter')}</Chip>
                            {priorities.map(p => (
                                <Chip key={p} active={priorityFilter === p} onClick={() => setPriorityFilter(p)}>
                                    {t(`priority.${p}`)}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex flex-col space-y-3 p-4 border rounded-xl bg-white">
                                    <Skeleton className="h-[20px] w-3/4 rounded-full" />
                                    <Skeleton className="h-[100px] w-full rounded-xl" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredIssues.length === 0 ? (
                        <EmptyState
                            title={ti('emptyTitle')}
                            description={ti('emptyDesc')}
                            className="bg-muted/10 border-2 border-dashed border-muted rounded-xl bg-white"
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {filteredIssues.map(issue => (
                                <IssueCard key={issue.id} issue={issue} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
}

