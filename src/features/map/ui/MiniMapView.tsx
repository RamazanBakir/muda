"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { TILE_PROVIDERS } from "../lib/config";
import { cn } from "@/shared/lib/cn";

// Custom marker icon - blue themed
const LocationIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MiniMapViewProps {
    lat: number;
    lng: number;
    zoom?: number;
    popupContent?: string;
    className?: string;
    height?: string;
}

export function MiniMapView({ 
    lat, 
    lng, 
    zoom = 15, 
    popupContent,
    className,
    height = "h-48"
}: MiniMapViewProps) {
    return (
        <div className={cn(
            "relative z-0 w-full overflow-hidden",
            "bg-[hsl(var(--neutral-2))]",
            height,
            className
        )}>
            <MapContainer
                center={[lat, lng]}
                zoom={zoom}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                attributionControl={false}
                className="h-full w-full outline-none"
                style={{ cursor: 'default' }}
            >
                <TileLayer
                    url={TILE_PROVIDERS.cartoLight.url}
                />
                <Marker position={[lat, lng]} icon={LocationIcon}>
                    {popupContent && (
                        <Popup>
                            <span className="text-sm font-medium">{popupContent}</span>
                        </Popup>
                    )}
                </Marker>
            </MapContainer>
            
            {/* Attribution overlay */}
            <div className="absolute bottom-1 right-1 text-[9px] text-[hsl(var(--neutral-7))] bg-[hsl(var(--surface)/0.9)] px-1.5 py-0.5 rounded font-medium">
                Muğla Büyükşehir Belediyesi
            </div>
        </div>
    );
}

