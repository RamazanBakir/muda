"use client";

import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { Issue } from "@/features/issue/model/types";

// Types
export type OverlayType = "markers" | "heatmap" | "hotspots";

interface HeatmapLayerProps {
    issues: Issue[];
    type: OverlayType;
}

export function HeatmapLayer({ issues, type }: HeatmapLayerProps) {
    const map = useMap();
    const overlayRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!map) return;

        // Clear previous layer
        if (overlayRef.current) {
            overlayRef.current.clearLayers();
            map.removeLayer(overlayRef.current);
            overlayRef.current = null;
        }

        if (type === "markers") return; // Handled by parent MapView markers prop usually

        const layerGroup = L.layerGroup().addTo(map);
        overlayRef.current = layerGroup;

        if (type === "heatmap") {
            // Grid-based Density Heatmap Implementation (Plugin-less)
            // 1. Calculate Grid
            const bounds = map.getBounds();
            const size = 20; // 20x20 grid
            const latStep = (bounds.getNorth() - bounds.getSouth()) / size;
            const lngStep = (bounds.getEast() - bounds.getWest()) / size;

            const grid: Record<string, number> = {};
            let maxCount = 0;

            issues.forEach(i => {
                if (!i.location.lat || !i.location.lng) return;
                // Simple bucket
                const latIdx = Math.floor((i.location.lat - bounds.getSouth()) / latStep);
                const lngIdx = Math.floor((i.location.lng - bounds.getWest()) / lngStep);
                const key = `${latIdx},${lngIdx}`;
                grid[key] = (grid[key] || 0) + 1;
                if (grid[key] > maxCount) maxCount = grid[key];
            });

            // 2. Draw Rectangles
            Object.entries(grid).forEach(([key, count]) => {
                const [latIdx, lngIdx] = key.split(',').map(Number);
                const south = bounds.getSouth() + latIdx * latStep;
                const west = bounds.getWest() + lngIdx * lngStep;
                const north = south + latStep;
                const east = west + lngStep;

                const intensity = count / maxCount;
                // Color scale: Blue -> Green -> Red
                let color = "#3b82f6"; // Blue
                if (intensity > 0.4) color = "#eab308"; // Yellow
                if (intensity > 0.7) color = "#ef4444"; // Red

                L.rectangle([[south, west], [north, east]], {
                    color: "transparent",
                    fillColor: color,
                    fillOpacity: 0.3 + (intensity * 0.4), // 0.3 to 0.7
                    weight: 0
                }).addTo(layerGroup);
            });
        }
        else if (type === "hotspots") {
            // Hotspots: Show large circles for clusters or high-priority areas
            // Simple clustering simulation: Group by 0.005 lat/lng (~500m)
            const clusterSize = 0.005;
            const clusters: Record<string, { count: number, lat: number, lng: number, topCat: string }> = {};

            issues.forEach(i => {
                if (!i.location.lat || !i.location.lng) return;
                const latKey = Math.floor(i.location.lat / clusterSize);
                const lngKey = Math.floor(i.location.lng / clusterSize);
                const key = `${latKey},${lngKey}`;

                if (!clusters[key]) {
                    clusters[key] = { count: 0, lat: 0, lng: 0, topCat: i.category };
                }

                const c = clusters[key];
                // Running average for center calculation
                c.lat = (c.lat * c.count + i.location.lat) / (c.count + 1);
                c.lng = (c.lng * c.count + i.location.lng) / (c.count + 1);
                c.count++;
            });

            // Render Hotspots
            Object.values(clusters).forEach(c => {
                if (c.count < 2) return; // Skip single items

                const circle = L.circle([c.lat, c.lng], {
                    radius: 300 + (c.count * 20), // Grows with count
                    color: "#f43f5e",
                    fillColor: "#f43f5e",
                    fillOpacity: 0.4,
                    weight: 2
                }).addTo(layerGroup);

                // Add Text Label
                const icon = L.divIcon({
                    html: `<div class="flex items-center justify-center w-full h-full text-white font-bold text-sm drop-shadow-md">${c.count}</div>`,
                    className: "",
                    iconSize: [30, 30]
                });
                L.marker([c.lat, c.lng], { icon, interactive: false }).addTo(layerGroup);

                circle.bindPopup(`
                    <div class="text-center p-2">
                        <div class="font-bold text-lg">${c.count} Sorun</div>
                        <div class="text-xs text-muted-foreground uppercase">Yoğun Bölge</div>
                        <button class="mt-2 text-xs bg-primary text-white px-2 py-1 rounded w-full">Listele</button>
                    </div>
                `);
            });
        }

        return () => {
            if (overlayRef.current) {
                overlayRef.current.clearLayers();
                map.removeLayer(overlayRef.current);
            }
        };
    }, [map, type, issues]);

    return null;
}
