"use client";

import { useState, useEffect } from "react";
import { configRepository, MockCategory } from "../api/configRepository";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Save, Tag, Hash, Settings2, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function CategoryManager() {
    const [categories, setCategories] = useState<MockCategory[]>([]);

    useEffect(() => {
        setCategories(configRepository.getCategories());
    }, []);

    const handleSave = () => {
        configRepository.saveCategories(categories);
    };

    const toggleEnabled = (id: string) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    };

    const updateLabel = (id: string, label: string) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, label } : c));
    };

    return (
        <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 bg-surface-2 border-b-2 border-border/30">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-primary" />
                        Kategori Yönetimi
                    </CardTitle>
                </div>
                <Button onClick={handleSave} size="sm" className="h-10 px-6 font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                    <Save className="w-4 h-4" strokeWidth={3} />
                    Kaydet
                </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        className={cn(
                            "group flex items-center gap-5 border-2 p-5 rounded-[24px] transition-all duration-300",
                            cat.enabled
                                ? "bg-surface border-border/40 hover:border-primary/30"
                                : "bg-surface-2 border-transparent grayscale opacity-60"
                        )}
                    >
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase shadow-sm shrink-0 transition-transform group-hover:scale-110",
                            `bg-${cat.color}-100 text-${cat.color}-600 dark:bg-${cat.color}-900/20`
                        )}>
                            {cat.icon.substr(0, 2)}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Tag size={12} className="text-muted-fg" />
                                <Input
                                    value={cat.label}
                                    onChange={(e) => updateLabel(cat.id, e.target.value)}
                                    className="h-10 bg-transparent border-none p-0 focus:ring-0 text-base font-black text-neutral-900 dark:text-neutral-50"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-muted-fg/60">
                                <Hash size={10} />
                                {cat.key}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                cat.enabled ? "text-success" : "text-muted-fg"
                            )}>
                                {cat.enabled ? 'Aktif' : 'Pasif'}
                            </span>
                            <Switch
                                checked={cat.enabled}
                                onCheckedChange={() => toggleEnabled(cat.id)}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

