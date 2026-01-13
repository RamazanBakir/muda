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
import { Check, X, Users, ChevronRight } from "lucide-react";
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
        <Container className="space-y-10 pb-24 animate-in fade-in duration-700">
            <PageHeader
                title="İş Listesi & Atama"
                description="Birim iş kuyruğunu yönet, atama yap ve SLA takip et."
            />

            <QueueToolbar currentPreset={preset} onPresetChange={setPreset} />

            {/* Bulk Actions Context Bar */}
            {selectedIssueIds.size > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-6 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-neutral-900 dark:bg-neutral-50 rounded-[32px] p-4 shadow-2xl flex items-center justify-between gap-4 border-4 border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-4 ml-4">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-black text-white text-sm shadow-lg shadow-primary/20">
                                {selectedIssueIds.size}
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest text-neutral-50 dark:text-neutral-900">
                                Talep Seçildi
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="lg"
                                className="h-12 px-6 text-xs font-black uppercase tracking-widest rounded-2xl gap-2 shadow-xl shadow-primary/20"
                                onClick={() => setAssignDialogOpen(true)}
                            >
                                <Users size={16} strokeWidth={3} />
                                Ekip/Kişi Ata
                            </Button>
                            <Button
                                size="lg"
                                variant="ghost"
                                className="h-12 w-12 p-0 rounded-2xl text-neutral-400 hover:text-white hover:bg-white/10"
                                onClick={() => setSelectedIssueIds(new Set())}
                            >
                                <X size={20} strokeWidth={3} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredIssues.map(issue => (
                    <div key={issue.id} className="relative group">
                        {/* Selection Checkbox Overlay */}
                        <div className="absolute top-4 left-4 z-20">
                            <button
                                onClick={(e) => { e.preventDefault(); toggleSelection(issue.id); }}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-xl active:scale-90",
                                    selectedIssueIds.has(issue.id)
                                        ? "bg-primary text-white scale-110 shadow-primary/30"
                                        : "bg-surface/80 backdrop-blur-md text-transparent border-2 border-border/40 hover:border-primary/50 group-hover:scale-105"
                                )}
                            >
                                <Check className={cn("w-5 h-5 transition-transform", selectedIssueIds.has(issue.id) ? "scale-100" : "scale-0")} strokeWidth={4} />
                            </button>
                        </div>
                        <div className={cn(
                            "transition-all duration-500 rounded-[32px] overflow-hidden",
                            selectedIssueIds.has(issue.id) ? "ring-4 ring-primary scale-[0.98] opacity-80 shadow-inner" : "hover:translate-y-[-4px]"
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


