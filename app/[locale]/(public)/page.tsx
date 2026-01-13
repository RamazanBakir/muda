import { Link } from "@/navigation";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { useTranslations } from "next-intl";
import { Search, MapPin, CheckCircle2, ArrowRight, Zap, Shield } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export default function LandingPage() {
    const t = useTranslations("landing");

    return (
        <div className="flex flex-col">
            {/* Hero Section - Clean, calm, professional */}
            <section className="relative py-16 md:py-24 lg:py-32">
                {/* Subtle blue gradient background */}
                <div 
                    className="absolute inset-0 -z-10 opacity-40"
                    style={{
                        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--blue-2)) 0%, transparent 70%)'
                    }}
                />

                <Container className="flex flex-col items-center text-center">
                    <div className="space-y-6 max-w-2xl mx-auto">
                        {/* Tag - Small, subtle */}
                        <div className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                            "bg-[hsl(var(--blue-1))]",
                            "border border-[hsl(var(--blue-3))]",
                            "text-xs font-medium text-[hsl(var(--blue-8))]"
                        )}>
                            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--blue-6))]" />
                            {t('heroTag')}
                        </div>

                        {/* Hero Title - Calm, professional sizing */}
                        <h1 className={cn(
                            "text-2xl sm:text-3xl md:text-4xl font-semibold",
                            "text-[hsl(var(--neutral-11))]",
                            "leading-tight tracking-tight"
                        )}>
                            {t('heroTitle1')}{' '}
                            <span className="text-[hsl(var(--blue-6))]">
                                {t('heroTitle2')}
                            </span>
                        </h1>

                        {/* Subtitle - Supportive, readable */}
                        <p className={cn(
                            "text-base sm:text-lg leading-relaxed max-w-xl mx-auto",
                            "text-[hsl(var(--neutral-7))]"
                        )}>
                            {t('heroDesc')}
                        </p>

                        {/* CTA Buttons - Clear hierarchy */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full sm:w-auto justify-center">
                            <Link href="/issue/new" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto px-6">
                                    {t('reportBtn')}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" disabled className="w-full sm:w-auto px-6">
                                {t('myIssuesBtn')}
                            </Button>
                        </div>

                        {/* Mobile login link */}
                        <Link href="/dashboard" className="sm:hidden">
                            <Button variant="ghost" className="text-[hsl(var(--blue-6))]">
                                Giriş Yap
                            </Button>
                        </Link>
                    </div>

                    {/* Stats - Compact, clean */}
                    <div className="mt-16 pt-8 border-t border-[hsl(var(--neutral-3))] w-full max-w-xl grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: "10k+", label: t('stats.issues'), icon: Zap },
                            { value: "98%", label: t('stats.resolution'), icon: CheckCircle2 },
                            { value: "24s", label: t('stats.responseTime'), icon: Shield },
                            { value: "13", label: t('stats.districts'), icon: MapPin }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "h-9 w-9 rounded-lg flex items-center justify-center",
                                    "bg-[hsl(var(--blue-1))]",
                                    "text-[hsl(var(--blue-6))]"
                                )}>
                                    <stat.icon size={18} strokeWidth={2} />
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-semibold text-[hsl(var(--neutral-11))]">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-[hsl(var(--neutral-7))]">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* How it works - Clean cards */}
            <section className="py-16 md:py-20 bg-[hsl(var(--neutral-2))]">
                <Container>
                    <div className="flex flex-col items-center text-center space-y-3 mb-12">
                        <h2 className="text-xl md:text-2xl font-semibold text-[hsl(var(--neutral-11))]">
                            {t('howItWorks.title')}
                        </h2>
                        <p className="text-base text-[hsl(var(--neutral-7))] max-w-lg">
                            {t('howItWorks.desc')}
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                        {[
                            { step: 1, title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.desc'), icon: Search },
                            { step: 2, title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.desc'), icon: MapPin },
                            { step: 3, title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.desc'), icon: CheckCircle2 }
                        ].map((item) => (
                            <Card 
                                key={item.step} 
                                className="group"
                            >
                                <CardHeader className="p-5 space-y-4">
                                    {/* Step number + Icon */}
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center",
                                            "bg-[hsl(var(--blue-6))] text-white"
                                        )}>
                                            <item.icon size={20} strokeWidth={2} />
                                        </div>
                                        <span className="text-xs font-medium text-[hsl(var(--blue-6))] uppercase tracking-wide">
                                            Adım {item.step}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
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
        </div>
    );
}
