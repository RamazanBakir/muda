"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
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
import { MapPin, Map as MapIcon, Home, CheckCircle2, ChevronRight, ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
import { generateAIDecision } from "@/features/ai";
import { MediaUploader, type MediaFile } from "./MediaUploader";

// Lazy load Map to avoid SSR issues
const MapView = dynamic(() => import("@/features/map/ui/MapView").then(m => m.MapView), {
    ssr: false,
    loading: () => {
        const t = useTranslations("issueForm");
        return (
            <div className={cn(
                "h-64 flex items-center justify-center",
                "bg-[hsl(var(--neutral-2))] text-[hsl(var(--neutral-7))]",
                "rounded-[var(--radius-lg)]",
                "border border-dashed border-[hsl(var(--neutral-4))]"
            )}>
                {t('mapLoading')}
            </div>
        );
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

    // Media Files (photos and videos)
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showAIHint, setShowAIHint] = useState(false);
    
    // Generate AI preview when description changes
    const photoCount = mediaFiles.filter(f => f.type === "photo").length;
    const aiPreview = formData.desc.length > 20 
        ? generateAIDecision({
            description: formData.desc,
            category: formData.category as any || undefined,
            location: location ? { lat: location.lat, lng: location.lng } : undefined,
            hasPhoto: photoCount > 0,
            photoCount,
        })
        : null;

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
        <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-3">
                    <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        step === s
                            ? "bg-[hsl(var(--blue-6))] text-white"
                            : step > s
                                ? "bg-[hsl(var(--green-6))] text-white"
                                : "bg-[hsl(var(--neutral-3))] text-[hsl(var(--neutral-7))]"
                    )}>
                        {step > s ? <CheckCircle2 size={16} /> : s}
                    </div>
                    {s < 2 && (
                        <div className={cn(
                            "w-8 h-0.5 rounded-full transition-colors",
                            step > s ? "bg-[hsl(var(--green-6))]" : "bg-[hsl(var(--neutral-3))]"
                        )} />
                    )}
                </div>
            ))}
        </div>
    );

    // Step 1: Location Selection
    if (step === 1) {
        return (
            <div className="space-y-6">
                <ProgressIndicator />
                <div className="text-center space-y-2 mb-6">
                    <h2 className="text-xl font-semibold text-[hsl(var(--neutral-11))]">{t('step1Title')}</h2>
                    <p className="text-sm text-[hsl(var(--neutral-7))]">{t('step1Desc')}</p>
                </div>

                <Tabs value={method} onValueChange={setMethod} className="w-full">
                    <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 mb-6">
                        <TabsTrigger value="map" className="flex items-center gap-1.5">
                            <MapIcon size={14} />
                            {t('tabs.map')}
                        </TabsTrigger>
                        <TabsTrigger value="form" className="flex items-center gap-1.5">
                            <Home size={14} />
                            {t('tabs.address')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="map">
                        <Card className="overflow-hidden">
                            <div className="h-[320px] w-full relative">
                                <MapView
                                    draggableValues={location || MUG_CENTER}
                                    setDraggableValues={setLocation}
                                    center={MUG_CENTER}
                                />
                                {!location && (
                                    <div className={cn(
                                        "absolute top-4 left-1/2 -translate-x-1/2 z-[1000]",
                                        "bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm px-3 py-2 rounded-[var(--radius-md)]",
                                        "shadow-[var(--shadow-md)]",
                                        "border border-[hsl(var(--blue-3))]",
                                        "text-sm font-medium text-[hsl(var(--blue-7))]",
                                        "flex items-center gap-1.5"
                                    )}>
                                        <MapPin size={14} />
                                        {t('mapHint')}
                                    </div>
                                )}
                            </div>
                            <CardFooter className="p-4 justify-between items-center gap-3 bg-[hsl(var(--neutral-2))] border-t border-[hsl(var(--neutral-3))]">
                                <div className="flex flex-col">
                                    <span className="text-xs text-[hsl(var(--neutral-7))]">
                                        {t('selectedLoc')}
                                    </span>
                                    <span className="text-sm font-medium text-[hsl(var(--neutral-11))]">
                                        {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : t('noLoc')}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={clearDraft}>
                                        {t('clear')}
                                    </Button>
                                    <Button size="sm" onClick={handleNext} disabled={!location}>
                                        {t('continue')}
                                        <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="form">
                        <Card className="p-5">
                            <div className="space-y-4">
                                <FormField label={tf('district') || "İlçe"}>
                                    <Select><option>Menteşe</option></Select>
                                </FormField>
                                <FormField label={tf('neighborhood') || "Mahalle / Sokak"}>
                                    <Input placeholder="Örn: Camikebir Mah. İnönü Cad." />
                                </FormField>
                                <FormField label={tf('addressDescription') || "Adres Tarifi"}>
                                    <Textarea placeholder="Örn: Marketin karşısındaki apartman..." />
                                </FormField>
                                <Button className="w-full" onClick={() => setStep(2)}>
                                    {t('continue')}
                                    <ChevronRight size={14} className="ml-1" />
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
        <div className="space-y-6">
            <ProgressIndicator />

            <div className="text-center space-y-2 mb-6 relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                >
                    <ArrowLeft size={16} />
                </Button>
                <h2 className="text-xl font-semibold text-[hsl(var(--neutral-11))]">{t('step2Title')}</h2>
                <p className="text-sm text-[hsl(var(--neutral-7))]">{t('step2Desc')}</p>
            </div>

            <Card className="max-w-lg mx-auto">
                <CardContent className="space-y-4 p-5">
                    <FormField label={tf('category')} required error={errors.category}>
                        <Select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className={errors.category ? "border-[hsl(var(--red-6))]" : ""}
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
                            className={errors.title ? "border-[hsl(var(--red-6))]" : ""}
                        />
                    </FormField>

                    <FormField label={tf('description')} required error={errors.desc} hint={tf('descriptionHint')}>
                        <Textarea
                            placeholder={tf('descriptionPlaceholder')}
                            className={errors.desc ? "border-[hsl(var(--red-6))]" : ""}
                            value={formData.desc}
                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                        />
                    </FormField>

                    {/* Media Upload Section */}
                    <div className={cn(
                        "p-4 rounded-[var(--radius-md)]",
                        "bg-[hsl(var(--neutral-2))] border border-[hsl(var(--neutral-3))]"
                    )}>
                        <MediaUploader
                            value={mediaFiles}
                            onChange={setMediaFiles}
                            maxPhotos={5}
                            maxVideos={2}
                            maxFileSizeMB={10}
                            disabled={loading}
                        />
                    </div>

                    {/* Citizen-friendly AI Hint */}
                    {aiPreview && (
                        <div className={cn(
                            "p-3 rounded-lg",
                            "bg-gradient-to-r from-[hsl(var(--blue-1))] to-[hsl(var(--surface))]",
                            "border border-[hsl(var(--blue-3))]"
                        )}>
                            <button
                                type="button"
                                onClick={() => setShowAIHint(!showAIHint)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-[hsl(var(--blue-6))]" />
                                    <span className="text-sm font-medium text-[hsl(var(--neutral-9))]">
                                        Sistem uygun birime yönlendirecek
                                    </span>
                                </div>
                                <ChevronDown 
                                    size={14} 
                                    className={cn(
                                        "text-[hsl(var(--neutral-6))] transition-transform",
                                        showAIHint && "rotate-180"
                                    )} 
                                />
                            </button>
                            {showAIHint && (
                                <div className="mt-3 pt-3 border-t border-[hsl(var(--blue-3)/0.5)] text-xs space-y-2">
                                    <p className="text-[hsl(var(--neutral-7))]">
                                        Bildiriminiz analiz edildi. Öngörülen yönlendirme:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 rounded bg-[hsl(var(--blue-2))] text-[hsl(var(--blue-8))] font-medium">
                                            {aiPreview.predictedUnit.value.name}
                                        </span>
                                        <span className="px-2 py-1 rounded bg-[hsl(var(--neutral-2))] text-[hsl(var(--neutral-8))] font-medium">
                                            %{Math.round(aiPreview.overallConfidence * 100)} güvenirlik
                                        </span>
                                    </div>
                                    {aiPreview.overallConfidence < 0.6 && (
                                        <p className="text-[hsl(var(--amber-7))]">
                                            💡 Daha iyi yönlendirme için detaylı bir açıklama veya fotoğraf ekleyebilirsiniz.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Optional Contact */}
                    <div className="p-4 rounded-[var(--radius-md)] space-y-3 bg-[hsl(var(--neutral-2))] border border-[hsl(var(--neutral-3))]">
                        <h4 className="text-sm font-medium text-[hsl(var(--neutral-9))]">{tf('contactTitle')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField label={tf('fullName')}>
                                <Input
                                    placeholder={tf('fullName')}
                                    value={formData.contactName}
                                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </FormField>
                            <FormField label={tf('phone')}>
                                <Input
                                    placeholder={tf('phone')}
                                    value={formData.contactPhone}
                                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                />
                            </FormField>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        isLoading={loading}
                    >
                        {t('submit')}
                        {!loading && <CheckCircle2 className="ml-2 w-4 h-4" />}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
