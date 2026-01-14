"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { 
    Image as ImageIcon, 
    Play, 
    X, 
    ChevronLeft, 
    ChevronRight,
    Download,
    Maximize2,
    Video
} from "lucide-react";
import { useTranslations } from "next-intl";

interface MediaItem {
    type: 'photo' | 'video';
    url: string;
    thumbnail?: string;
}

interface MediaGalleryProps {
    photos: string[];
    videos?: string[];
    className?: string;
}

export function MediaGallery({ photos, videos = [], className }: MediaGalleryProps) {
    const t = useTranslations("media");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Combine photos and videos into a single media array
    const mediaItems: MediaItem[] = [
        ...photos.map(url => ({ type: 'photo' as const, url })),
        ...videos.map(url => ({ type: 'video' as const, url })),
    ];

    const totalItems = mediaItems.length;

    if (totalItems === 0) {
        return null;
    }

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
    };

    const currentItem = mediaItems[currentIndex];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') setLightboxOpen(false);
    };

    return (
        <>
            {/* Gallery Grid */}
            <div className={cn("space-y-3", className)}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--neutral-7))]">
                        <ImageIcon size={14} />
                        <span>{t('attachments') || 'Ekler'}</span>
                        <span className="px-1.5 py-0.5 bg-[hsl(var(--neutral-2))] rounded text-[10px]">
                            {totalItems}
                        </span>
                    </div>
                    {videos.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[hsl(var(--neutral-6))]">
                            <Video size={12} />
                            <span>{videos.length} {t('video') || 'video'}</span>
                        </div>
                    )}
                </div>

                {/* Thumbnail Grid */}
                <div className={cn(
                    "grid gap-2",
                    totalItems === 1 && "grid-cols-1",
                    totalItems === 2 && "grid-cols-2",
                    totalItems >= 3 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                )}>
                    {mediaItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => openLightbox(index)}
                            className={cn(
                                "relative group overflow-hidden rounded-lg",
                                "bg-[hsl(var(--neutral-2))]",
                                "border border-[hsl(var(--neutral-4))]",
                                "hover:border-[hsl(var(--blue-5))]",
                                "transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--blue-6)/0.4)]",
                                totalItems === 1 ? "aspect-video" : "aspect-square"
                            )}
                        >
                            {item.type === 'photo' ? (
                                <img
                                    src={item.url}
                                    alt={`${t('photo') || 'Fotoğraf'} ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <>
                                    {/* Video Thumbnail */}
                                    <div className="w-full h-full bg-[hsl(var(--neutral-3))] flex items-center justify-center">
                                        <video
                                            src={item.url}
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                        />
                                    </div>
                                    {/* Play Icon Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play size={24} className="text-[hsl(var(--neutral-11))] ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Hover Overlay for Photos */}
                            {item.type === 'photo' && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Maximize2 className="w-6 h-6 text-white drop-shadow-lg" />
                                </div>
                            )}

                            {/* Index Badge (for multiple items) */}
                            {totalItems > 1 && (
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                                    {index + 1}/{totalItems}
                                </div>
                            )}

                            {/* Video Duration Badge (placeholder) */}
                            {item.type === 'video' && (
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] font-medium text-white flex items-center gap-1">
                                    <Video size={10} />
                                    {t('video') || 'Video'}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lightbox Dialog */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent 
                    className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-black/95 border-none overflow-hidden"
                    onKeyDown={handleKeyDown}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Media Counter */}
                    <div className="absolute top-4 left-4 z-50 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                        {currentIndex + 1} / {totalItems}
                    </div>

                    {/* Download Button */}
                    <a
                        href={currentItem?.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-4 right-16 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <Download className="w-5 h-5 text-white" />
                    </a>

                    {/* Main Content */}
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {currentItem?.type === 'photo' ? (
                            <img
                                src={currentItem.url}
                                alt={`${t('photo') || 'Fotoğraf'} ${currentIndex + 1}`}
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        ) : currentItem?.type === 'video' ? (
                            <video
                                src={currentItem.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-full rounded-lg"
                            >
                                {t('videoNotSupported') || 'Tarayıcınız video oynatmayı desteklemiyor.'}
                            </video>
                        ) : null}
                    </div>

                    {/* Navigation Arrows */}
                    {totalItems > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        </>
                    )}

                    {/* Thumbnail Strip */}
                    {totalItems > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-lg max-w-[90%] overflow-x-auto">
                            {mediaItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        "relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden transition-all",
                                        index === currentIndex
                                            ? "ring-2 ring-white ring-offset-2 ring-offset-black/50"
                                            : "opacity-50 hover:opacity-80"
                                    )}
                                >
                                    {item.type === 'photo' ? (
                                        <img
                                            src={item.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[hsl(var(--neutral-8))] flex items-center justify-center">
                                            <Play size={16} className="text-white" fill="currentColor" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

// Empty state component for when there's no media
export function MediaEmptyState({ className }: { className?: string }) {
    const t = useTranslations("media");
    
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-8 text-center",
            "bg-[hsl(var(--neutral-2))] rounded-lg border border-dashed border-[hsl(var(--neutral-4))]",
            className
        )}>
            <ImageIcon className="w-10 h-10 text-[hsl(var(--neutral-5))] mb-2" />
            <p className="text-sm font-medium text-[hsl(var(--neutral-7))]">
                {t('noMedia') || 'Ek dosya yok'}
            </p>
            <p className="text-xs text-[hsl(var(--neutral-6))] mt-1">
                {t('noMediaDesc') || 'Bu talep için fotoğraf veya video eklenmemiş'}
            </p>
        </div>
    );
}

