"use client";

import { Button } from "@/shared/ui/button";
import { Filter } from "lucide-react";
import { cn } from "@/shared/lib/cn";

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-border">
            <div className="flex bg-surface-2 p-1 rounded-lg overflow-x-auto max-w-full">
                {PRESETS.map(preset => (
                    <button
                        key={preset.id}
                        onClick={() => onPresetChange(preset.id)}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all",
                            currentPreset === preset.id
                                ? "bg-surface shadow-sm text-fg"
                                : "text-muted-fg hover:bg-surface/50 hover:text-fg"
                        )}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filtreler
                </Button>
            </div>
        </div>
    );
}
