"use client";

import { useMapEvents, Polygon, Marker } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import { Issue } from "@/features/issue/model/types";
import { Button } from "@/shared/ui/button";

interface PolygonDrawerProps {
    drawing: boolean;
    onComplete: (points: [number, number][], stats: any) => void;
    issues: Issue[];
    onCancel: () => void;
}

export function PolygonDrawer({ drawing, onComplete, issues, onCancel }: PolygonDrawerProps) {
    const [points, setPoints] = useState<[number, number][]>([]);

    // reset points when drawing restarts
    useEffect(() => {
        if (drawing) {
            setPoints([]);
        }
    }, [drawing]);

    useMapEvents({
        click(e) {
            if (!drawing) return;
            const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
            setPoints(prev => [...prev, newPoint]);
        }
    });

    const finishDrawing = () => {
        if (points.length < 3) {
            alert("En az 3 nokta gerekli.");
            return;
        }

        // Calculate Stats
        const stats = analyzeStats(points, issues);
        onComplete(points, stats);
        setPoints([]); // Clear local points, parent handles persisting the "Saved Area"
    };

    // Ray-casting algorithm for Point in Polygon
    const isInside = (point: { lat: number, lng: number }, poly: [number, number][]) => {
        const x = point.lat, y = point.lng;
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i][0], yi = poly[i][1];
            const xj = poly[j][0], yj = poly[j][1];

            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    const analyzeStats = (poly: [number, number][], issueList: Issue[]) => {
        const inside = issueList.filter(i =>
            i.location.lat && i.location.lng && isInside({ lat: i.location.lat, lng: i.location.lng }, poly)
        );

        const categoryCounts: Record<string, number> = {};
        const priorityCounts: Record<string, number> = {};

        inside.forEach(i => {
            categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
            priorityCounts[i.priority] = (priorityCounts[i.priority] || 0) + 1;
        });

        return {
            total: inside.length,
            categoryCounts,
            priorityCounts
        };
    };

    if (!drawing && points.length === 0) return null;

    return (
        <>
            {points.length > 0 && (
                <>
                    <Polygon positions={points} pathOptions={{ color: 'purple', dashArray: '5, 5' }} />
                    {points.map((p, idx) => (
                        <Marker key={idx} position={p} icon={L.divIcon({ className: 'w-2 h-2 bg-purple-600 rounded-full border border-white' })} />
                    ))}
                </>
            )}

            {drawing && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-surface p-2 rounded-lg shadow-lg flex flex-col gap-2 items-center animate-in fade-in zoom-in">
                    <span className="text-sm font-bold">Alan Çizimi Aktif</span>
                    <span className="text-xs text-muted-foreground">{points.length} Nokta Eklendi</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={onCancel}>İptal</Button>
                        <Button size="sm" onClick={finishDrawing}>Tamamla & Analiz Et</Button>
                    </div>
                </div>
            )}
        </>
    );
}
