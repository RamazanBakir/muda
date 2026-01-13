"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select } from "@/shared/ui/select";
import { cn } from "@/shared/lib/cn";
import dynamic from "next/dynamic";
import { MUG_CENTER } from "@/features/map/lib/config";
import { FormField } from "@/shared/ui/form-field";
import { storage } from "@/shared/lib/storage";
import { useTranslations } from "next-intl";
import { MapPin, Map as MapIcon, Home, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";

// Lazy load Map to avoid SSR issues
const MapView = dynamic(() => import("@/features/map/ui/MapView").then(m => m.MapView), {
    ssr: false,
    loading: () => {
        const t = useTranslations("issueForm");
        return <div className="h-64 flex items-center justify-center bg-surface-2 text-muted-fg animate-pulse rounded-3xl border-2 border-dashed border-border">{t('mapLoading')}</div>;
    }
});

const DRAFT_KEY = "issue_draft_v1";

export function IssueMethodSelector() {
    const t = useTranslations("issueForm");
    const tc = useTranslations("category");
    const tf = useTranslations("issueForm.fields");
    const [method, setMethod] = useState<string>("map");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        title: "",
        desc: "",
        category: "",
        contactName: "",
        contactPhone: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Restore Draft
    useEffect(() => {
        const draft = storage.get<{ step: number, method: string, location: any, formData: any } | null>(DRAFT_KEY, null);
        if (draft) {
            if (confirm(t('draftPrompt'))) {
                setStep(draft.step);
                setMethod(draft.method);
                setLocation(draft.location);
                setFormData(draft.formData);
            } else {
                storage.remove(DRAFT_KEY);
            }
        }
    }, [t]);

    // Save Draft on change
    useEffect(() => {
        if (formData.title || location) {
            storage.set(DRAFT_KEY, { step, method, location, formData });
        }
    }, [step, method, location, formData]);

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.category) newErrors.category = t('errors.category');
        if (!formData.title) newErrors.title = t('errors.title');
        if (!formData.desc) newErrors.desc = t('errors.description');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1) {
            if (method === 'map' && !location) {
                alert(t('errors.selectLocation'));
                return;
            }
            setStep(2);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setLoading(true);
        // Simulate API
        await new Promise(r => setTimeout(r, 1500));
        storage.remove(DRAFT_KEY); // Clear draft
        window.location.href = "/issues";
    };

    const clearDraft = () => {
        storage.remove(DRAFT_KEY);
        window.location.reload();
    };

    // Step Progress Indicator
    const ProgressIndicator = () => (
        <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-4">
                    <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500",
                        step === s
                            ? "bg-primary text-primary-fg shadow-lg shadow-primary/20 scale-110"
                            : step > s
                                ? "bg-success text-white"
                                : "bg-surface-2 text-muted-fg border-2 border-border/50"
                    )}>
                        {step > s ? <CheckCircle2 size={20} strokeWidth={3} /> : s}
                    </div>
                    {s < 2 && (
                        <div className={cn(
                            "w-12 h-1 rounded-full transition-all duration-500",
                            step > s ? "bg-success" : "bg-border/60"
                        )} />
                    )}
                </div>
            ))}
        </div>
    );

    // Step 1: Location Selection
    if (step === 1) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <ProgressIndicator />
                <div className="text-center space-y-3 mb-10">
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50">{t('step1Title')}</h2>
                    <p className="text-lg text-muted-fg font-medium">{t('step1Desc')}</p>
                </div>

                <Tabs value={method} onValueChange={setMethod} className="w-full">
                    <TabsList className="grid w-80 mx-auto grid-cols-2 mb-10 p-1.5 h-14 rounded-2xl">
                        <TabsTrigger value="map" className="rounded-xl flex items-center gap-2">
                            <MapIcon size={16} />
                            {t('tabs.map')}
                        </TabsTrigger>
                        <TabsTrigger value="form" className="rounded-xl flex items-center gap-2">
                            <Home size={16} />
                            {t('tabs.address')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="map" className="mt-0 focus-visible:outline-none">
                        <Card className="overflow-hidden border-none shadow-2xl rounded-3xl">
                            <div className="h-[450px] w-full relative">
                                <MapView
                                    draggableValues={location || MUG_CENTER}
                                    setDraggableValues={setLocation}
                                    center={MUG_CENTER}
                                />
                                {!location && (
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-2xl text-sm font-black uppercase tracking-widest z-[1000] border-2 border-primary/20 animate-bounce flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" strokeWidth={3} />
                                        {t('mapHint')}
                                    </div>
                                )}
                            </div>
                            <CardFooter className="p-6 bg-surface-2 border-t-2 border-border/30 justify-between items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-fg/60 mb-1">
                                        {t('selectedLoc')}
                                    </span>
                                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-50">
                                        {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : t('noLoc')}
                                    </span>
                                </div>
                                <div className="flex gap-4">
                                    <Button size="lg" variant="ghost" onClick={clearDraft} className="text-muted-fg font-bold">
                                        {t('clear')}
                                    </Button>
                                    <Button size="lg" onClick={handleNext} disabled={!location} className="min-w-[160px] shadow-xl shadow-primary/20">
                                        {t('continue')}
                                        <ChevronRight size={18} className="ml-1" strokeWidth={3} />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="form" className="mt-0 focus-visible:outline-none">
                        <Card className="border-none shadow-2xl rounded-3xl p-8">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <FormField label={tf('district') || "İlçe"}>
                                        <Select className="h-14"><option>Menteşe</option></Select>
                                    </FormField>
                                    <FormField label={tf('neighborhood') || "Mahalle / Sokak"}>
                                        <Input placeholder="Örn: Camikebir Mah. İnönü Cad." className="h-14" />
                                    </FormField>
                                    <FormField label={tf('addressDescription') || "Adres Tarifi"}>
                                        <Textarea placeholder="Örn: Marketin karşısındaki apartman..." className="min-h-[120px]" />
                                    </FormField>
                                </div>
                                <Button size="lg" className="w-full h-14 text-lg shadow-xl shadow-primary/20" onClick={() => setStep(2)}>
                                    {t('continue')}
                                    <ChevronRight size={20} className="ml-1" strokeWidth={3} />
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    // Step 2: Details
    return (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <ProgressIndicator />

            <div className="text-center space-y-3 mb-12 relative group">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-12 rounded-2xl hover:bg-neutral-100 p-0"
                >
                    <ArrowLeft size={20} strokeWidth={3} />
                </Button>
                <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-50">{t('step2Title')}</h2>
                <p className="text-lg text-muted-fg font-medium">{t('step2Desc')}</p>
            </div>

            <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="space-y-8 p-10">
                    <FormField label={tf('category')} required error={errors.category}>
                        <Select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className={cn("h-14 text-base font-bold", errors.category && "border-danger ring-danger/10")}
                        >
                            <option value="">{tf('categorySelect')}</option>
                            <option value="water_sewer">{tc('water_sewer')}</option>
                            <option value="transportation">{tc('transportation')}</option>
                            <option value="parks">{tc('parks')}</option>
                            <option value="waste">{tc('waste')}</option>
                        </Select>
                    </FormField>

                    <FormField label={tf('title')} required error={errors.title}>
                        <Input
                            placeholder={tf('titlePlaceholder')}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className={cn("h-14 text-base font-bold", errors.title && "border-danger ring-danger/10")}
                        />
                    </FormField>

                    <FormField label={tf('description')} required error={errors.desc} hint={tf('descriptionHint')}>
                        <Textarea
                            placeholder={tf('descriptionPlaceholder')}
                            className={cn("min-h-[140px] text-base font-medium leading-relaxed p-4", errors.desc && "border-danger ring-danger/10")}
                            value={formData.desc}
                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                        />
                    </FormField>

                    {/* Optional Contact */}
                    <div className="bg-surface-2 p-8 rounded-3xl space-y-6 border-2 border-border/40">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-1 bg-primary rounded-full" />
                            <h4 className="font-black text-xs uppercase tracking-widest text-muted-fg opacity-80">{tf('contactTitle')}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label={tf('fullName')}>
                                <Input
                                    placeholder={tf('fullName')}
                                    value={formData.contactName}
                                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                    className="bg-surface h-12"
                                />
                            </FormField>
                            <FormField label={tf('phone')}>
                                <Input
                                    placeholder={tf('phone')}
                                    value={formData.contactPhone}
                                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                    className="bg-surface h-12"
                                />
                            </FormField>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                    <Button
                        size="lg"
                        className="w-full h-16 text-lg font-black shadow-2xl shadow-primary/30 rounded-2xl"
                        onClick={handleSubmit}
                        isLoading={loading}
                    >
                        {t('submit')}
                        {!loading && <CheckCircle2 className="ml-2 w-5 h-5" strokeWidth={3} />}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}


