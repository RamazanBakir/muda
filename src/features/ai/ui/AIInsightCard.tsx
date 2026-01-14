"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { AIDecision } from "../model/types";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { useTranslations } from "next-intl";
import {
    Sparkles,
    Check,
    Pencil,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    FileText,
    MapPin,
    Image,
    History,
    AlertTriangle,
    ArrowRight,
    Zap,
    Target,
    Building2,
} from "lucide-react";

interface AIInsightCardProps {
    aiDecision: AIDecision;
    onApply?: () => void;
    onOverride?: () => void;
    onRerun?: () => void;
    isApplying?: boolean;
    isRerunning?: boolean;
    readOnly?: boolean;
    compact?: boolean;
    className?: string;
}

const SIGNAL_ICONS = {
    text: FileText,
    location: MapPin,
    photo: Image,
    history: History,
};

const CATEGORY_LABELS: Record<string, string> = {
    water_sewer: "Su & Kanalizasyon",
    transportation: "Ulaşım & Yol",
    parks: "Park & Bahçeler",
    waste: "Temizlik & Atık",
};

const PRIORITY_LABELS: Record<string, string> = {
    high: "Yüksek",
    medium: "Orta",
    low: "Düşük",
};

export function AIInsightCard({
    aiDecision,
    onApply,
    onOverride,
    onRerun,
    isApplying,
    isRerunning,
    readOnly = false,
    compact = false,
    className,
}: AIInsightCardProps) {
    const t = useTranslations("ai");
    const [expanded, setExpanded] = useState(!compact);
    
    const isLowConfidence = aiDecision.overallConfidence < 0.6;
    const hasOverride = aiDecision.finalDecision?.decidedBy === "human";
    
    return (
        <div className={cn(
            "rounded-[var(--radius-lg)] overflow-hidden",
            "bg-gradient-to-br from-[hsl(var(--blue-1))] to-[hsl(var(--surface))]",
            "border border-[hsl(var(--blue-3))]",
            "shadow-[var(--shadow-soft)]",
            className
        )}>
            {/* Header */}
            <div className={cn(
                "px-4 py-3 flex items-center justify-between gap-3",
                "bg-[hsl(var(--blue-2)/0.5)]",
                "border-b border-[hsl(var(--blue-3)/0.5)]"
            )}>
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        "bg-[hsl(var(--blue-6))]"
                    )}>
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[hsl(var(--neutral-11))]">
                            {t("insightTitle") || "Yapay Zekâ Önerisi"}
                        </h3>
                        <p className="text-[10px] text-[hsl(var(--neutral-7))]">
                            {aiDecision.modelVersion}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <ConfidenceMeter 
                        value={aiDecision.overallConfidence} 
                        size="sm" 
                    />
                    {compact && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1 rounded hover:bg-[hsl(var(--blue-2))] transition-colors"
                        >
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    )}
                </div>
            </div>
            
            {/* Content */}
            {expanded && (
                <div className="p-4 space-y-4">
                    {/* Low confidence warning */}
                    {isLowConfidence && (
                        <div className={cn(
                            "flex items-start gap-2.5 p-3 rounded-lg",
                            "bg-[hsl(var(--amber-1))] border border-[hsl(var(--amber-3))]"
                        )}>
                            <AlertTriangle className="w-4 h-4 text-[hsl(var(--amber-7))] flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-[hsl(var(--amber-9))]">
                                <p className="font-medium">
                                    {t("lowConfidenceTitle") || "Düşük Güvenirlik"}
                                </p>
                                <p className="text-[hsl(var(--amber-8))] mt-0.5">
                                    {t("lowConfidenceDesc") || "Daha doğru yönlendirme için ek bilgi gerekebilir."}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* Predictions Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Category */}
                        <div className={cn(
                            "p-3 rounded-lg",
                            "bg-[hsl(var(--surface))]",
                            "border border-[hsl(var(--neutral-4))]"
                        )}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Target size={12} className="text-[hsl(var(--blue-6))]" />
                                <span className="text-[10px] font-medium text-[hsl(var(--neutral-7))] uppercase tracking-wide">
                                    Kategori
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-[hsl(var(--neutral-11))] truncate">
                                {CATEGORY_LABELS[aiDecision.predictedCategory.value] || aiDecision.predictedCategory.value}
                            </p>
                            <ConfidenceMeter 
                                value={aiDecision.predictedCategory.confidence} 
                                size="sm" 
                                showLabel={false}
                                className="mt-2"
                            />
                        </div>
                        
                        {/* Unit */}
                        <div className={cn(
                            "p-3 rounded-lg",
                            "bg-[hsl(var(--surface))]",
                            "border border-[hsl(var(--neutral-4))]"
                        )}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Building2 size={12} className="text-[hsl(var(--blue-6))]" />
                                <span className="text-[10px] font-medium text-[hsl(var(--neutral-7))] uppercase tracking-wide">
                                    Birim
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-[hsl(var(--neutral-11))] truncate">
                                {aiDecision.predictedUnit.value.name}
                            </p>
                            <ConfidenceMeter 
                                value={aiDecision.predictedUnit.confidence} 
                                size="sm" 
                                showLabel={false}
                                className="mt-2"
                            />
                        </div>
                        
                        {/* Priority */}
                        <div className={cn(
                            "p-3 rounded-lg",
                            "bg-[hsl(var(--surface))]",
                            "border border-[hsl(var(--neutral-4))]"
                        )}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Zap size={12} className="text-[hsl(var(--blue-6))]" />
                                <span className="text-[10px] font-medium text-[hsl(var(--neutral-7))] uppercase tracking-wide">
                                    Öncelik
                                </span>
                            </div>
                            <p className={cn(
                                "text-sm font-semibold truncate",
                                aiDecision.predictedPriority.value === "high" && "text-[hsl(var(--red-7))]",
                                aiDecision.predictedPriority.value === "medium" && "text-[hsl(var(--amber-7))]",
                                aiDecision.predictedPriority.value === "low" && "text-[hsl(var(--green-7))]"
                            )}>
                                {PRIORITY_LABELS[aiDecision.predictedPriority.value]}
                            </p>
                            <ConfidenceMeter 
                                value={aiDecision.predictedPriority.confidence} 
                                size="sm" 
                                showLabel={false}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    
                    {/* Reasons */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-[hsl(var(--neutral-8))] uppercase tracking-wide flex items-center gap-1.5">
                            <ArrowRight size={12} />
                            {t("reasonsTitle") || "Analiz Sonuçları"}
                        </h4>
                        <ul className="space-y-1.5">
                            {aiDecision.reasons.map((reason, idx) => (
                                <li 
                                    key={idx}
                                    className={cn(
                                        "flex items-start gap-2 text-xs text-[hsl(var(--neutral-9))]",
                                        "pl-2 border-l-2 border-[hsl(var(--blue-4))]"
                                    )}
                                >
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Signals */}
                    <div className="flex flex-wrap gap-1.5">
                        {aiDecision.signals.map((signal, idx) => {
                            const Icon = SIGNAL_ICONS[signal.type] || FileText;
                            return (
                                <div 
                                    key={idx}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2 py-1 rounded-full",
                                        "bg-[hsl(var(--neutral-2))] text-[hsl(var(--neutral-8))]",
                                        "border border-[hsl(var(--neutral-4))]",
                                        "text-[10px] font-medium"
                                    )}
                                >
                                    <Icon size={10} />
                                    {signal.label}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Suggested Actions */}
                    {aiDecision.suggestedActions.length > 0 && (
                        <div className={cn(
                            "p-3 rounded-lg",
                            "bg-[hsl(var(--blue-1))]",
                            "border border-[hsl(var(--blue-3))]"
                        )}>
                            <p className="text-[10px] font-medium text-[hsl(var(--blue-8))] uppercase tracking-wide mb-2">
                                {t("suggestedActions") || "Önerilen İşlemler"}
                            </p>
                            <ul className="space-y-1">
                                {aiDecision.suggestedActions.map((action, idx) => (
                                    <li 
                                        key={idx}
                                        className="text-xs text-[hsl(var(--blue-9))] flex items-center gap-1.5"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-[hsl(var(--blue-6))]" />
                                        {action.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Human Override Notice */}
                    {hasOverride && aiDecision.finalDecision?.humanOverride && (
                        <div className={cn(
                            "p-3 rounded-lg",
                            "bg-[hsl(var(--neutral-2))]",
                            "border border-[hsl(var(--neutral-4))]"
                        )}>
                            <p className="text-[10px] font-medium text-[hsl(var(--neutral-7))] uppercase tracking-wide mb-1">
                                Manuel Düzenleme Yapıldı
                            </p>
                            <p className="text-xs text-[hsl(var(--neutral-9))]">
                                {aiDecision.finalDecision.humanOverride.byName} tarafından • 
                                Sebep: {aiDecision.finalDecision.humanOverride.reason}
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Actions */}
            {!readOnly && expanded && (
                <div className={cn(
                    "px-4 py-3 flex items-center justify-between gap-2",
                    "bg-[hsl(var(--neutral-2)/0.5)]",
                    "border-t border-[hsl(var(--neutral-3))]"
                )}>
                    <div className="flex gap-2">
                        {onApply && (
                            <Button
                                size="sm"
                                onClick={onApply}
                                isLoading={isApplying}
                                className="gap-1.5"
                            >
                                <Check size={14} />
                                {t("applyBtn") || "Öneriyi Uygula"}
                            </Button>
                        )}
                        {onOverride && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onOverride}
                                className="gap-1.5"
                            >
                                <Pencil size={14} />
                                {t("overrideBtn") || "Düzenle"}
                            </Button>
                        )}
                    </div>
                    {onRerun && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onRerun}
                            isLoading={isRerunning}
                            className="gap-1.5 text-[hsl(var(--neutral-7))]"
                        >
                            <RefreshCw size={14} />
                            {t("rerunBtn") || "Yeniden Analiz"}
                        </Button>
                    )}
                </div>
            )}
            
            {/* Processing info */}
            <div className="px-4 py-2 text-[9px] text-[hsl(var(--neutral-6))] flex items-center justify-between border-t border-[hsl(var(--neutral-3)/0.5)]">
                <span>İşlem süresi: {aiDecision.processingTimeMs}ms</span>
                <span>{new Date(aiDecision.createdAt).toLocaleTimeString("tr-TR")}</span>
            </div>
        </div>
    );
}

/**
 * Compact version for sidebars
 */
export function AIInsightCompact({
    aiDecision,
    onExpand,
    className,
}: {
    aiDecision: AIDecision;
    onExpand?: () => void;
    className?: string;
}) {
    return (
        <button
            onClick={onExpand}
            className={cn(
                "w-full p-3 rounded-lg text-left",
                "bg-gradient-to-r from-[hsl(var(--blue-1))] to-[hsl(var(--surface))]",
                "border border-[hsl(var(--blue-3))]",
                "hover:border-[hsl(var(--blue-4))] transition-colors",
                className
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[hsl(var(--blue-6))]" />
                    <span className="text-xs font-medium text-[hsl(var(--neutral-9))]">
                        AI: {CATEGORY_LABELS[aiDecision.predictedCategory.value]}
                    </span>
                </div>
                <ConfidenceMeter 
                    value={aiDecision.overallConfidence} 
                    size="sm" 
                />
            </div>
        </button>
    );
}

