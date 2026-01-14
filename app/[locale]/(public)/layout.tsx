"use client";

import { Link } from "@/navigation";
import { Container } from "@/shared/ui/container";
import { Button } from "@/shared/ui/button";
import { RoleSwitcher } from "@/features/auth";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";
import { MudaLogo, MudaLogoMark, MudaLogoFull } from "@/shared/ui/logo";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations("publicLayout");

    return (
        <div className="flex flex-col min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
            {/* Header - Clean, professional */}
            <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--neutral-3))] bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm">
                <Container className="flex h-14 items-center justify-between">
                    {/* Logo - Responsive */}
                    <div className="flex items-center">
                        {/* Mobile: Compact logo */}
                        <div className="sm:hidden">
                            <MudaLogoMark href="/" size="md" />
                        </div>
                        {/* Desktop: Full logo with subtitle */}
                        <div className="hidden sm:block">
                            <MudaLogoFull 
                                href="/" 
                                size="md" 
                                showSubtitle 
                                subtitle={t('subTitle')} 
                            />
                        </div>
                    </div>

                    <nav className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <div className="hidden sm:block">
                            <RoleSwitcher />
                        </div>
                        <Link href="/issue/new">
                            <Button size="sm">{t('reportButton')}</Button>
                        </Link>
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

            {/* Footer - Simple */}
            <footer className="border-t border-[hsl(var(--neutral-3))] bg-[hsl(var(--neutral-2))] py-8">
                <Container className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <MudaLogoMark size="sm" />
                        <span className="text-sm text-[hsl(var(--neutral-7))]">{t('copyright')}</span>
                    </div>

                    <div className="flex gap-4 text-sm text-[hsl(var(--neutral-7))]">
                        <Link href="#" className="hover:text-[hsl(var(--blue-6))] transition-colors">{t('privacy')}</Link>
                        <Link href="#" className="hover:text-[hsl(var(--blue-6))] transition-colors">{t('terms')}</Link>
                        <Link href="#" className="hover:text-[hsl(var(--blue-6))] transition-colors">{t('contact')}</Link>
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
            className="text-xs font-medium w-8 h-8"
        >
            {locale.toUpperCase()}
        </Button>
    );
}
