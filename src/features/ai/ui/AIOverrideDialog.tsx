"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/shared/ui/dialog";
import { AIDecision, AI_OVERRIDE_REASONS, AIOverrideReasonType } from "../model/types";
import { IssueCategory, IssuePriority } from "@/features/issue/model/types";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";

const CATEGORIES: Array<{ value: IssueCategory; label: string }> = [
    { value: "water_sewer", label: "Su & Kanalizasyon" },
    { value: "transportation", label: "Ulaşım & Yol" },
    { value: "parks", label: "Park & Bahçeler" },
    { value: "waste", label: "Temizlik & Atık" },
];

const UNITS: Array<{ id: string; name: string; category: IssueCategory }> = [
    { id: "unit-water", name: "Su ve Kanalizasyon", category: "water_sewer" },
    { id: "unit-roads", name: "Yol Bakım ve Ulaşım", category: "transportation" },
    { id: "unit-parks", name: "Park ve Bahçeler", category: "parks" },
    { id: "unit-waste", name: "Temizlik İşleri", category: "waste" },
];

const PRIORITIES: Array<{ value: IssuePriority; label: string }> = [
    { value: "high", label: "Yüksek" },
    { value: "medium", label: "Orta" },
    { value: "low", label: "Düşük" },
];

export interface AIOverrideResult {
    category: IssueCategory;
    unitId: string;
    unitName: string;
    priority: IssuePriority;
    reason: AIOverrideReasonType;
    notes?: string;
}

interface AIOverrideDialogProps {
    open: boolean;
    onClose: () => void;
    aiDecision: AIDecision;
    onOverride: (result: AIOverrideResult) => void;
    isLoading?: boolean;
}

