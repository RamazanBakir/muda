"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, useMemo } from "react";
import { MUG_CENTER, ZOOM_LEVEL, TILE_PROVIDERS } from "../lib/config";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Locate, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

// Fix Leaflet Default Icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    title: string;
    status: string;
    onClick?: () => void;
}

interface MapViewProps {
    className?: string;
    center?: { lat: number, lng: number };
    zoom?: number;
    markers?: MapMarker[];
    onMapClick?: (lat: number, lng: number) => void;
    draggableValues?: { lat: number, lng: number };
    setDraggableValues?: (val: { lat: number, lng: number }) => void;
    onBoundsChange?: (bounds: L.LatLngBounds) => void;
    children?: React.ReactNode;
}


// Map Events Controller
function MapEvents({ onClick, onBoundsChange }: { onClick?: (lat: number, lng: number) => void, onBoundsChange?: (bounds: L.LatLngBounds) => void }) {
    const map = useMapEvents({
        click(e) {
            onClick?.(e.latlng.lat, e.latlng.lng);
        },
        moveend() {
            onBoundsChange?.(map.getBounds());
        },
        zoomend() {
            onBoundsChange?.(map.getBounds());
        }
    });

    // Initial bounds trigger
    useEffect(() => {
        if (onBoundsChange) {
            onBoundsChange(map.getBounds());
        }
    }, [map, onBoundsChange]);

    return null;
}

// Controller to handle center updates programmatically
function MapCenterController({ center }: { center?: { lat: number, lng: number } }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), { duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

// Custom Controls Component
function MapControls({ onLocate, onReset }: { onLocate: () => void, onReset: () => void }) {
    const t = useTranslations("map");
    return (
        <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="h-10 w-10 shadow-md bg-white hover:bg-neutral-50 rounded-full" onClick={onLocate} title={t('locateMe')}>
                <Locate className="h-5 w-5 text-neutral-700" />
            </Button>
            <Button size="icon" variant="secondary" className="h-10 w-10 shadow-md bg-white hover:bg-neutral-50 rounded-full" onClick={onReset} title={t('resetCenter')}>
                <RotateCcw className="h-5 w-5 text-neutral-700" />
            </Button>
        </div>
    )
}

export function MapView({ className, center = MUG_CENTER, zoom = ZOOM_LEVEL, markers = [], onMapClick, draggableValues, setDraggableValues, onBoundsChange, children }: MapViewProps) {
    const t = useTranslations("map");
    const [activeCenter, setActiveCenter] = useState(center);

    // Memoized markers
    const renderedMarkers = useMemo(() => {
        return markers.map(m => (
            <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                eventHandlers={{
                    click: () => m.onClick && m.onClick()
                }}
            />
        ));
    }, [markers]);

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setActiveCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => {
                    alert(`${t('errorLocate')}: ${err.message}`);
                }
            );
        }
    };

    const handleReset = () => {
        setActiveCenter(MUG_CENTER);
    };

    return (
        <div className={cn("relative z-0 h-full w-full overflow-hidden bg-muted", className)}>
            <MapContainer
                center={activeCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full outline-none"
                zoomControl={false}
            >
                <TileLayer
                    attribution={TILE_PROVIDERS.cartoLight.attribution}
                    url={TILE_PROVIDERS.cartoLight.url}
                />

                <MapCenterController center={activeCenter} />
                <MapEvents onClick={onMapClick} onBoundsChange={onBoundsChange} />

                {renderedMarkers}

                {/* Draggable Selection Marker */}
                {draggableValues && (
                    <Marker
                        position={draggableValues}
                        draggable={!!setDraggableValues}
                        eventHandlers={{
                            dragend: (e) => {
                                if (setDraggableValues) {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    setDraggableValues(position);
                                }
                            }
                        }}
                    >
                        <Popup>{t('selectedLoc')}</Popup>
                    </Marker>
                )}

                {/* Children Overlays */}
                {children}

            </MapContainer>


            {/* Controls Overlay */}
            <MapControls onLocate={handleLocateMe} onReset={handleReset} />
        </div>
    );
}

