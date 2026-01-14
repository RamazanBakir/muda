"use client";

import { cn } from "@/shared/lib/cn";
import { Link } from "@/navigation";

interface MudaLogoProps {
    href?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showSubtitle?: boolean;
    subtitle?: string;
    className?: string;
    variant?: "default" | "white";
}

/**
 * MUDA Logo Component
 * 
 * Muğla Ulaşım Dijital Asistanı (MUDA) branded logo
 * Professional gradient design with smooth animations
 */
export function MudaLogo({ 
    href = "/dashboard", 
    size = "md",
    showSubtitle = false,
    subtitle,
    className,
    variant = "default"
}: MudaLogoProps) {
    const sizeConfig = {
        sm: {
            text: "text-lg",
            subtitleSize: "text-[8px]",
            gap: "gap-0.5",
        },
        md: {
            text: "text-xl",
            subtitleSize: "text-[10px]",
            gap: "gap-0.5",
        },
        lg: {
            text: "text-2xl",
            subtitleSize: "text-xs",
            gap: "gap-1",
        },
        xl: {
            text: "text-4xl",
            subtitleSize: "text-sm",
            gap: "gap-1",
        },
    };

    const config = sizeConfig[size];
    const isWhite = variant === "white";

    const LogoContent = () => (
        <div className={cn("flex flex-col", className)}>
            {/* Main Logo Text with Gradient */}
            <div className={cn(
                "flex items-center font-black tracking-tight",
                config.text,
                config.gap
            )}>
                {/* M */}
                <span className={cn(
                    "transition-all duration-300",
                    isWhite 
                        ? "text-white" 
                        : "bg-gradient-to-br from-[hsl(var(--blue-6))] to-[hsl(var(--blue-7))] bg-clip-text text-transparent",
                    "group-hover:scale-105"
                )}>
                    M
                </span>
                
                {/* U */}
                <span className={cn(
                    "transition-all duration-300 delay-[50ms]",
                    isWhite 
                        ? "text-white/90" 
                        : "bg-gradient-to-br from-[hsl(185_70%_45%)] to-[hsl(190_75%_40%)] bg-clip-text text-transparent",
                    "group-hover:scale-105"
                )}>
                    U
                </span>
                
                {/* D */}
                <span className={cn(
                    "transition-all duration-300 delay-[100ms]",
                    isWhite 
                        ? "text-white/90" 
                        : "bg-gradient-to-br from-[hsl(var(--purple-6))] to-[hsl(var(--purple-7))] bg-clip-text text-transparent",
                    "group-hover:scale-105"
                )}>
                    D
                </span>
                
                {/* A */}
                <span className={cn(
                    "transition-all duration-300 delay-[150ms]",
                    isWhite 
                        ? "text-white" 
                        : "bg-gradient-to-br from-[hsl(var(--amber-5))] to-[hsl(var(--amber-6))] bg-clip-text text-transparent",
                    "group-hover:scale-105"
                )}>
                    A
                </span>
            </div>

            {/* Subtitle */}
            {showSubtitle && subtitle && (
                <span className={cn(
                    "font-medium leading-none mt-1",
                    isWhite ? "text-white/70" : "text-[hsl(var(--neutral-6))]",
                    config.subtitleSize
                )}>
                    {subtitle}
                </span>
            )}
        </div>
    );

    if (href) {
        return (
            <Link 
                href={href} 
                className={cn(
                    "group flex items-center",
                    "transition-transform duration-300",
                    "hover:scale-[1.02]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--blue-6))] focus-visible:ring-offset-2 rounded"
                )}
            >
                <LogoContent />
            </Link>
        );
    }

    return <LogoContent />;
}

/**
 * Compact Logo Mark (Just "M" with gradient background)
 * For mobile or constrained spaces
 */
export function MudaLogoMark({ 
    href,
    size = "md",
    className 
}: Omit<MudaLogoProps, "showSubtitle" | "subtitle" | "variant">) {
    const sizeConfig = {
        sm: "w-7 h-7 text-xs rounded-lg",
        md: "w-9 h-9 text-sm rounded-xl",
        lg: "w-11 h-11 text-base rounded-xl",
        xl: "w-14 h-14 text-lg rounded-2xl",
    };

    const MarkContent = () => (
        <div className={cn(
            "relative flex items-center justify-center font-black",
            "bg-gradient-to-br from-[hsl(var(--blue-6))] via-[hsl(var(--purple-5))] to-[hsl(var(--amber-5))]",
            "text-white",
            "shadow-lg shadow-[hsl(var(--blue-6)/0.3)]",
            "transition-all duration-300",
            "group-hover:shadow-xl group-hover:shadow-[hsl(var(--blue-6)/0.4)] group-hover:scale-105",
            "overflow-hidden",
            sizeConfig[size],
            className
        )}>
            {/* Shine effect */}
            <div className={cn(
                "absolute inset-0",
                "bg-gradient-to-tr from-white/0 via-white/20 to-white/0",
                "translate-x-[-100%] group-hover:translate-x-[100%]",
                "transition-transform duration-700"
            )} />
            <span className="relative z-10">M</span>
        </div>
    );

    if (href) {
        return (
            <Link 
                href={href} 
                className={cn(
                    "group inline-flex",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--blue-6))] focus-visible:ring-offset-2 rounded-xl"
                )}
            >
                <MarkContent />
            </Link>
        );
    }

    return <MarkContent />;
}

