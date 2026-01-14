"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { ExternalLink, PersonStanding, Loader2, Map, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface StreetViewModalProps {
    lat: number;
    lng: number;
    address?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Street View URL formats to try
const getStreetViewUrls = (lat: number, lng: number) => [
    // Format 1: layer=c with cbll
    `https://www.google.com/maps?ll=${lat},${lng}&layer=c&cbll=${lat},${lng}&cbp=12,0,0,0,0&output=embed`,
    // Format 2: Simpler layer=c
    `https://maps.google.com/maps?layer=c&cbll=${lat},${lng}&output=embed`,
    // Format 3: With q parameter
    `https://www.google.com/maps?q=${lat},${lng}&layer=c&cbll=${lat},${lng}&output=embed`,
];

export function StreetViewModal({ lat, lng, address, open, onOpenChange }: StreetViewModalProps) {
    const t = useTranslations("streetView");
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'streetview' | 'map'>('streetview');
    const [urlIndex, setUrlIndex] = useState(0);
    
    const streetViewUrls = getStreetViewUrls(lat, lng);
    
    // Regular map embed URL
    const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=18&t=m&output=embed`;
    
    // Direct link to Google Maps Street View
    const googleMapsStreetViewUrl = `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m7!1e1!3m5!1s!2e0!7i16384!8i8192`;

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setIsLoading(true);
            setUrlIndex(0);
        }
    }, [open]);

    // Reset loading when view mode or URL changes
    useEffect(() => {
        setIsLoading(true);
    }, [viewMode, urlIndex]);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const tryNextUrl = useCallback(() => {
        if (urlIndex < streetViewUrls.length - 1) {
            setUrlIndex(prev => prev + 1);
        }
    }, [urlIndex, streetViewUrls.length]);

    const openInGoogleMaps = () => {
        window.open(googleMapsStreetViewUrl, '_blank', 'noopener,noreferrer');
    };

    // Select URL based on view mode
    const currentUrl = viewMode === 'streetview' ? streetViewUrls[urlIndex] : mapEmbedUrl;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden">
                <DialogHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <PersonStanding className="w-5 h-5 text-[hsl(var(--blue-6))]" />
                            {t('title') || 'Sokak Görünümü'}
                        </DialogTitle>
                        
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-[hsl(var(--neutral-2))] rounded-lg">
                            <button
                                onClick={() => setViewMode('streetview')}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                    viewMode === 'streetview'
                                        ? "bg-[hsl(var(--surface))] text-[hsl(var(--neutral-11))] shadow-sm"
                                        : "text-[hsl(var(--neutral-7))] hover:text-[hsl(var(--neutral-9))]"
                                )}
                            >
                                <PersonStanding className="w-3.5 h-3.5 inline mr-1" />
                                {t('streetViewTab') || 'Sokak'}
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                    viewMode === 'map'
                                        ? "bg-[hsl(var(--surface))] text-[hsl(var(--neutral-11))] shadow-sm"
                                        : "text-[hsl(var(--neutral-7))] hover:text-[hsl(var(--neutral-9))]"
                                )}
                            >
                                <Map className="w-3.5 h-3.5 inline mr-1" />
                                {t('mapTab') || 'Harita'}
                            </button>
                        </div>
                    </div>
                    {address && (
                        <DialogDescription className="text-xs mt-1">
                            {address}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Map/Street View Container */}
                <div className="relative w-full aspect-video bg-[hsl(var(--neutral-2))] min-h-[400px]">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-[hsl(var(--neutral-2))]">
                            <Loader2 className="w-8 h-8 text-[hsl(var(--blue-6))] animate-spin" />
                            <span className="text-sm text-[hsl(var(--neutral-7))]">
                                {viewMode === 'streetview' 
                                    ? (t('loadingStreetView') || 'Sokak görünümü yükleniyor...')
                                    : (t('loading') || 'Harita yükleniyor...')
                                }
                            </span>
                        </div>
                    )}

                    {/* Google Maps Embed */}
                    <iframe
                        key={viewMode} // Force re-render on mode change
                        src={currentUrl}
                        className={cn(
                            "w-full h-full border-0",
                            isLoading && "opacity-0"
                        )}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        onLoad={handleIframeLoad}
                    />

                    {/* Street View Actions Overlay */}
                    {viewMode === 'streetview' && !isLoading && (
                        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
                            <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm rounded-lg shadow-md border border-[hsl(var(--neutral-4))]">
                                <PersonStanding className="w-4 h-4 text-[hsl(var(--blue-6))]" />
                                <span className="text-xs text-[hsl(var(--neutral-7))]">
                                    {t('dragHint') || 'Görünümü değiştirmek için sürükleyin'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {urlIndex < streetViewUrls.length - 1 && (
                                    <button
                                        onClick={tryNextUrl}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm rounded-lg shadow-md border border-[hsl(var(--neutral-4))] hover:bg-[hsl(var(--neutral-2))] transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        {t('tryAnother') || 'Farklı Dene'}
                                    </button>
                                )}
                                <button
                                    onClick={openInGoogleMaps}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[hsl(var(--blue-6))] text-white rounded-lg shadow-md hover:bg-[hsl(var(--blue-7))] transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {t('openFull') || 'Tam Ekran'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[hsl(var(--neutral-3))] flex items-center justify-between">
                    <div className="text-xs text-[hsl(var(--neutral-6))]">
                        <span className="font-medium">{t('coordinates') || 'Koordinatlar'}:</span>{' '}
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={openInGoogleMaps}
                    >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        {t('openInMaps') || 'Google Maps\'te Aç'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Companion button component for triggering Street View
interface StreetViewButtonProps {
    lat: number;
    lng: number;
    address?: string;
    className?: string;
    variant?: "default" | "compact";
}

export function StreetViewButton({ lat, lng, address, className, variant = "default" }: StreetViewButtonProps) {
    const t = useTranslations("streetView");
    const [open, setOpen] = useState(false);

    if (variant === "compact") {
        return (
            <>
                <button
                    onClick={() => setOpen(true)}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5",
                        "text-xs font-medium",
                        "bg-[hsl(var(--amber-1))] text-[hsl(var(--amber-9))]",
                        "border border-[hsl(var(--amber-4))]",
                        "rounded-[var(--radius-md)]",
                        "hover:bg-[hsl(var(--amber-2))] hover:border-[hsl(var(--amber-5))]",
                        "transition-colors duration-150",
                        className
                    )}
                >
                    <PersonStanding className="w-3.5 h-3.5" />
                    {t('button') || 'Sokak Görünümü'}
                </button>
                <StreetViewModal 
                    lat={lat} 
                    lng={lng} 
                    address={address}
                    open={open} 
                    onOpenChange={setOpen} 
                />
            </>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className={cn(
                    "bg-[hsl(var(--amber-1))] text-[hsl(var(--amber-9))]",
                    "border-[hsl(var(--amber-4))]",
                    "hover:bg-[hsl(var(--amber-2))] hover:border-[hsl(var(--amber-5))]",
                    className
                )}
            >
                <PersonStanding className="w-4 h-4 mr-1.5" />
                {t('button') || 'Sokak Görünümü'}
            </Button>
            <StreetViewModal 
                lat={lat} 
                lng={lng} 
                address={address}
                open={open} 
                onOpenChange={setOpen} 
            />
        </>
    );
}

