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
import { cn } from "@/shared/lib/cn";
import { Search } from "lucide-react";

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

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Filters Panel */}
                <div className="lg:w-56 flex-shrink-0 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--neutral-9))]">{ti('searchLabel')}</label>
                        <div className="relative">
                            <Input
                                placeholder={ti('searchPlaceholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--neutral-6))]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--neutral-9))]">{ti('statusLabel')}</label>
                        <div className="flex flex-wrap gap-1.5">
                            <Chip active={statusFilter === null} onClick={() => setStatusFilter(null)}>{ti('allFilter')}</Chip>
                            {statuses.map(s => (
                                <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                                    {t(`status.${s}`)}
                                </Chip>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--neutral-9))]">{ti('priorityLabel')}</label>
                        <div className="flex flex-wrap gap-1.5">
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
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex flex-col space-y-3 p-4 border border-[hsl(var(--neutral-4))] rounded-[var(--radius-lg)] bg-[hsl(var(--surface))]">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredIssues.length === 0 ? (
                        <EmptyState
                            title={ti('emptyTitle')}
                            description={ti('emptyDesc')}
                            className="border-2 border-dashed border-[hsl(var(--neutral-4))] rounded-[var(--radius-lg)] bg-[hsl(var(--surface))]"
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
