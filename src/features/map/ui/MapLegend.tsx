"use client";

import { cn } from "@/shared/lib/cn";
import { IssueCategory, IssuePriority } from "@/features/issue/model/types";
import { getCategoryColor, getPriorityColor } from "../lib/mockMapData";
import { Car, Droplets, TreePine, Trash2, AlertCircle, Circle, CheckCircle2 } from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORY ICONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const categoryIcons: Record<IssueCategory, React.ReactNode> = {
    transportation: <Car size={14} />,
    water_sewer: <Droplets size={14} />,
    parks: <TreePine size={14} />,
    waste: <Trash2 size={14} />
};

const categoryLabels: Record<IssueCategory, string> = {
    transportation: "Ulaşım & Yol",
    water_sewer: "Su & Kanalizasyon",
    parks: "Park & Bahçe",
    waste: "Temizlik & Atık"
};

const priorityLabels: Record<IssuePriority, string> = {
    high: "Acil",
    medium: "Normal",
    low: "Düşük"
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGEND COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MapLegendProps {
    className?: string;
    showCategories?: boolean;
    showPriorities?: boolean;
    compact?: boolean;
}

export function MapLegend({ 
    className, 
    showCategories = true, 
    showPriorities = true,
    compact = false 
}: MapLegendProps) {
    const categories: IssueCategory[] = ["transportation", "water_sewer", "parks", "waste"];
    const priorities: IssuePriority[] = ["high", "medium", "low"];

    if (compact) {
        return (
            <div className={cn(
                "flex flex-wrap gap-2",
                className
            )}>
                {showCategories && categories.map((cat) => (
                    <div
                        key={cat}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1",
                            "rounded-full text-[10px] font-medium",
                            "bg-[hsl(var(--surface))] border border-[hsl(var(--neutral-4))]"
                        )}
                    >
                        <span
                            className="w-3 h-3 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: getCategoryColor(cat) }}
                        >
                            {categoryIcons[cat]}
                        </span>
                        <span className="text-[hsl(var(--neutral-8))]">
                            {categoryLabels[cat].split(" ")[0]}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={cn(
            "p-3 rounded-[var(--radius-md)]",
            "bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm",
            "border border-[hsl(var(--neutral-4))]",
            "shadow-[var(--shadow-md)]",
            "space-y-3",
            className
        )}>
            {/* Categories */}
            {showCategories && (
                <div className="space-y-2">
                    <h4 className="text-[10px] font-semibold text-[hsl(var(--neutral-7))] uppercase tracking-wide">
                        Kategoriler
                    </h4>
                    <div className="space-y-1.5">
                        {categories.map((cat) => (
                            <div key={cat} className="flex items-center gap-2">
                                <span
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
                                    style={{ backgroundColor: getCategoryColor(cat) }}
                                >
                                    {categoryIcons[cat]}
                                </span>
                                <span className="text-xs text-[hsl(var(--neutral-9))]">
                                    {categoryLabels[cat]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Divider */}
            {showCategories && showPriorities && (
                <div className="h-px bg-[hsl(var(--neutral-3))]" />
            )}

            {/* Priorities */}
            {showPriorities && (
                <div className="space-y-2">
                    <h4 className="text-[10px] font-semibold text-[hsl(var(--neutral-7))] uppercase tracking-wide">
                        Öncelik
                    </h4>
                    <div className="space-y-1.5">
                        {priorities.map((pri) => (
                            <div key={pri} className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getPriorityColor(pri) }}
                                />
                                <span className="text-xs text-[hsl(var(--neutral-9))]">
                                    {priorityLabels[pri]}
                                </span>
                                {pri === "high" && (
                                    <span className="text-[10px] text-[hsl(var(--red-6))]">(Nabızlı)</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATS COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MapStatsProps {
    total: number;
    byCategory: Record<IssueCategory, number>;
    byPriority: Record<IssuePriority, number>;
    className?: string;
}

export function MapStats({ total, byCategory, byPriority, className }: MapStatsProps) {
    const categories: IssueCategory[] = ["transportation", "water_sewer", "parks", "waste"];
    
    return (
        <div className={cn(
            "p-3 rounded-[var(--radius-md)]",
            "bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm",
            "border border-[hsl(var(--neutral-4))]",
            "shadow-[var(--shadow-md)]",
            className
        )}>
            {/* Total */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[hsl(var(--neutral-7))]">Toplam Kayıt</span>
                <span className="text-lg font-bold text-[hsl(var(--neutral-11))]">{total}</span>
            </div>
            
            {/* Category breakdown */}
            <div className="space-y-2">
                {categories.map((cat) => {
                    const count = byCategory[cat] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                        <div key={cat} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-[hsl(var(--neutral-8))]">
                                    <span style={{ color: getCategoryColor(cat) }}>
                                        {categoryIcons[cat]}
                                    </span>
                                    {categoryLabels[cat].split(" ")[0]}
                                </span>
                                <span className="font-medium text-[hsl(var(--neutral-9))]">{count}</span>
                            </div>
                            <div className="h-1.5 bg-[hsl(var(--neutral-3))] rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: getCategoryColor(cat)
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Priority summary */}
            <div className="mt-3 pt-3 border-t border-[hsl(var(--neutral-3))] flex items-center gap-3">
                {(["high", "medium", "low"] as IssuePriority[]).map((pri) => (
                    <div key={pri} className="flex items-center gap-1">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getPriorityColor(pri) }}
                        />
                        <span className="text-[10px] text-[hsl(var(--neutral-7))]">
                            {byPriority[pri] || 0}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

