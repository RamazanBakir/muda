"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { useTranslations } from "next-intl";
import { 
    Camera, 
    Video, 
    ImagePlus, 
    X, 
    Play,
    Image as ImageIcon,
    Film
} from "lucide-react";

export interface MediaFile {
    id: string;
    type: "photo" | "video";
    url: string;
    name: string;
    size: number;
}

interface MediaUploaderProps {
    value: MediaFile[];
    onChange: (files: MediaFile[]) => void;
    maxPhotos?: number;
    maxVideos?: number;
    maxFileSizeMB?: number;
    disabled?: boolean;
}

export function MediaUploader({
    value = [],
    onChange,
    maxPhotos = 5,
    maxVideos = 2,
    maxFileSizeMB = 10,
    disabled = false
}: MediaUploaderProps) {
    const t = useTranslations("issueForm.media");
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    
    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const videoCaptureRef = useRef<HTMLInputElement>(null);

    const photoCount = value.filter(f => f.type === "photo").length;
    const videoCount = value.filter(f => f.type === "video").length;

    const generateId = () => `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const handleFileSelect = useCallback((files: FileList | null, type: "photo" | "video") => {
        if (!files || disabled) return;

        const currentCount = type === "photo" ? photoCount : videoCount;
        const maxCount = type === "photo" ? maxPhotos : maxVideos;
        
        const availableSlots = maxCount - currentCount;
        if (availableSlots <= 0) return;

        const newFiles: MediaFile[] = [];
        
        for (let i = 0; i < Math.min(files.length, availableSlots); i++) {
            const file = files[i];
            
            // Check file size
            if (file.size > maxFileSizeMB * 1024 * 1024) {
                alert(`${file.name} çok büyük. Maksimum ${maxFileSizeMB} MB olabilir.`);
                continue;
            }

            // Validate file type
            const isValidPhoto = type === "photo" && file.type.startsWith("image/");
            const isValidVideo = type === "video" && file.type.startsWith("video/");
            
            if (!isValidPhoto && !isValidVideo) {
                continue;
            }

            const url = URL.createObjectURL(file);
            newFiles.push({
                id: generateId(),
                type,
                url,
                name: file.name,
                size: file.size
            });
        }

        if (newFiles.length > 0) {
            onChange([...value, ...newFiles]);
        }
    }, [value, photoCount, videoCount, maxPhotos, maxVideos, maxFileSizeMB, onChange, disabled]);

    const handleRemove = useCallback((id: string) => {
        const file = value.find(f => f.id === id);
        if (file) {
            URL.revokeObjectURL(file.url);
        }
        onChange(value.filter(f => f.id !== id));
        if (previewFile?.id === id) {
            setPreviewFile(null);
        }
    }, [value, onChange, previewFile]);

    const canAddPhoto = photoCount < maxPhotos;
    const canAddVideo = videoCount < maxVideos;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Camera size={16} className="text-[hsl(var(--neutral-7))]" />
                    <span className="text-sm font-medium text-[hsl(var(--neutral-9))]">
                        {t("title")}
                    </span>
                </div>
                <span className="text-xs text-[hsl(var(--neutral-6))]">
                    {t("hint")}
                </span>
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Photo Upload Button */}
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || !canAddPhoto}
                        onClick={() => photoInputRef.current?.click()}
                        className={cn(
                            "gap-1.5",
                            !canAddPhoto && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <ImagePlus size={14} />
                        {t("addPhoto")}
                    </Button>
                    <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files, "photo")}
                    />
                </div>

                {/* Camera Capture Button */}
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || !canAddPhoto}
                        onClick={() => cameraInputRef.current?.click()}
                        className={cn(
                            "gap-1.5",
                            !canAddPhoto && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Camera size={14} />
                        {t("takePhoto")}
                    </Button>
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files, "photo")}
                    />
                </div>

                {/* Video Upload Button */}
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || !canAddVideo}
                        onClick={() => videoInputRef.current?.click()}
                        className={cn(
                            "gap-1.5",
                            !canAddVideo && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Film size={14} />
                        {t("addVideo")}
                    </Button>
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files, "video")}
                    />
                </div>

                {/* Video Capture Button */}
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || !canAddVideo}
                        onClick={() => videoCaptureRef.current?.click()}
                        className={cn(
                            "gap-1.5",
                            !canAddVideo && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Video size={14} />
                        {t("takeVideo")}
                    </Button>
                    <input
                        ref={videoCaptureRef}
                        type="file"
                        accept="video/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files, "video")}
                    />
                </div>
            </div>

            {/* Limits Info */}
            <div className="flex flex-wrap gap-4 text-xs text-[hsl(var(--neutral-6))]">
                <span className="flex items-center gap-1">
                    <ImageIcon size={12} />
                    {photoCount}/{maxPhotos} {t("photosCount", { count: "" })}
                </span>
                <span className="flex items-center gap-1">
                    <Film size={12} />
                    {videoCount}/{maxVideos} {t("videosCount", { count: "" })}
                </span>
                <span>
                    Maks. {maxFileSizeMB} MB/dosya
                </span>
            </div>

            {/* Media Preview Grid */}
            {value.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {value.map((file) => (
                        <div
                            key={file.id}
                            className={cn(
                                "relative aspect-square rounded-lg overflow-hidden",
                                "bg-[hsl(var(--neutral-2))] border border-[hsl(var(--neutral-4))]",
                                "group cursor-pointer",
                                "transition-shadow hover:shadow-md"
                            )}
                            onClick={() => setPreviewFile(file)}
                        >
                            {file.type === "photo" ? (
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="relative w-full h-full">
                                    <video
                                        src={file.url}
                                        className="w-full h-full object-cover"
                                        muted
                                        playsInline
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Play size={24} className="text-white" fill="white" />
                                    </div>
                                </div>
                            )}
                            
                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(file.id);
                                }}
                                className={cn(
                                    "absolute top-1 right-1",
                                    "w-6 h-6 rounded-full",
                                    "bg-[hsl(var(--red-6))] text-white",
                                    "flex items-center justify-center",
                                    "opacity-0 group-hover:opacity-100",
                                    "transition-opacity",
                                    "hover:bg-[hsl(var(--red-7))]"
                                )}
                                aria-label={t("removeFile")}
                            >
                                <X size={14} />
                            </button>

                            {/* Type Badge */}
                            <div className={cn(
                                "absolute bottom-1 left-1",
                                "px-1.5 py-0.5 rounded text-[10px] font-medium",
                                file.type === "photo" 
                                    ? "bg-[hsl(var(--blue-6))] text-white"
                                    : "bg-[hsl(var(--purple-6))] text-white"
                            )}>
                                {file.type === "photo" ? <ImageIcon size={10} /> : <Film size={10} />}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div
                    className={cn(
                        "fixed inset-0 z-50",
                        "bg-black/90 backdrop-blur-sm",
                        "flex items-center justify-center p-4"
                    )}
                    onClick={() => setPreviewFile(null)}
                >
                    <button
                        className={cn(
                            "absolute top-4 right-4",
                            "w-10 h-10 rounded-full",
                            "bg-white/10 hover:bg-white/20",
                            "flex items-center justify-center",
                            "transition-colors"
                        )}
                        onClick={() => setPreviewFile(null)}
                    >
                        <X size={24} className="text-white" />
                    </button>
                    
                    <div 
                        className="max-w-4xl max-h-[80vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {previewFile.type === "photo" ? (
                            <img
                                src={previewFile.url}
                                alt={previewFile.name}
                                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            />
                        ) : (
                            <video
                                src={previewFile.url}
                                controls
                                autoPlay
                                className="w-full max-h-[80vh] rounded-lg"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

