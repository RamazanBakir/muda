"use client";

import { Link } from "@/navigation";
import { Container } from "@/shared/ui/container";
import { Button } from "@/shared/ui/button";
import { RoleSwitcher } from "@/features/auth";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations("publicLayout");

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-surface/90 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
                <Container className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
                        {/* Logo Mark */}
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            M
                        </div>

                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                MUDA
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest hidden sm:inline-block">
                                {t('subTitle')}
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-3 md:gap-4">
                        <LanguageSwitcher />
                        <div className="hidden sm:block">
                            <RoleSwitcher />
                        </div>
                        <Link href="/issue/new">
                            <Button size="sm" className="shadow-primary/25 shadow-md">{t('reportButton')}</Button>
                        </Link>
                        {/* Mobile-only role switcher if needed, but for now we hide on very small since we have limited space or it stacks */}
                        <div className="sm:hidden">
                            <RoleSwitcher />
                        </div>
                    </nav>
                </Container>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/20 py-12">
                <Container className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-neutral-200 rounded flex items-center justify-center text-xs font-bold text-neutral-600">
                            M
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">{t('copyright')}</span>
                    </div>

                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors">{t('privacy')}</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">{t('terms')}</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">{t('contact')}</Link>
                    </div>
                </Container>
            </footer>
        </div>
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
            className="text-xs font-bold w-10 h-10 rounded-full"
        >
            {locale.toUpperCase()}
        </Button>
    );
}
