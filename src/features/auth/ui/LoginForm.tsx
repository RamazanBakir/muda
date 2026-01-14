"use client";

import { useState } from "react";
import { UserSession } from "../model/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/ui/form-field";
import { AUTH_CONFIG } from "../config";
import { useSearchParams } from "next/navigation";
import { sessionStorage } from "../lib/sessionStorage";
import { useTranslations, useLocale } from "next-intl";
import { Lock, LogIn } from "lucide-react";

export function LoginForm() {
    const t = useTranslations("loginForm");
    const locale = useLocale();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo");

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        await new Promise(r => setTimeout(r, 800));

        let session: UserSession | null = null;

        // Try to find user in Muhtar users
        const muhtarUser = AUTH_CONFIG.MUHTAR_USERS.find(
            u => u.username === identifier && u.password === password
        );
        if (muhtarUser) {
            session = {
                role: 'muhtar',
                userId: 'user-' + muhtarUser.username,
                name: muhtarUser.name,
                neighborhoodId: muhtarUser.neighborhood,
                district: muhtarUser.district
            };
        }

        // Try to find user in Unit users
        if (!session) {
            const unitUser = AUTH_CONFIG.UNIT_USERS.find(
                u => u.code === identifier && u.password === password
            );
            if (unitUser) {
                session = {
                    role: 'unit',
                    userId: 'user-' + unitUser.code,
                    name: unitUser.name,
                    unitId: unitUser.unitId
                };
            }
        }

        // Try to find user in Call Center users
        if (!session) {
            const callCenterUser = AUTH_CONFIG.CALL_CENTER_USERS.find(
                u => u.id === identifier && u.password === password
            );
            if (callCenterUser) {
                session = {
                    role: 'call_center',
                    userId: 'user-' + callCenterUser.id,
                    name: callCenterUser.name
                };
            }
        }

        if (session) {
            sessionStorage.set(session);
            const target = returnTo || `/${locale}/dashboard`;
            window.location.href = target;
        } else {
            setError(t('errorAuth'));
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1.5">
                <h3 className="text-2xl font-bold tracking-tight text-fg leading-tight">
                    {t('loginTitle')}
                </h3>
                <p className="text-sm text-muted-fg leading-relaxed">
                    {t('unifiedLoginDesc') || 'Kullanıcı bilgilerinizi girerek sisteme giriş yapın.'}
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <FormField 
                    label={t('identifierLabel') || 'Kullanıcı Adı / Birim Kodu'} 
                    required
                    hint={t('identifierHint') || 'Muhtar, birim kodu veya operatör ID giriniz'}
                >
                    <Input
                        placeholder="muhtar_mentese, UNIT-001, OP-01"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        className="h-12 rounded-xl text-base font-medium"
                        autoComplete="username"
                        required
                    />
                </FormField>

                <FormField label={t('passwordLabel')} required hint={t('demoHint', { password: '123' })}>
                    <Input
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="h-12 rounded-xl text-base font-medium"
                        autoComplete="current-password"
                        required
                    />
                </FormField>

                {error && (
                    <div className="flex items-center gap-3 text-sm font-semibold text-danger bg-danger/5 p-4 rounded-xl border border-danger/10">
                        <Lock size={16} strokeWidth={2.5} />
                        {error}
                    </div>
                )}

                <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 transition-all gap-2" 
                    isLoading={loading}
                >
                    <LogIn size={18} />
                    {t('submit')}
                </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="p-4 rounded-xl bg-[hsl(var(--neutral-2))] border border-[hsl(var(--neutral-4))]">
                <p className="text-xs font-semibold text-[hsl(var(--neutral-8))] mb-2">
                    {t('demoCredentialsTitle') || 'Demo Giriş Bilgileri'}
                </p>
                <div className="space-y-1.5 text-xs text-[hsl(var(--neutral-7))]">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Muhtar:</span>
                        <code className="bg-[hsl(var(--neutral-3))] px-2 py-0.5 rounded font-mono">muhtar_mentese / 123</code>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Birim:</span>
                        <code className="bg-[hsl(var(--neutral-3))] px-2 py-0.5 rounded font-mono">UNIT-001 / 123</code>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Çağrı Merkezi:</span>
                        <code className="bg-[hsl(var(--neutral-3))] px-2 py-0.5 rounded font-mono">OP-01 / 123</code>
                    </div>
                </div>
            </div>
        </div>
    );
}
