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
        <div className="flex flex-col min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
            {/* Header - Clean, professional */}
            <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--neutral-3))] bg-[hsl(var(--surface)/0.95)] backdrop-blur-sm">
                <Container className="flex h-14 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        {/* Logo Mark - Blue */}
                        <div className="h-8 w-8 bg-[hsl(var(--blue-6))] rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            M
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-base font-semibold text-[hsl(var(--neutral-11))]">
                                MUDA
                            </span>
                            <span className="text-[10px] font-medium text-[hsl(var(--neutral-6))] hidden sm:inline-block">
                                {t('subTitle')}
                            </span>
                        </div>
                    </Link>

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
                        <div className="h-5 w-5 bg-[hsl(var(--neutral-4))] rounded flex items-center justify-center text-[10px] font-semibold text-[hsl(var(--neutral-7))]">
                            M
                        </div>
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
