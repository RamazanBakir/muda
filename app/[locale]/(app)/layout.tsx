"use client";

import { Link } from "@/navigation";
import { Container } from "@/shared/ui/container";
import { RoleSwitcher, useSession } from "@/features/auth";
import { ActivityButton } from "@/features/activity/ui/ActivityButton";
import { useRouter, usePathname } from "@/navigation";
import { DemoProvider, DemoIndicator } from "@/features/demo";
import { useEffect } from "react";
import { cn } from "@/shared/lib/cn";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/shared/ui/button";
import dynamic from 'next/dynamic';
import {
    LayoutDashboard,
    Map as MapIcon,
    ClipboardList,
    BarChart3,
    Inbox,
    Home,
    Sparkles,
    ListFilter,
    Cpu
} from "lucide-react";

const DevToolsWrapper = dynamic(
    () => import('@/shared/ui/dev-tools/wrapper').then(mod => mod.DevToolsWrapper),
    { ssr: false }
);

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { session, loading } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations();
    const locale = useLocale();

    useEffect(() => {
        if (!loading && !session) {
            router.push("/");
        }
    }, [session, loading, router]);

    if (loading || !session) return null;

    const navItems = [
        { label: t('nav.dashboard'), href: "/dashboard", icon: LayoutDashboard },
        { label: t('nav.map'), href: "/map", icon: MapIcon },
        { label: t('nav.issues'), href: "/issues", icon: ClipboardList },
    ];

    if (session.role === 'unit') {
        navItems.push({ label: t('nav.unit_analytics'), href: "/unit/analytics", icon: BarChart3 });
        navItems.push({ label: t('nav.unit_queue'), href: "/unit/issues", icon: Inbox });
    }

    // AI pages for call_center and unit roles
    if (session.role === 'call_center' || session.role === 'unit') {
        navItems.push({ label: t('nav.ai_triage') || "AI Triaj", href: "/call-center/triage", icon: Sparkles });
        navItems.push({ label: t('nav.ai_system') || "AI Sistem", href: "/ai", icon: Cpu });
    }

    return (
        <DemoProvider>
            <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col text-[hsl(var(--fg))] pb-16 md:pb-0">
                <DemoIndicator />
                
                {/* Header - Clean, professional */}
                <header className={cn(
                    "sticky top-0 z-50 w-full",
                    "border-b border-[hsl(var(--neutral-3))]",
                    "bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm"
                )}>
                    <Container className="flex h-14 items-center justify-between">
                        <div className="flex items-center gap-6 lg:gap-8">
                            {/* Logo */}
                            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                                <div className="bg-[hsl(var(--blue-6))] text-white p-1.5 rounded-lg">
                                    <Home size={16} strokeWidth={2} />
                                </div>
                                <span className="font-semibold text-base text-[hsl(var(--neutral-11))] hidden sm:block">
                                    MUDA
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)]",
                                                "text-sm font-medium transition-colors duration-150",
                                                isActive 
                                                    ? "text-[hsl(var(--blue-7))] bg-[hsl(var(--blue-1))]" 
                                                    : "text-[hsl(var(--neutral-7))] hover:text-[hsl(var(--neutral-9))] hover:bg-[hsl(var(--neutral-2))]"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <div className="h-4 w-px bg-[hsl(var(--neutral-3))] mx-1 hidden md:block" />
                            <ActivityButton />
                            <RoleSwitcher />
                        </div>
                    </Container>
                </header>

                {/* Mobile Bottom Navigation */}
                <div className={cn(
                    "md:hidden fixed bottom-0 left-0 right-0 h-14 z-50",
                    "bg-[hsl(var(--surface))] border-t border-[hsl(var(--neutral-3))]",
                    "px-4 safe-area-inset-bottom"
                )}>
                    <div className="flex items-center justify-around h-full">
                        {navItems.slice(0, 4).map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-0.5",
                                        "transition-colors duration-150 p-2",
                                        isActive 
                                            ? "text-[hsl(var(--blue-6))]" 
                                            : "text-[hsl(var(--neutral-6))]"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                        <RoleSwitcher mobile />
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 w-full py-4 md:py-6">
                    {children}
                </main>
                <DevToolsWrapper />
            </div>
        </DemoProvider>
    );
}

function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLanguage = () => {
        const nextLocale = locale === 'tr' ? 'en' : 'tr';
        router.push(pathname, { locale: nextLocale });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-xs font-medium w-8 h-8"
        >
            {locale.toUpperCase()}
        </Button>
    );
}
