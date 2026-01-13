"use client";

import { useState, useEffect } from "react";
import { configRepository, MockUnit } from "../api/configRepository";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Save, Users, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";

export function UnitManager() {
    const [units, setUnits] = useState<MockUnit[]>([]);

    useEffect(() => {
        setUnits(configRepository.getUnits());
    }, []);

    const handleSave = () => {
        configRepository.saveUnits(units);
    };

    const updateName = (id: string, name: string) => {
        setUnits(prev => prev.map(u => u.id === id ? { ...u, name } : u));
    };

    return (
        <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 bg-surface-2 border-b-2 border-border/30">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Birim & Sorumluluklar
                </CardTitle>
                <Button onClick={handleSave} size="sm" className="h-10 px-6 font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                    <Save className="w-4 h-4" strokeWidth={3} /> Kaydet
                </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                {units.map(unit => (
                    <div key={unit.id} className="group border-2 border-border/40 p-6 rounded-[32px] bg-surface hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Users size={18} className="text-primary" />
                            </div>
                            <Input
                                value={unit.name}
                                onChange={(e) => updateName(unit.id, e.target.value)}
                                className="h-10 bg-transparent border-none p-0 focus:ring-0 text-lg font-black text-neutral-900 dark:text-neutral-50"
                            />
                        </div>

                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-fg/60">
                                Sorumlu Kategoriler
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {unit.categories.map(cat => (
                                    <Badge key={cat} variant="secondary" className="px-3 py-1 text-[10px] font-bold uppercase rounded-xl border-border/40">
                                        {cat}
                                    </Badge>
                                ))}
                                <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 transition-all">
                                    <Plus size={10} className="mr-1" /> Kategori Ekle
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

