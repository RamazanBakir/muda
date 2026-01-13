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
        <div className="relative w-full h-[calc(100vh-56px)] md:h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {/* Map Header / Filter Bar */}
            <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none flex flex-col gap-3 items-start md:flex-row md:items-center md:justify-between">

                <div className={cn(
                    "flex items-center gap-1",
                    "bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm p-1 rounded-[var(--radius-md)]",
                    "border border-[hsl(var(--neutral-4))]",
                    "shadow-[var(--shadow-md)]",
                    "pointer-events-auto"
                )}>
                    <Button
                        size="sm"
                        variant={analysisMode ? "primary" : "ghost"}
                        onClick={() => { setAnalysisMode(!analysisMode); setOverlayType("markers"); setIsDrawing(false); setAnalyzingArea(null); }}
                        className="gap-1.5"
                    >
                        <BarChart2 size={14} />
                        {analysisMode ? "Analiz" : "Analiz"}
                    </Button>

                    {!analysisMode && (
                        <>
                            <div className="h-4 w-px bg-[hsl(var(--neutral-4))] mx-0.5" />
                            {[
                                { id: 'markers', label: 'İşaretçiler', icon: MapIcon },
                                { id: 'heatmap', label: 'Isı', icon: Flame },
                                { id: 'hotspots', label: 'Yoğunluk', icon: Zap }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setOverlayType(mode.id as any)}
                                    className={cn(
                                        "h-8 px-3 text-sm font-medium rounded-[var(--radius-sm)] transition-colors flex items-center gap-1.5 cursor-pointer",
                                        overlayType === mode.id
                                            ? "bg-[hsl(var(--blue-6))] text-white"
                                            : "text-[hsl(var(--neutral-7))] hover:bg-[hsl(var(--neutral-2))]"
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
                    <div className={cn(
                        "bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm p-1 rounded-[var(--radius-md)]",
                        "border border-[hsl(var(--neutral-4))]",
                        "shadow-[var(--shadow-md)]",
                        "pointer-events-auto flex items-center gap-1"
                    )}>
                        <span className="text-xs font-medium text-[hsl(var(--neutral-7))] ml-2 mr-1">Zaman</span>
                        <Button size="sm" className="h-7 px-2 text-xs">Son 30 Gün</Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Son 7 Gün</Button>
                    </div>
                )}
            </div>

            {/* ANALYSIS SIDEBAR PANEL */}
            {analysisMode && (
                <div className={cn(
                    "absolute top-16 left-4 z-[400] w-72",
                    "bg-[hsl(var(--surface)/0.98)] backdrop-blur-sm",
                    "shadow-[var(--shadow-lg)]",
                    "border border-[hsl(var(--neutral-4))]",
                    "rounded-[var(--radius-lg)] overflow-hidden flex flex-col",
                    "max-h-[calc(100vh-120px)]"
                )}>
                    <div className={cn(
                        "p-4 border-b border-[hsl(var(--neutral-3))]",
                        "bg-[hsl(var(--neutral-2))]",
                        "flex justify-between items-center"
                    )}>
                        <span className="font-medium text-sm text-[hsl(var(--neutral-9))]">Bölge Analizi</span>
                        <Button
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setIsDrawing(true)}
                            disabled={isDrawing || !!analyzingArea}
                        >
                            <PenTool size={12} className="mr-1" />
                            Çizim
                        </Button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-4">
                        {analyzingArea && (
                            <div className={cn(
                                "space-y-3 p-4 rounded-[var(--radius-md)]",
                                "bg-[hsl(var(--blue-1))]",
                                "border border-[hsl(var(--blue-3))]"
                            )}>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm text-[hsl(var(--blue-9))]">Seçili Alan</h4>
                                    <button onClick={() => setAnalyzingArea(null)} className="text-[hsl(var(--neutral-6))] hover:text-[hsl(var(--neutral-9))]">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-[hsl(var(--surface))] p-3 rounded-[var(--radius-sm)] border border-[hsl(var(--neutral-4))]">
                                        <div className="text-xl font-semibold text-[hsl(var(--blue-7))]">{analyzingArea.stats.total}</div>
                                        <div className="text-xs text-[hsl(var(--neutral-7))]">Toplam</div>
                                    </div>
                                    <div className="bg-[hsl(var(--surface))] p-3 rounded-[var(--radius-sm)] border border-[hsl(var(--red-3))]">
                                        <div className="text-xl font-semibold text-[hsl(var(--red-7))]">{analyzingArea.stats.priorityCounts.high || 0}</div>
                                        <div className="text-xs text-[hsl(var(--neutral-7))]">Acil</div>
                                    </div>
                                </div>
                                <Button className="w-full" size="sm" onClick={saveCurrentArea}>
                                    <Save size={14} className="mr-1.5" />
                                    Kaydet
                                </Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <span className="text-xs font-medium text-[hsl(var(--neutral-7))]">Kaydedilen Bölgeler</span>
                            {savedAreas.length === 0 && (
                                <div className="text-sm text-[hsl(var(--neutral-6))] italic p-3 rounded-[var(--radius-sm)] border border-dashed border-[hsl(var(--neutral-4))] text-center">
                                    Henüz bölge yok
                                </div>
                            )}
                            <div className="space-y-2">
                                {savedAreas.map(area => (
                                    <div
                                        key={area.id}
                                        className={cn(
                                            "p-3 bg-[hsl(var(--surface))] rounded-[var(--radius-sm)]",
                                            "border border-[hsl(var(--neutral-4))]",
                                            "hover:border-[hsl(var(--blue-5))]",
                                            "cursor-pointer transition-colors"
                                        )}
                                        onClick={() => setAnalyzingArea({ points: area.points, stats: area.stats })}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-medium text-sm text-[hsl(var(--neutral-11))]">{area.name}</div>
                                            <ChevronRight size={12} className="text-[hsl(var(--neutral-6))]" />
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <span className="text-[hsl(var(--blue-7))]">{area.stats.total} kayıt</span>
                                            <span className="text-[hsl(var(--red-7))]">{area.stats.priorityCounts.high || 0} acil</span>
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
                            color: 'hsl(214, 78%, 50%)',
                            fillColor: 'hsl(214, 78%, 50%)',
                            fillOpacity: 0.1,
                            weight: 2,
                            dashArray: '4, 4'
                        }}
                    />
                )}
            </MapView>

            {/* Selected Issue Preview */}
            {selectedIssue && sheetOpen && (
                <div className="absolute bottom-4 left-4 right-4 z-[500] pointer-events-none flex justify-center md:justify-start">
                    <div className={cn(
                        "w-full max-w-sm pointer-events-auto overflow-hidden",
                        "bg-[hsl(var(--surface)/0.98)] backdrop-blur-sm rounded-[var(--radius-lg)]",
                        "shadow-[var(--shadow-lg)]",
                        "border border-[hsl(var(--neutral-4))]"
                    )}>
                        <div className="p-4 relative">
                            <button
                                onClick={() => setSheetOpen(false)}
                                className={cn(
                                    "absolute right-3 top-3 h-7 w-7 rounded-full",
                                    "flex items-center justify-center",
                                    "bg-[hsl(var(--neutral-2))] text-[hsl(var(--neutral-7))]",
                                    "hover:bg-[hsl(var(--neutral-3))]",
                                    "transition-colors"
                                )}
                            >
                                <X size={14} />
                            </button>

                            <div className="space-y-3 pr-8">
                                <div className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full",
                                    "text-xs font-medium",
                                    "bg-[hsl(var(--blue-1))] text-[hsl(var(--blue-9))]"
                                )}>
                                    {STRINGS.status[selectedIssue.status]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base text-[hsl(var(--neutral-11))] leading-tight">
                                        {selectedIssue.title}
                                    </h3>
                                    <p className="text-sm text-[hsl(var(--neutral-7))] mt-1 line-clamp-2">
                                        {selectedIssue.description}
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" className="flex-1" onClick={() => window.location.href = `/issues/${selectedIssue.id}`}>
                                        Detay
                                        <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-8 h-8 p-0" onClick={() => setSheetOpen(false)}>
                                        <X size={14} />
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
