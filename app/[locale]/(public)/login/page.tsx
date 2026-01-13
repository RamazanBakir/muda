"use client";

import { Container } from "@/shared/ui/container";
import { LoginForm } from "@/features/auth";
import { Link } from "@/navigation";
import React from "react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
    const t = useTranslations("login");

    return (
        <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center py-16">
            <Container size="narrow" className="w-full flex flex-col items-center">
                <div className="text-center mb-8 space-y-3">
                    <div className="mx-auto h-14 w-14 bg-primary rounded-xl flex items-center justify-center text-primary-fg font-bold text-2xl shadow-lg shadow-primary/20 mb-4">
                        M
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg">
                        {t('title')}
                    </h2>
                    <p className="text-sm md:text-base text-muted-fg leading-relaxed max-w-sm mx-auto">
                        {t('desc')} <br />
                        <span className="opacity-80">{t('citizenLink')}</span>
                        <Link href="/" className="font-semibold text-primary hover:text-primary/80 ml-1 underline underline-offset-4 decoration-1 decoration-primary/30 hover:decoration-primary/60 transition-all">
                            {t('backToHome')}
                        </Link>.
                    </p>
                </div>

                <div className="w-full max-w-md bg-surface p-6 md:p-8 rounded-xl shadow-lg border border-border">
                    <React.Suspense fallback={<div className="flex justify-center p-6 text-muted-fg animate-pulse">{t('loading')}</div>}>
                        <LoginForm />
                    </React.Suspense>
                </div>
            </Container>
        </div>
    );
}


