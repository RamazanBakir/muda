"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Issue, IssueStatus, IssuePriority } from "../model/types";
import { UserRole } from "@/features/auth";
import { issueRepository } from "../api/issueRepository";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/cn";

interface IssueDetailActionsProps {
    issue: Issue;
    role: UserRole;
    onUpdate: (updatedIssue: Issue) => void;
}

export function IssueDetailActions({ issue, role, onUpdate }: IssueDetailActionsProps) {
    const t = useTranslations();
    const ta = useTranslations("actions");
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<"reroute" | "status" | null>(null);

    const [selectedUnit, setSelectedUnit] = useState(issue.assignedUnit?.id || "");
    const [selectedPriority, setSelectedPriority] = useState<IssuePriority>(issue.priority);
    const [note, setNote] = useState("");

    const handleStatusChange = async (newStatus: IssueStatus) => {
        if (!confirm(ta('confirmStatus'))) return;
        setLoading(true);
        try {
            const updated = await issueRepository.updateIssue(
                issue.id,
                { status: newStatus },
                { name: role === 'unit' ? ta('unitOfficial') : ta('callCenter'), role }
            );
            onUpdate(updated);
        } catch (e) {
            console.error(e);
            alert(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleRerouteSave = async () => {
        setLoading(true);
        try {
            const updated = await issueRepository.updateIssue(
                issue.id,
                {
                    assignedUnit: selectedUnit ? { id: selectedUnit, name: "Atanan Birim" } : undefined,
                    priority: selectedPriority,
                    status: "triaged",
                },
                { name: ta('callCenter'), role: "call_center" }
            );

            if (note) {
                await issueRepository.addNote(issue.id, note, true, { name: ta('callCenter'), role: "call_center" });
            }

            onUpdate(updated);
            setDialogOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (role === 'citizen' || role === 'mukhtar') {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 p-3 bg-surface-2 rounded-lg border border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">{t('common.actions')}</h3>

            {role === 'unit' && (
                <div className="flex gap-2 flex-wrap">
                    {issue.status === 'triaged' && (
                        <Button size="sm" onClick={() => handleStatusChange('in_progress')} isLoading={loading}>
                            {ta('takeAction')}
                        </Button>
                    )}
                    {issue.status === 'in_progress' && (
                        <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-surface"
                            onClick={() => handleStatusChange('resolved')}
                            isLoading={loading}
                        >
                            {ta('resolveAction')}
                        </Button>
                    )}
                    {issue.status === 'resolved' && (
                        <span className="text-sm text-success font-medium">{ta('resolvedMessage')}</span>
                    )}
                </div>
            )}

            {role === 'call_center' && (
                <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => { setActionType('reroute'); setDialogOpen(true); }}>
                        {ta('editAction')}
                    </Button>
                    {issue.status !== 'resolved' && (
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange('resolved')}>
                            {ta('closeAction')}
                        </Button>
                    )}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogHeader>
                    <DialogTitle>{ta('dialogTitle')}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg">{ta('assignUnit')}</label>
                        <Select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                            <option value="">{ta('select')}</option>
                            <option value="unit-water">Su ve Kanalizasyon</option>
                            <option value="unit-transport">Ulaşım Dairesi</option>
                            <option value="unit-light">Aydınlatma Şefliği</option>
                            <option value="unit-clean">Temizlik İşleri</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg">{t('priority.title') || "Öncelik"}</label>
                        <Select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value as IssuePriority)}>
                            <option value="low">{t('priority.low')}</option>
                            <option value="medium">{t('priority.medium')}</option>
                            <option value="high">{t('priority.high')}</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg">{ta('noteLabel')}</label>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={ta('notePlaceholder')} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={loading}>{ta('cancel')}</Button>
                    <Button onClick={handleRerouteSave} isLoading={loading}>{ta('save')}</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
