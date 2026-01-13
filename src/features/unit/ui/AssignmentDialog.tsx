"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Select } from "@/shared/ui/select";
import { UNIT_DIRECTORY, SLA_OPTIONS } from "../config";
import { addHours, formatISO } from "date-fns";
import { AssignedTo } from "@/features/issue/model/types";
import { Search, User, Users } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/cn";

interface AssignmentDialogProps {
    open: boolean;
    onClose: () => void;
    onAssign: (assignee: AssignedTo, dueAt: string | undefined) => void;
    currentAssignee?: AssignedTo | null;
}

export function AssignmentDialog({ open, onClose, onAssign, currentAssignee }: AssignmentDialogProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState<string>(currentAssignee?.id || "");
    const [slaHours, setSlaHours] = useState<string>("24");

    const filteredTeams = UNIT_DIRECTORY.teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredPersons = UNIT_DIRECTORY.persons.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleConfirm = () => {
        let assignee: AssignedTo | undefined;

        const team = UNIT_DIRECTORY.teams.find(t => t.id === selectedId);
        if (team) assignee = { type: 'team', id: team.id, name: team.name };

        const person = UNIT_DIRECTORY.persons.find(p => p.id === selectedId);
        if (person) assignee = { type: 'person', id: person.id, name: person.name };

        if (!assignee) return;

        const dueAt = slaHours ? formatISO(addHours(new Date(), parseInt(slaHours))) : undefined;
        onAssign(assignee, dueAt);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>İş Ataması Yap</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
                        <Input
                            placeholder="Ekip veya personel ara..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="h-[200px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
                        <div className="bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted-fg sticky top-0">Ekipler</div>
                        {filteredTeams.map(t => (
                            <button
                                key={t.id}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 text-sm hover:bg-surface-2 text-left transition-colors",
                                    selectedId === t.id && "bg-secondary"
                                )}
                                onClick={() => setSelectedId(t.id)}
                            >
                                <div className="bg-secondary p-2 rounded-lg text-primary"><Users className="w-4 h-4" /></div>
                                <span className="text-fg">{t.name}</span>
                            </button>
                        ))}

                        <div className="bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted-fg sticky top-0">Personel</div>
                        {filteredPersons.map(p => (
                            <button
                                key={p.id}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 text-sm hover:bg-surface-2 text-left transition-colors",
                                    selectedId === p.id && "bg-secondary"
                                )}
                                onClick={() => setSelectedId(p.id)}
                            >
                                <div className="bg-surface-2 p-2 rounded-lg text-muted-fg"><User className="w-4 h-4" /></div>
                                <span className="text-fg">{p.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg">Hedef Çözüm Süresi (SLA)</label>
                        <Select value={slaHours} onChange={(e) => setSlaHours(e.target.value)}>
                            {SLA_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={onClose}>İptal</Button>
                        <Button onClick={handleConfirm} disabled={!selectedId}>Kaydet ve Atama Yap</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
