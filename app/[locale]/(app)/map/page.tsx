"use client";

import { useEffect, useState } from "react";
import { MapView } from "@/features/map/ui/MapView";
import { useSession } from "@/features/auth";
import { issueRepository, Issue } from "@/features/issue";
import { Button } from "@/shared/ui/button";
import { HeatmapLayer } from "@/features/map/ui/overlays/HeatmapLayer";
import { PolygonDrawer } from "@/features/map/ui/overlays/PolygonDrawer";
import { Polygon } from "react-leaflet";
import { STRINGS } from "@/shared/config/strings";
import { cn } from "@/shared/lib/cn";
import {
    Layers,
    Zap,
    Map as MapIcon,
    Flame,
    PenTool,
    X,
    ChevronRight,
    BarChart2,
    Save
} from "lucide-react";

export default function MapPage() {
    const { session } = useSession();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [overlayType, setOverlayType] = useState<"markers" | "heatmap" | "hotspots">("markers");

    // Analysis & Drawing States
    const [analysisMode, setAnalysisMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [savedAreas, setSavedAreas] = useState<Array<{ id: string, name: string, points: [number, number][], stats: any }>>([]);
    const [analyzingArea, setAnalyzingArea] = useState<{ points: [number, number][], stats: any } | null>(null);

    useEffect(() => {
        const load = async () => {
            const all = await issueRepository.getIssues({
                role: session?.role || 'citizen',
                unitId: session?.role === 'unit' ? session.unitId : undefined,
                neighborhoodId: session?.role === 'mukhtar' ? session.neighborhoodId : undefined
            });
            setIssues(all);
        };
        load();

        if (analysisMode) return;

        const interval = setInterval(load, 15000);
        return () => clearInterval(interval);
    }, [session, analysisMode]);

    const handleAnalysisComplete = (points: [number, number][], stats: any) => {
        setIsDrawing(false);
        setAnalyzingArea({ points, stats });
    };

    const saveCurrentArea = () => {
        if (!analyzingArea) return;
        const name = prompt("Bölgeye bir isim verin:", `Bölge ${savedAreas.length + 1}`);
        if (!name) return;

        setSavedAreas([...savedAreas, { id: crypto.randomUUID(), name, points: analyzingArea.points, stats: analyzingArea.stats }]);
        setAnalyzingArea(null);
    };

    const mapMarkers = issues
        .filter(i => i.location.lat && i.location.lng)
        .map(i => ({
            id: i.id,
            lat: i.location.lat!,
            lng: i.location.lng!,
            title: i.title,
            status: i.status,
            onClick: () => {
                if (isDrawing) return;
                setSelectedIssue(i);
                setSheetOpen(true);
            }
        }));

    return (
        <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden flex flex-col pt-0">
            {/* Map Header / Filter Bar */}
            <div className="absolute top-6 left-6 right-6 z-[400] pointer-events-none flex flex-col gap-4 items-start md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-3 bg-surface/90 backdrop-blur-xl shadow-2xl p-1.5 rounded-2xl border-2 border-border/50 pointer-events-auto">
                    <Button
                        size="sm"
                        variant={analysisMode ? "primary" : "ghost"}
                        onClick={() => { setAnalysisMode(!analysisMode); setOverlayType("markers"); setIsDrawing(false); setAnalyzingArea(null); }}
                        className={cn(
                            "h-9 px-4 text-xs font-black uppercase tracking-widest gap-2",
                            analysisMode ? "bg-purple-600 shadow-purple-600/20" : "text-muted-fg"
                        )}
                    >
                        <BarChart2 size={14} strokeWidth={3} />
                        {analysisMode ? "Analiz Modu Aktif" : "Analiz"}
                    </Button>

                    {!analysisMode && (
                        <>
                            <div className="h-6 w-px bg-border/60 mx-1" />
                            {[
                                { id: 'markers', label: 'İaretçiler', icon: MapIcon },
                                { id: 'heatmap', label: 'Isı Haritası', icon: Flame },
                                { id: 'hotspots', label: 'Yoğunluk', icon: Zap }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setOverlayType(mode.id as any)}
                                    className={cn(
                                        "h-9 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
                                        overlayType === mode.id
                                            ? "bg-primary text-primary-fg shadow-lg shadow-primary/20"
                                            : "text-muted-fg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    )}
                                >
                                    <mode.icon size={14} />
                                    <span className="hidden sm:inline">{mode.label}</span>
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {overlayType !== 'markers' && !analysisMode && (
                    <div className="bg-surface/90 backdrop-blur-xl shadow-2xl p-1.5 rounded-2xl border-2 border-border/50 pointer-events-auto flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-fg/60 ml-2 mr-1">Zaman</span>
                        <Button size="sm" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest">Son 30 Gün</Button>
                        <Button size="sm" variant="ghost" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-muted-fg">Son 7 Gün</Button>
                    </div>
                )}
            </div>

            {/* ANALYSIS SIDEBAR PANEL */}
            {analysisMode && (
                <div className="absolute top-24 left-6 z-[400] w-80 bg-surface/95 backdrop-blur-2xl shadow-2xl border-2 border-border/50 rounded-3xl overflow-hidden flex flex-col max-h-[calc(100vh-160px)] animate-in slide-in-from-left duration-500">
                    <div className="p-5 border-b-2 border-border/30 bg-surface-2 flex justify-between items-center">
                        <span className="font-black text-xs uppercase tracking-widest text-muted-fg">Bölge Analizi</span>
                        <Button
                            size="sm"
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setIsDrawing(true)}
                            disabled={isDrawing || !!analyzingArea}
                        >
                            <PenTool size={12} className="mr-1.5" strokeWidth={3} />
                            Çizim Yap
                        </Button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        {analyzingArea && (
                            <div className="space-y-4 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200/50 p-5 rounded-2xl animate-in zoom-in-95">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-purple-700">Seçili Alan</h4>
                                    <button onClick={() => setAnalyzingArea(null)} className="text-purple-400 hover:text-purple-600 transition-colors">
                                        <X size={16} strokeWidth={3} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border-2 border-purple-100 shadow-sm">
                                        <div className="text-2xl font-black text-purple-600">{analyzingArea.stats.total}</div>
                                        <div className="text-[10px] font-bold text-muted-fg uppercase tracking-widest mt-1">Toplam</div>
                                    </div>
                                    <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border-2 border-red-100 shadow-sm">
                                        <div className="text-2xl font-black text-danger">{analyzingArea.stats.priorityCounts.high || 0}</div>
                                        <div className="text-[10px] font-bold text-muted-fg uppercase tracking-widest mt-1">Acil</div>
                                    </div>
                                </div>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 py-6 text-sm" onClick={saveCurrentArea}>
                                    <Save size={16} className="mr-2" strokeWidth={3} />
                                    Alanı Kaydet
                                </Button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-muted-fg/60 uppercase tracking-widest">Kaydedilen Bölgeler</span>
                            {savedAreas.length === 0 && (
                                <div className="text-xs text-muted-fg font-medium italic bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border-2 border-dashed border-border/60 text-center">
                                    Henüz analiz edilmiş bölge yok.
                                </div>
                            )}
                            <div className="grid gap-3">
                                {savedAreas.map(area => (
                                    <div
                                        key={area.id}
                                        className="group p-4 bg-surface hover:bg-neutral-50 dark:hover:bg-neutral-800 border-2 border-border/40 hover:border-primary/30 rounded-2xl shadow-sm cursor-pointer transition-all active:scale-95"
                                        onClick={() => setAnalyzingArea({ points: area.points, stats: area.stats })}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-black text-neutral-900 dark:text-neutral-50">{area.name}</div>
                                            <ChevronRight size={14} className="text-muted-fg opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-[10px] font-bold text-muted-fg bg-surface-2 px-2 py-1 rounded-lg">
                                                {area.stats.total} Kayıt
                                            </div>
                                            <div className="text-[10px] font-bold text-danger bg-danger/5 px-2 py-1 rounded-lg">
                                                {area.stats.priorityCounts.high || 0} Acil
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <MapView
                className="flex-1"
                markers={overlayType === 'markers' && !analysisMode ? mapMarkers : []}
            >
                {overlayType !== 'markers' && !analysisMode && (
                    <HeatmapLayer issues={issues} type={overlayType} />
                )}

                <PolygonDrawer
                    drawing={isDrawing}
                    issues={issues}
                    onComplete={handleAnalysisComplete}
                    onCancel={() => setIsDrawing(false)}
                />

                {analyzingArea && (
                    <Polygon
                        positions={analyzingArea.points}
                        pathOptions={{
                            color: '#9333ea',
                            fillColor: '#9333ea',
                            fillOpacity: 0.2,
                            weight: 3,
                            dashArray: '8, 8'
                        }}
                    />
                )}
            </MapView>

            {/* Selected Issue Preview */}
            {selectedIssue && sheetOpen && (
                <div className="absolute bottom-10 left-6 right-6 z-[500] pointer-events-none flex justify-center md:justify-start">
                    <div className="bg-surface/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border-2 border-border/50 w-full max-w-md pointer-events-auto animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
                        <div className="p-8 relative">
                            <button
                                onClick={() => setSheetOpen(false)}
                                className="absolute right-6 top-6 h-10 w-10 bg-surface-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full flex items-center justify-center text-muted-fg transition-all active:scale-90"
                            >
                                <X size={18} strokeWidth={3} />
                            </button>

                            <div className="space-y-6">
                                <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    {STRINGS.status[selectedIssue.status]}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-black text-2xl text-neutral-900 dark:text-neutral-50 leading-tight">
                                        {selectedIssue.title}
                                    </h3>
                                    <p className="text-muted-fg font-medium leading-relaxed line-clamp-2">
                                        {selectedIssue.description}
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4 border-t-2 border-border/20">
                                    <Button size="lg" className="flex-1 h-14" onClick={() => window.location.href = `/issues/${selectedIssue.id}`}>
                                        Detaya Git
                                        <ChevronRight size={18} className="ml-1" strokeWidth={3} />
                                    </Button>
                                    <Button size="lg" variant="outline" className="h-14 aspect-square p-0" onClick={() => setSheetOpen(false)}>
                                        <X size={20} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

