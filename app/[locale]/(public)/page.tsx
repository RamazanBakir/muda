import { Link } from "@/navigation";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { useTranslations } from "next-intl";
import { Search, MapPin, CheckCircle2, ArrowRight, Zap, Shield, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export default function LandingPage() {
    const t = useTranslations("landing");

    return (
        <div className="flex flex-col gap-24 lg:gap-40 pb-32">
            {/* Hero Section */}
            <section className="relative pt-24 lg:pt-40 pb-20 overflow-hidden">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
                </div>

                <Container className="flex flex-col items-center text-center">
                    <div className="space-y-10 max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-1000">
                            <Sparkles size={14} className="animate-pulse" />
                            {t('heroTag')}
                        </div>

                        <h1 className="text-6xl sm:text-7xl lg:text-[10rem] font-black tracking-tighter text-neutral-900 dark:text-neutral-50 leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            {t('heroTitle1')} <br className="hidden sm:block" />
                            <span className="text-primary relative inline-block">
                                {t('heroTitle2')}
                                <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary/10 -skew-x-12 -z-10" />
                            </span>
                        </h1>

                        <p className="text-xl sm:text-2xl text-muted-fg leading-relaxed max-w-3xl mx-auto font-medium opacity-80 animate-in fade-in duration-1000 delay-500">
                            {t('heroDesc')}
                        </p>
                    </div>

                    <div className="mt-16 flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                        <Link href="/issue/new" className="w-full sm:w-auto">
                            <Button size="lg" className="h-16 px-10 rounded-2xl w-full sm:min-w-[260px] text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                                {t('reportBtn')}
                                <ArrowRight className="ml-2 w-5 h-5" strokeWidth={3} />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" disabled className="h-16 px-10 rounded-2xl w-full sm:min-w-[260px] text-base font-black uppercase tracking-widest border-2">
                            {t('myIssuesBtn')}
                        </Button>
                        <Link href="/dashboard" className="sm:hidden w-full">
                            <Button size="lg" variant="secondary" className="h-16 rounded-2xl w-full text-base font-black uppercase tracking-widest">
                                Giriş Yap
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-32 pt-16 border-t-2 border-border/20 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-12 animate-in fade-in duration-1000 delay-1000">
                        {[
                            { value: "10k+", label: t('stats.issues'), icon: Zap },
                            { value: "98%", label: t('stats.resolution'), icon: CheckCircle2 },
                            { value: "24s", label: t('stats.responseTime'), icon: Shield },
                            { value: "13", label: t('stats.districts'), icon: MapPin }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 group">
                                <div className="h-12 w-12 rounded-2xl bg-surface-2 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors duration-500">
                                    <stat.icon size={24} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-4xl font-black text-neutral-900 dark:text-neutral-50 tracking-tighter transition-transform group-hover:scale-110 duration-500">
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg opacity-60">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* How it works */}
            <section className="py-32 bg-surface-2/30 border-y-2 border-border/20 relative">
                <Container>
                    <div className="flex flex-col items-center justify-center space-y-6 text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-neutral-900 dark:text-neutral-50">
                            {t('howItWorks.title')}
                        </h2>
                        <p className="text-xl md:text-2xl text-muted-fg max-w-3xl leading-relaxed font-medium opacity-80">
                            {t('howItWorks.desc')}
                        </p>
                    </div>

                    <div className="grid gap-12 md:grid-cols-3">
                        {[
                            { step: 1, title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.desc'), icon: Search, color: "bg-blue-500" },
                            { step: 2, title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.desc'), icon: MapPin, color: "bg-primary" },
                            { step: 3, title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.desc'), icon: CheckCircle2, color: "bg-success" }
                        ].map((item) => (
                            <Card key={item.step} className="group border-none shadow-xl hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-4 transition-all duration-700 bg-surface rounded-[48px] overflow-hidden p-4">
                                <CardHeader className="p-8 space-y-8">
                                    <div className={cn(
                                        "h-20 w-20 rounded-[32px] flex items-center justify-center text-white shadow-2xl transition-all duration-700 group-hover:rotate-12",
                                        item.color
                                    )}>
                                        <item.icon size={36} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                                            Adım {item.step}
                                        </div>
                                        <CardTitle className="text-3xl font-black leading-tight">{item.title}</CardTitle>
                                        <CardDescription className="text-lg leading-relaxed font-medium">
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



