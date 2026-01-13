"use client";

import { useSession } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { Filter, Users } from "lucide-react";

interface QueueToolbarProps {
    currentPreset: string;
    onPresetChange: (preset: string) => void;
}

const PRESETS = [
    { id: 'all', label: 'Tümü' },
    { id: 'unassigned', label: 'Atanmamış' },
    { id: 'urgent', label: 'Acil' },
    { id: 'today', label: 'Bugün' },
    { id: 'my_team', label: 'Ekibim' },
];

export function QueueToolbar({ currentPreset, onPresetChange }: QueueToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b">
            <div className="flex bg-muted p-1 rounded-lg overflow-x-auto max-w-full">
                {PRESETS.map(preset => (
                    <button
                        key={preset.id}
                        onClick={() => onPresetChange(preset.id)}
                        className={`
                            px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all
                            ${currentPreset === preset.id
                                ? 'bg-white shadow text-foreground'
                                : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'
                            }
                        `}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filtreler
                </Button>
                {/* Simplified bulk actions placeholder */}
            </div>
        </div>
    );
}