export function AIOverrideDialog({
    open,
    onClose,
    aiDecision,
    onOverride,
    isLoading,
}: AIOverrideDialogProps) {
    const t = useTranslations("ai");
    
    // Initialize with AI predictions
    const [category, setCategory] = useState<IssueCategory>(aiDecision.predictedCategory.value);
    const [unitId, setUnitId] = useState(aiDecision.predictedUnit.value.id);
    const [priority, setPriority] = useState<IssuePriority>(aiDecision.predictedPriority.value);
    const [reason, setReason] = useState<AIOverrideReasonType | "">("");
    const [notes, setNotes] = useState("");
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Filter units based on category
    const filteredUnits = UNITS.filter(u => u.category === category);
    
    // Update unit when category changes
    const handleCategoryChange = (newCategory: IssueCategory) => {
        setCategory(newCategory);
        const matchingUnit = UNITS.find(u => u.category === newCategory);
        if (matchingUnit) {
            setUnitId(matchingUnit.id);
        }
    };
    
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!reason) {
            newErrors.reason = "Lütfen değişiklik sebebi seçiniz";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = () => {
        if (!validate()) return;
        
        const selectedUnit = UNITS.find(u => u.id === unitId);
        onOverride({
            category,
            unitId,
            unitName: selectedUnit?.name || "",
            priority,
            reason: reason as AIOverrideReasonType,
            notes: notes || undefined,
        });
    };
    
    // Check what changed
    const categoryChanged = category !== aiDecision.predictedCategory.value;
    const unitChanged = unitId !== aiDecision.predictedUnit.value.id;
    const priorityChanged = priority !== aiDecision.predictedPriority.value;
    const hasChanges = categoryChanged || unitChanged || priorityChanged;
    
    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles size={18} className="text-[hsl(var(--blue-6))]" />
                        {t("overrideDialogTitle") || "AI Önerisini Düzenle"}
                    </DialogTitle>
                    <DialogDescription>
                        {t("overrideDialogDesc") || "Yapay zekâ önerisini değiştirin. Bu geri bildirim, sistemin öğrenmesine yardımcı olur."}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    {/* AI Suggestion Summary */}
                    <div className={cn(
                        "p-3 rounded-lg text-xs",
                        "bg-[hsl(var(--blue-1))] border border-[hsl(var(--blue-3))]"
                    )}>
                        <p className="font-medium text-[hsl(var(--blue-8))] mb-1">
                            Mevcut AI Önerisi:
                        </p>
                        <div className="flex flex-wrap gap-2 text-[hsl(var(--blue-9))]">
                            <span className="px-2 py-0.5 bg-[hsl(var(--blue-2))] rounded">
                                {CATEGORIES.find(c => c.value === aiDecision.predictedCategory.value)?.label}
                            </span>
                            <span className="px-2 py-0.5 bg-[hsl(var(--blue-2))] rounded">
                                {aiDecision.predictedUnit.value.name}
                            </span>
                            <span className="px-2 py-0.5 bg-[hsl(var(--blue-2))] rounded">
                                {PRIORITIES.find(p => p.value === aiDecision.predictedPriority.value)?.label}
                            </span>
                        </div>
                    </div>
                    
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--neutral-9))] flex items-center gap-2">
                            Kategori
                            {categoryChanged && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--amber-2))] text-[hsl(var(--amber-8))]">
                                    Değiştirildi
                                </span>
                            )}
                        </label>
                        <Select
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value as IssueCategory)}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </Select>
                    </div>
                    
                    {/* Unit */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--neutral-9))] flex items-center gap-2">
                            Birim
                            {unitChanged && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--amber-2))] text-[hsl(var(--amber-8))]">
                                    Değiştirildi
                                </span>
                            )}
                        </label>
                        <Select
                            value={unitId}
                            onChange={(e) => setUnitId(e.target.value)}
                        >
                            {filteredUnits.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </Select>
                    </div>
                    
                    {/* Priority */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--neutral-9))] flex items-center gap-2">
                            Öncelik
                            {priorityChanged && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--amber-2))] text-[hsl(var(--amber-8))]">
                                    Değiştirildi
                                </span>
                            )}
                        </label>
                        <Select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as IssuePriority)}
                        >
                            {PRIORITIES.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </Select>
                    </div>
                    
                    {/* Reason (Required) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--neutral-9))]">
                            Değişiklik Sebebi <span className="text-[hsl(var(--red-6))]">*</span>
                        </label>
                        <Select
                            value={reason}
                            onChange={(e) => setReason(e.target.value as AIOverrideReasonType)}
                            className={errors.reason ? "border-[hsl(var(--red-6))]" : ""}
                        >
                            <option value="">Seçiniz...</option>
                            {AI_OVERRIDE_REASONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </Select>
                        {errors.reason && (
                            <p className="text-xs text-[hsl(var(--red-7))] flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.reason}
                            </p>
                        )}
                    </div>
                    
                    {/* Notes (Optional) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[hsl(var(--neutral-9))]">
                            Ek Notlar <span className="text-[hsl(var(--neutral-6))]">(Opsiyonel)</span>
                        </label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Değişiklik hakkında ek bilgi..."
                            className="min-h-[80px]"
                        />
                    </div>
                    
                    {/* Changes Summary */}
                    {hasChanges && (
                        <div className={cn(
                            "p-3 rounded-lg text-xs",
                            "bg-[hsl(var(--amber-1))] border border-[hsl(var(--amber-3))]"
                        )}>
                            <p className="font-medium text-[hsl(var(--amber-8))] mb-2 flex items-center gap-1">
                                <ArrowRight size={12} />
                                Yapılacak Değişiklikler:
                            </p>
                            <ul className="space-y-1 text-[hsl(var(--amber-9))]">
                                {categoryChanged && (
                                    <li>• Kategori: {CATEGORIES.find(c => c.value === aiDecision.predictedCategory.value)?.label} → {CATEGORIES.find(c => c.value === category)?.label}</li>
                                )}
                                {unitChanged && (
                                    <li>• Birim: {aiDecision.predictedUnit.value.name} → {UNITS.find(u => u.id === unitId)?.name}</li>
                                )}
                                {priorityChanged && (
                                    <li>• Öncelik: {PRIORITIES.find(p => p.value === aiDecision.predictedPriority.value)?.label} → {PRIORITIES.find(p => p.value === priority)?.label}</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
                
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        İptal
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        isLoading={isLoading}
                        disabled={!reason}
                    >
                        Değişiklikleri Kaydet
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

