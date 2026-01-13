"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { useSession } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { issueRepository, Issue } from "@/features/issue";
import { QueueToolbar, AssignmentDialog, SLAIndicator } from "@/features/unit";
import { IssueCard } from "@/features/issue";
import { AssignedTo } from "@/features/issue/model/types";
import { addHours, isPast } from "date-fns";
import { Check, X, Users } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

export default function UnitIssuesPage() {
    const { session } = useSession();
    const router = useRouter();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [preset, setPreset] = useState("all");
    const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    useEffect(() => {
        if (session && session.role !== 'unit') {
            router.push('/issues');
        }
    }, [session]);

    const load = async () => {
        if (!session) return;
        const all = await issueRepository.getIssues({
            role: session.role,
            unitId: session.unitId
        });
        setIssues(all);
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 15000);
        return () => clearInterval(interval);
    }, [session]);

    const filteredIssues = useMemo(() => {
        let result = [...issues];
        switch (preset) {
            case 'unassigned':
                result = result.filter(i => !i.assignedTo);
                break;
            case 'urgent':
                result = result.filter(i => i.priority === 'high');
                break;
            case 'today':
                result = result.filter(i => new Date(i.createdAt) > new Date(Date.now() - 86400000));
                break;
            case 'my_team':
                result = result.filter(i => i.assignedTo);
                break;
        }
        return result;
    }, [issues, preset]);

    const handleAssign = async (assignee: AssignedTo, dueAt: string | undefined) => {
        if (selectedIssueIds.size === 0) return;

        await Promise.all(Array.from(selectedIssueIds).map(id =>
            issueRepository.updateIssue(id, { assignedTo: assignee, dueAt }, { name: "Birim Yetkilisi", role: "unit" })
        ));

        setSelectedIssueIds(new Set());
        load();
    };

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIssueIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIssueIds(next);
    };

    if (!session) return null;

    return (
        <Container className="space-y-6 pb-24 animate-in fade-in duration-500">
            <PageHeader
                title="İş Listesi & Atama"
                description="Birim iş kuyruğunu yönet, atama yap ve SLA takip et."
            />

            <QueueToolbar currentPreset={preset} onPresetChange={setPreset} />

            {selectedIssueIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-fg rounded-xl p-3 shadow-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 ml-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-semibold text-primary-fg text-sm">
                                {selectedIssueIds.size}
                            </div>
                            <span className="font-medium text-sm text-surface">
                                Talep Seçildi
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="h-9 px-4 text-sm font-medium rounded-lg gap-2"
                                onClick={() => setAssignDialogOpen(true)}
                            >
                                <Users size={14} />
                                Ekip/Kişi Ata
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 rounded-lg text-surface/60 hover:text-surface hover:bg-surface/10"
                                onClick={() => setSelectedIssueIds(new Set())}
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIssues.map(issue => (
                    <div key={issue.id} className="relative group">
                        <div className="absolute top-3 left-3 z-20">
                            <button
                                onClick={(e) => { e.preventDefault(); toggleSelection(issue.id); }}
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 shadow-md active:scale-95",
                                    selectedIssueIds.has(issue.id)
                                        ? "bg-primary text-primary-fg"
                                        : "bg-surface/90 backdrop-blur-sm text-transparent border border-border hover:border-primary/50"
                                )}
                            >
                                <Check className={cn("w-4 h-4 transition-transform", selectedIssueIds.has(issue.id) ? "scale-100" : "scale-0")} strokeWidth={3} />
                            </button>
                        </div>
                        <div className={cn(
                            "transition-all duration-300 rounded-xl overflow-hidden",
                            selectedIssueIds.has(issue.id) ? "ring-2 ring-primary scale-[0.98]" : "hover:-translate-y-1"
                        )}>
                            <IssueCard issue={issue} />
                        </div>
                    </div>
                ))}
            </div>

            <AssignmentDialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                onAssign={handleAssign}
            />
        </Container>
    );
}


