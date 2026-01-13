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
    Globe
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

    return (
        <DemoProvider>
            <div className="min-h-screen bg-bg flex flex-col font-sans text-fg pb-20 md:pb-0">
                <DemoIndicator />
                <header className="sticky top-0 z-50 w-full border-b-2 border-border/30 bg-surface/90 backdrop-blur-xl shadow-sm">
                    <Container className="flex h-20 items-center justify-between">
                        <div className="flex items-center gap-10">
                            <Link href="/dashboard" className="flex items-center gap-3 group">
                                <div className="bg-primary text-primary-fg p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                </div>
                                <span className="font-black text-xl tracking-tight text-neutral-900 dark:text-neutral-50 uppercase italic">
                                    MUDA<span className="text-primary not-italic">.</span>
                                </span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-8">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "group flex items-center gap-2 text-sm font-bold transition-all hover:text-primary relative py-2",
                                                isActive ? "text-primary" : "text-muted-fg"
                                            )}
                                        >
                                            <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "opacity-60")} />
                                            {item.label}
                                            {isActive && (
                                                <span className="absolute -bottom-[26px] left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary-600),0.4)]" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 mr-2">
                                <LanguageSwitcher />
                            </div>
                            <div className="h-6 w-px bg-border/60 mx-1" />
                            <ActivityButton />
                            <RoleSwitcher />
                        </div>
                    </Container>
                </header>

                <div className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-neutral-900/90 backdrop-blur-2xl z-50 rounded-2xl shadow-2xl border border-white/10 px-6">
                    <div className="flex items-center justify-between h-full">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1 transition-all rounded-xl relative p-2",
                                        isActive ? "text-primary scale-110" : "text-white/60 hover:text-white"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                    {isActive && (
                                        <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
                                    )}
                                </Link>
                            )
                        })}
                        <RoleSwitcher mobile />
                    </div>
                </div>

                <main className="flex-1 w-full pt-6">
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
            className="text-[10px] font-black w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary border border-border/40"
        >
            {locale.toUpperCase()}
        </Button>
    );
}