/**
 * Full Logo with Mark + Text
 * For headers and prominent placements
 */
export function MudaLogoFull({ 
    href = "/dashboard",
    size = "md",
    showSubtitle = false,
    subtitle,
    className,
    variant = "default"
}: MudaLogoProps) {
    const sizeConfig = {
        sm: {
            markSize: "w-8 h-8 text-xs rounded-lg",
            textSize: "text-lg",
            gap: "gap-2",
            subtitleSize: "text-[8px]",
        },
        md: {
            markSize: "w-9 h-9 text-sm rounded-xl",
            textSize: "text-xl",
            gap: "gap-2.5",
            subtitleSize: "text-[10px]",
        },
        lg: {
            markSize: "w-11 h-11 text-base rounded-xl",
            textSize: "text-2xl",
            gap: "gap-3",
            subtitleSize: "text-xs",
        },
        xl: {
            markSize: "w-14 h-14 text-lg rounded-2xl",
            textSize: "text-3xl",
            gap: "gap-4",
            subtitleSize: "text-sm",
        },
    };

    const config = sizeConfig[size];
    const isWhite = variant === "white";

    const Content = () => (
        <div className={cn("flex items-center", config.gap, className)}>
            {/* Logo Mark */}
            <div className={cn(
                "relative flex items-center justify-center font-black",
                "bg-gradient-to-br from-[hsl(var(--blue-6))] via-[hsl(var(--purple-5))] to-[hsl(var(--amber-5))]",
                "text-white",
                "shadow-lg shadow-[hsl(var(--blue-6)/0.3)]",
                "transition-all duration-300",
                "group-hover:shadow-xl group-hover:shadow-[hsl(var(--blue-6)/0.4)] group-hover:scale-105",
                "overflow-hidden",
                config.markSize
            )}>
                {/* Shine effect */}
                <div className={cn(
                    "absolute inset-0",
                    "bg-gradient-to-tr from-white/0 via-white/25 to-white/0",
                    "translate-x-[-100%] group-hover:translate-x-[100%]",
                    "transition-transform duration-700"
                )} />
                <span className="relative z-10">M</span>
            </div>

            {/* Text */}
            <div className="flex flex-col leading-none">
                <div className={cn(
                    "flex items-center font-black tracking-tight",
                    config.textSize
                )}>
                    <span className={cn(
                        "transition-colors duration-300",
                        isWhite ? "text-white" : "bg-gradient-to-br from-[hsl(var(--blue-6))] to-[hsl(var(--blue-7))] bg-clip-text text-transparent"
                    )}>M</span>
                    <span className={cn(
                        "transition-colors duration-300",
                        isWhite ? "text-white/90" : "bg-gradient-to-br from-[hsl(185_70%_45%)] to-[hsl(190_75%_40%)] bg-clip-text text-transparent"
                    )}>U</span>
                    <span className={cn(
                        "transition-colors duration-300",
                        isWhite ? "text-white/90" : "bg-gradient-to-br from-[hsl(var(--purple-6))] to-[hsl(var(--purple-7))] bg-clip-text text-transparent"
                    )}>D</span>
                    <span className={cn(
                        "transition-colors duration-300",
                        isWhite ? "text-white" : "bg-gradient-to-br from-[hsl(var(--amber-5))] to-[hsl(var(--amber-6))] bg-clip-text text-transparent"
                    )}>A</span>
                </div>
                
                {showSubtitle && subtitle && (
                    <span className={cn(
                        "font-medium mt-0.5",
                        isWhite ? "text-white/70" : "text-[hsl(var(--neutral-6))]",
                        config.subtitleSize
                    )}>
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link 
                href={href} 
                className={cn(
                    "group inline-flex",
                    "transition-transform duration-300",
                    "hover:scale-[1.01]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--blue-6))] focus-visible:ring-offset-2 rounded"
                )}
            >
                <Content />
            </Link>
        );
    }

    return <Content />;
}

/**
 * Hero Logo - Extra large for landing pages
 */
export function MudaLogoHero({ 
    className,
    subtitle 
}: { 
    className?: string;
    subtitle?: string;
}) {
    return (
        <div className={cn("flex flex-col items-center", className)}>
            {/* Large animated logo */}
            <div className="flex items-center gap-1 font-black text-5xl sm:text-6xl md:text-7xl tracking-tight">
                <span className={cn(
                    "bg-gradient-to-br from-[hsl(var(--blue-5))] to-[hsl(var(--blue-7))] bg-clip-text text-transparent",
                    "animate-in fade-in slide-in-from-bottom-4 duration-500"
                )}>
                    M
                </span>
                <span className={cn(
                    "bg-gradient-to-br from-[hsl(185_70%_50%)] to-[hsl(190_75%_40%)] bg-clip-text text-transparent",
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
                )}>
                    U
                </span>
                <span className={cn(
                    "bg-gradient-to-br from-[hsl(var(--purple-5))] to-[hsl(var(--purple-7))] bg-clip-text text-transparent",
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200"
                )}>
                    D
                </span>
                <span className={cn(
                    "bg-gradient-to-br from-[hsl(var(--amber-4))] to-[hsl(var(--amber-6))] bg-clip-text text-transparent",
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
                )}>
                    A
                </span>
            </div>
            
            {subtitle && (
                <p className={cn(
                    "mt-3 text-sm sm:text-base font-medium text-[hsl(var(--neutral-7))]",
                    "animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500"
                )}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
