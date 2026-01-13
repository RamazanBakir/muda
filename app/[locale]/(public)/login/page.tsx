"use client";

import { Container } from "@/shared/ui/container";
import { LoginForm } from "@/features/auth";
import { Link } from "@/navigation";
import React from "react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
    const t = useTranslations("login");

    return (
        <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center py-20">
            <Container size="narrow" className="w-full flex flex-col items-center">
                <div className="text-center mb-10 space-y-4">
                    <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-primary-fg font-black text-3xl shadow-xl shadow-primary/30 mb-6">
                        M
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                        {t('title')}
                    </h2>
                    <p className="text-base md:text-lg text-muted-fg font-medium leading-relaxed max-w-sm mx-auto">
                        {t('desc')} <br />
                        <span className="opacity-80">{t('citizenLink')}</span>
                        <Link href="/" className="font-bold text-primary hover:text-primary-700 ml-1 underline underline-offset-4 decoration-2 decoration-primary/30 hover:decoration-primary transition-all">
                            {t('backToHome')}
                        </Link>.
                    </p>
                </div>

                <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-border/50">
                    <React.Suspense fallback={<div className="flex justify-center p-8 text-muted-fg animate-pulse">{t('loading')}</div>}>
                        <LoginForm />
                    </React.Suspense>
                </div>
            </Container>
        </div>
    );
}


