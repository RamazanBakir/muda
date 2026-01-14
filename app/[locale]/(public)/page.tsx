"use client";

import { Link } from "@/navigation";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { useTranslations } from "next-intl";
import { Search, MapPin, CheckCircle2, ArrowRight, Zap, Shield, Cpu, Users } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { MudaLogoHero } from "@/shared/ui/logo";

export default function LandingPage() {
    const t = useTranslations("landing");

    return (
        <div className="flex flex-col">
            {/* Hero Section - Modern with animated background */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 -z-10">
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--neutral-2))]" />
                    
                    {/* Animated gradient orbs */}
                    <div 
                        className={cn(
                            "absolute top-[-20%] left-[-10%] w-[50%] h-[50%]",
                            "bg-gradient-to-br from-[hsl(var(--blue-3)/0.6)] to-transparent",
                            "rounded-full blur-3xl",
                            "animate-pulse"
                        )}
                        style={{ animationDuration: '8s' }}
                    />
                    <div 
                        className={cn(
                            "absolute top-[10%] right-[-15%] w-[45%] h-[45%]",
                            "bg-gradient-to-bl from-[hsl(var(--purple-3)/0.4)] to-transparent",
                            "rounded-full blur-3xl",
                            "animate-pulse"
                        )}
                        style={{ animationDuration: '10s', animationDelay: '2s' }}
                    />
                    <div 
                        className={cn(
                            "absolute bottom-[-10%] left-[20%] w-[40%] h-[40%]",
                            "bg-gradient-to-tr from-[hsl(var(--amber-3)/0.3)] to-transparent",
                            "rounded-full blur-3xl",
                            "animate-pulse"
                        )}
                        style={{ animationDuration: '12s', animationDelay: '4s' }}
                    />
                    
                    {/* Grid pattern overlay */}
                    <div 
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `
                                linear-gradient(hsl(var(--neutral-11)) 1px, transparent 1px),
                                linear-gradient(90deg, hsl(var(--neutral-11)) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px'
                        }}
                    />
                    
                    {/* Floating shapes */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "absolute rounded-full border border-[hsl(var(--blue-4)/0.3)]",
                                    "animate-float"
                                )}
                                style={{
                                    width: `${20 + i * 15}px`,
                                    height: `${20 + i * 15}px`,
                                    left: `${10 + i * 15}%`,
                                    top: `${20 + (i % 3) * 25}%`,
                                    animationDuration: `${6 + i * 2}s`,
                                    animationDelay: `${i * 0.5}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                <Container className="relative z-10 flex flex-col items-center text-center py-16">
                    <div className="space-y-8 max-w-3xl mx-auto">
                        {/* Tag - Animated */}
                        <div className={cn(
                            "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                            "bg-[hsl(var(--surface)/0.8)] backdrop-blur-sm",
                            "border border-[hsl(var(--blue-3))]",
                            "text-xs font-medium text-[hsl(var(--blue-8))]",
                            "animate-in fade-in slide-in-from-bottom-2 duration-500"
                        )}>
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--blue-5))] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--blue-6))]" />
                            </div>
                            {t('heroTag')}
                        </div>

                        {/* Hero Logo */}
                        <MudaLogoHero subtitle="Muğla Ulaşım Dijital Asistanı" />

                        {/* Hero Title */}
                        <h1 className={cn(
                            "text-2xl sm:text-3xl md:text-4xl font-semibold",
                            "text-[hsl(var(--neutral-11))]",
                            "leading-tight tracking-tight",
                            "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                        )}>
                            {t('heroTitle1')}{' '}
                            <span className="relative">
                                <span className="relative z-10 text-[hsl(var(--blue-6))]">
                                    {t('heroTitle2')}
                                </span>
                                <span className={cn(
                                    "absolute bottom-1 left-0 right-0 h-3",
                                    "bg-[hsl(var(--blue-2))] -z-0",
                                    "rounded"
                                )} />
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className={cn(
                            "text-base sm:text-lg leading-relaxed max-w-xl mx-auto",
                            "text-[hsl(var(--neutral-7))]",
                            "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
                        )}>
                            {t('heroDesc')}
                        </p>

                        {/* CTA Buttons */}
                        <div className={cn(
                            "flex flex-col sm:flex-row gap-3 pt-4 w-full sm:w-auto justify-center",
                            "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700"
                        )}>
                            <Link href="/issue/new" className="w-full sm:w-auto">
                                <Button size="lg" className={cn(
                                    "w-full sm:w-auto px-8 h-12",
                                    "bg-gradient-to-r from-[hsl(var(--blue-6))] to-[hsl(var(--blue-7))]",
                                    "hover:from-[hsl(var(--blue-7))] hover:to-[hsl(var(--blue-8))]",
                                    "shadow-lg shadow-[hsl(var(--blue-6)/0.3)]",
                                    "hover:shadow-xl hover:shadow-[hsl(var(--blue-6)/0.4)]",
                                    "transition-all duration-300"
                                )}>
                                    {t('reportBtn')}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12">
                                    Giriş Yap
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats - Floating cards */}
                    <div className={cn(
                        "mt-20 w-full max-w-4xl",
                        "grid grid-cols-2 md:grid-cols-4 gap-4",
                        "animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-1000"
                    )}>
                        {[
                            { value: "10k+", label: t('stats.issues'), icon: Zap, color: "blue" },
                            { value: "98%", label: t('stats.resolution'), icon: CheckCircle2, color: "green" },
                            { value: "24s", label: t('stats.responseTime'), icon: Cpu, color: "purple" },
                            { value: "13", label: t('stats.districts'), icon: MapPin, color: "amber" }
                        ].map((stat, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "group relative p-4 rounded-2xl",
                                    "bg-[hsl(var(--surface)/0.8)] backdrop-blur-sm",
                                    "border border-[hsl(var(--neutral-3))]",
                                    "hover:border-[hsl(var(--blue-4))]",
                                    "hover:shadow-lg hover:shadow-[hsl(var(--blue-6)/0.1)]",
                                    "transition-all duration-300",
                                    "hover:-translate-y-1"
                                )}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                        "transition-transform duration-300 group-hover:scale-110",
                                        stat.color === "blue" && "bg-[hsl(var(--blue-1))] text-[hsl(var(--blue-6))]",
                                        stat.color === "green" && "bg-[hsl(var(--green-1))] text-[hsl(var(--green-6))]",
                                        stat.color === "purple" && "bg-[hsl(var(--purple-1))] text-[hsl(var(--purple-6))]",
                                        stat.color === "amber" && "bg-[hsl(var(--amber-1))] text-[hsl(var(--amber-6))]"
                                    )}>
                                        <stat.icon size={20} strokeWidth={2} />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[hsl(var(--neutral-11))]">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-[hsl(var(--neutral-7))]">
                                            {stat.label}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
                
                {/* Bottom wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path 
                            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                            fill="hsl(var(--neutral-2))"
                        />
                    </svg>
                </div>
            </section>

            {/* How it works - Clean cards */}
            <section className="py-16 md:py-24 bg-[hsl(var(--neutral-2))]">
                <Container>
                    <div className="flex flex-col items-center text-center space-y-4 mb-16">
                        <span className={cn(
                            "px-3 py-1 rounded-full",
                            "bg-[hsl(var(--blue-1))] text-[hsl(var(--blue-7))]",
                            "text-xs font-semibold uppercase tracking-wider"
                        )}>
                            Nasıl Çalışır?
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-[hsl(var(--neutral-11))]">
                            {t('howItWorks.title')}
                        </h2>
                        <p className="text-base text-[hsl(var(--neutral-7))] max-w-lg">
                            {t('howItWorks.desc')}
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
                        {[
                            { step: 1, title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.desc'), icon: Search, color: "blue" },
                            { step: 2, title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.desc'), icon: Cpu, color: "purple" },
                            { step: 3, title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.desc'), icon: CheckCircle2, color: "green" }
                        ].map((item) => (
                            <Card 
                                key={item.step} 
                                className={cn(
                                    "group relative overflow-hidden",
                                    "border-[hsl(var(--neutral-3))]",
                                    "hover:border-[hsl(var(--blue-4))]",
                                    "hover:shadow-xl",
                                    "transition-all duration-300"
                                )}
                            >
                                {/* Step number background */}
                                <div className={cn(
                                    "absolute -right-4 -top-4 w-24 h-24 rounded-full",
                                    "flex items-center justify-center",
                                    "text-6xl font-black",
                                    "text-[hsl(var(--neutral-3))]",
                                    "group-hover:text-[hsl(var(--blue-2))]",
                                    "transition-colors duration-300"
                                )}>
                                    {item.step}
                                </div>
                                
                                <CardHeader className="relative z-10 p-6 space-y-4">
                                    {/* Icon */}
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center",
                                        "transition-all duration-300 group-hover:scale-110",
                                        item.color === "blue" && "bg-gradient-to-br from-[hsl(var(--blue-5))] to-[hsl(var(--blue-6))] text-white shadow-lg shadow-[hsl(var(--blue-6)/0.3)]",
                                        item.color === "purple" && "bg-gradient-to-br from-[hsl(var(--purple-5))] to-[hsl(var(--purple-6))] text-white shadow-lg shadow-[hsl(var(--purple-6)/0.3)]",
                                        item.color === "green" && "bg-gradient-to-br from-[hsl(var(--green-5))] to-[hsl(var(--green-6))] text-white shadow-lg shadow-[hsl(var(--green-6)/0.3)]"
                                    )}>
                                        <item.icon size={24} strokeWidth={2} />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <span className={cn(
                                            "text-xs font-semibold uppercase tracking-wider",
                                            item.color === "blue" && "text-[hsl(var(--blue-6))]",
                                            item.color === "purple" && "text-[hsl(var(--purple-6))]",
                                            item.color === "green" && "text-[hsl(var(--green-6))]"
                                        )}>
                                            Adım {item.step}
                                        </span>
                                        <CardTitle className="text-xl font-semibold">{item.title}</CardTitle>
                                        <CardDescription className="text-sm leading-relaxed">
                                            {item.desc}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Trust Section */}
            <section className="py-16 md:py-20">
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-3xl bg-gradient-to-br from-[hsl(var(--blue-6))] to-[hsl(var(--purple-6))]">
                        <div className="text-center md:text-left text-white space-y-3">
                            <h3 className="text-2xl md:text-3xl font-bold">
                                Muğla için daha iyi bir yarın
                            </h3>
                            <p className="text-white/80 max-w-md">
                                Yapay zeka destekli sistemimiz ile şehrimizin sorunlarını daha hızlı çözüme kavuşturuyoruz.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[...Array(4)].map((_, i) => (
                                    <div 
                                        key={i}
                                        className={cn(
                                            "w-10 h-10 rounded-full border-2 border-white",
                                            "bg-gradient-to-br",
                                            i === 0 && "from-blue-400 to-blue-600",
                                            i === 1 && "from-purple-400 to-purple-600",
                                            i === 2 && "from-amber-400 to-amber-600",
                                            i === 3 && "from-green-400 to-green-600"
                                        )}
                                    />
                                ))}
                            </div>
                            <div className="text-white">
                                <div className="font-bold text-lg">10,000+</div>
                                <div className="text-sm text-white/70">Çözülen Sorun</div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
}
