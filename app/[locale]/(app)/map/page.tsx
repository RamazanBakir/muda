"use client";

import { useEffect, useState, useMemo } from "react";
import { MapView } from "@/features/map/ui/MapView";
import { useSession } from "@/features/auth";
import { issueRepository, Issue } from "@/features/issue";
import { Button } from "@/shared/ui/button";
import { HeatmapLayer } from "@/features/map/ui/overlays/HeatmapLayer";
import { PolygonDrawer } from "@/features/map/ui/overlays/PolygonDrawer";
import { Polygon, Marker, Popup } from "react-leaflet";
import { STRINGS } from "@/shared/config/strings";
import { cn } from "@/shared/lib/cn";
import { useRouter } from "@/navigation";
import {
    generateMockMapData,
    MapIssuePoint,
    getCategoryColor,
    getPriorityColor,
    MUGLA_DISTRICTS
} from "@/features/map/lib/mockMapData";
import { createCategoryIcon, markerStyles } from "@/features/map/ui/CategoryMarker";
import { MapLegend, MapStats } from "@/features/map/ui/MapLegend";
import { IssueCategory, IssuePriority } from "@/features/issue/model/types";
import {
    Zap,
    Map as MapIcon,
    Flame,
    PenTool,
    X,
    ChevronRight,
    BarChart2,
    Save,
    Filter,
    Eye,
    EyeOff,
    Info
} from "lucide-react";

export default function MapPage() {
    const { session } = useSession();
    const router = useRouter();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [selectedMapPoint, setSelectedMapPoint] = useState<MapIssuePoint | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [overlayType, setOverlayType] = useState<"markers" | "heatmap" | "hotspots">("markers");
    const [showLegend, setShowLegend] = useState(true);

    // Analysis & Drawing States
    const [analysisMode, setAnalysisMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [savedAreas, setSavedAreas] = useState<Array<{ id: string, name: string, points: [number, number][], stats: any }>>([]);
    const [analyzingArea, setAnalyzingArea] = useState<{ points: [number, number][], stats: any } | null>(null);

    // Mock map data for visualization
    const mockMapData = useMemo(() => generateMockMapData(60), []);

    // Inject custom marker styles
    useEffect(() => {
        const styleEl = document.createElement('style');
        styleEl.innerHTML = markerStyles;
        document.head.appendChild(styleEl);
        return () => {
            document.head.removeChild(styleEl);
        };
    }, []);

    useEffect(() => {
        const load = async () => {
            const all = await issueRepository.getIssues({
                role: session?.role || 'citizen',
                unitId: session?.role === 'unit' ? session.unitId : undefined,
                neighborhoodId: session?.role === 'muhtar' ? session.neighborhoodId : undefined
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

    // Combine real issues with mock data for markers
    const allMapPoints = useMemo(() => {
        // Convert real issues to map points
        const realPoints: MapIssuePoint[] = issues
            .filter(i => i.location.lat && i.location.lng)
            .map(i => ({
                id: i.id,
                lat: i.location.lat!,
                lng: i.location.lng!,
                title: i.title,
                category: i.category,
                priority: i.priority,
                status: i.status,
                district: i.location.district || "Menteşe",
                createdAt: i.createdAt
            }));
        
        // Combine with mock data
        return [...realPoints, ...mockMapData];
    }, [issues, mockMapData]);

    // Calculate statistics
    const stats = useMemo(() => {
        const byCategory: Record<IssueCategory, number> = {
            transportation: 0,
            water_sewer: 0,
            parks: 0,
            waste: 0
        };
        const byPriority: Record<IssuePriority, number> = {
            high: 0,
            medium: 0,
            low: 0
        };

        allMapPoints.forEach(p => {
            byCategory[p.category]++;
            byPriority[p.priority]++;
        });

        return {
            total: allMapPoints.length,
            byCategory,
            byPriority
        };
    }, [allMapPoints]);

    const handleMarkerClick = (point: MapIssuePoint) => {
        if (isDrawing) return;
        
        // Check if it's a real issue
        const realIssue = issues.find(i => i.id === point.id);
        if (realIssue) {
            setSelectedIssue(realIssue);
            setSelectedMapPoint(null);
        } else {
            setSelectedMapPoint(point);
            setSelectedIssue(null);
        }
        setSheetOpen(true);
    };

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

                {/* Right side controls */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    {overlayType !== 'markers' && !analysisMode && (
                        <div className={cn(
                            "bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm p-1 rounded-[var(--radius-md)]",
                            "border border-[hsl(var(--neutral-4))]",
                            "shadow-[var(--shadow-md)]",
                            "flex items-center gap-1"
                        )}>
                            <span className="text-xs font-medium text-[hsl(var(--neutral-7))] ml-2 mr-1">Zaman</span>
                            <Button size="sm" className="h-7 px-2 text-xs">Son 30 Gün</Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Son 7 Gün</Button>
                        </div>
                    )}
                    
                    {/* Legend toggle */}
                    {!analysisMode && (
                        <Button
                            size="sm"
                            variant={showLegend ? "primary" : "ghost"}
                            onClick={() => setShowLegend(!showLegend)}
                            className={cn(
                                "h-8 w-8 p-0",
                                "bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm",
                                "border border-[hsl(var(--neutral-4))]",
                                "shadow-[var(--shadow-md)]",
                                showLegend && "bg-[hsl(var(--blue-6))] border-transparent"
                            )}
                        >
                            {showLegend ? <Eye size={14} /> : <EyeOff size={14} />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Legend Panel */}
            {showLegend && !analysisMode && overlayType === 'markers' && (
                <div className="absolute top-16 right-4 z-[400]">
                    <MapStats 
                        total={stats.total}
                        byCategory={stats.byCategory}
                        byPriority={stats.byPriority}
                        className="w-52"
                    />
                </div>
            )}

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
                markers={[]}
            >
                {/* Custom Category Markers */}
                {overlayType === 'markers' && !analysisMode && allMapPoints.map((point) => (
                    <Marker
                        key={point.id}
                        position={[point.lat, point.lng]}
                        icon={createCategoryIcon(point.category, point.priority, point.status)}
                        eventHandlers={{
                            click: () => handleMarkerClick(point)
                        }}
                    >
                        <Popup>
                            <div className="min-w-[180px] p-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getCategoryColor(point.category) }}
                                    />
                                    <span className="text-xs font-medium text-[hsl(var(--neutral-7))]">
                                        {point.district}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{point.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                        style={{ backgroundColor: getPriorityColor(point.priority) }}
                                    >
                                        {point.priority === 'high' ? 'Acil' : point.priority === 'medium' ? 'Normal' : 'Düşük'}
                                    </span>
                                    <span className="text-[10px] text-[hsl(var(--neutral-6))]">
                                        {point.id}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Heatmap/Hotspot layers use combined data */}
                {overlayType !== 'markers' && !analysisMode && (
                    <HeatmapLayer 
                        issues={allMapPoints.map(p => ({
                            id: p.id,
                            title: p.title,
                            description: "",
                            location: { lat: p.lat, lng: p.lng, district: p.district },
                            category: p.category,
                            priority: p.priority,
                            status: p.status,
                            createdAt: p.createdAt,
                            updatedAt: p.createdAt,
                            reporter: { type: "citizen", id: "mock", name: "Mock" },
                            media: { photos: [] },
                            timeline: []
                        } as Issue))} 
                        type={overlayType} 
                    />
                )}

                <PolygonDrawer
                    drawing={isDrawing}
                    issues={allMapPoints.map(p => ({
                        id: p.id,
                        title: p.title,
                        description: "",
                        location: { lat: p.lat, lng: p.lng, district: p.district },
                        category: p.category,
                        priority: p.priority,
                        status: p.status,
                        createdAt: p.createdAt,
                        updatedAt: p.createdAt,
                        reporter: { type: "citizen", id: "mock", name: "Mock" },
                        media: { photos: [] },
                        timeline: []
                    } as Issue))}
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

            {/* Bottom Legend (Mobile) */}
            {showLegend && !analysisMode && overlayType === 'markers' && (
                <div className="absolute bottom-4 left-4 z-[400] md:hidden">
                    <MapLegend compact showPriorities={false} />
                </div>
            )}

            {/* Selected Issue/Point Preview */}
            {(selectedIssue || selectedMapPoint) && sheetOpen && (
                <div className="absolute bottom-4 left-4 right-4 z-[500] pointer-events-none flex justify-center md:justify-start">
                    <div className={cn(
                        "w-full max-w-sm pointer-events-auto overflow-hidden",
                        "bg-[hsl(var(--surface)/0.98)] backdrop-blur-sm rounded-[var(--radius-lg)]",
                        "shadow-[var(--shadow-lg)]",
                        "border border-[hsl(var(--neutral-4))]"
                    )}>
                        <div className="p-4 relative">
                            <button
                                onClick={() => { setSheetOpen(false); setSelectedIssue(null); setSelectedMapPoint(null); }}
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
                                {/* Category & Priority badges */}
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                        style={{ 
                                            backgroundColor: getCategoryColor(
                                                selectedIssue?.category || selectedMapPoint?.category || 'transportation'
                                            ) 
                                        }}
                                    >
                                        {STRINGS.category[selectedIssue?.category || selectedMapPoint?.category || 'transportation']}
                                    </span>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                        style={{
                                            backgroundColor: getPriorityColor(
                                                selectedIssue?.priority || selectedMapPoint?.priority || 'medium'
                                            )
                                        }}
                                    >
                                        {selectedIssue?.priority === 'high' || selectedMapPoint?.priority === 'high' ? 'Acil' : 
                                         selectedIssue?.priority === 'low' || selectedMapPoint?.priority === 'low' ? 'Düşük' : 'Normal'}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <div>
                                    <h3 className="font-semibold text-base text-[hsl(var(--neutral-11))] leading-tight">
                                        {selectedIssue?.title || selectedMapPoint?.title}
                                    </h3>
                                    {selectedIssue?.description && (
                                        <p className="text-sm text-[hsl(var(--neutral-7))] mt-1 line-clamp-2">
                                            {selectedIssue.description}
                                        </p>
                                    )}
                                    {selectedMapPoint && !selectedIssue && (
                                        <p className="text-sm text-[hsl(var(--neutral-7))] mt-1">
                                            📍 {selectedMapPoint.district}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    {selectedIssue ? (
                                        <Button 
                                            size="sm" 
                                            className="flex-1" 
                                            onClick={() => router.push(`/issues/${selectedIssue.id}`)}
                                        >
                                            Detay
                                            <ChevronRight size={14} className="ml-1" />
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--neutral-6))]">
                                            <Info size={12} />
                                            Demo verisi - Gerçek kayıt değil
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
