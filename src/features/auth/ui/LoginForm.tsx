"use client";

import { useState } from "react";
import { UserRole, LoginCredentials, UserSession } from "../model/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/ui/form-field";
import { AUTH_CONFIG } from "../config";
import { useSearchParams } from "next/navigation";
import { sessionStorage } from "../lib/sessionStorage";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/shared/lib/cn";
import { Lock, Shield, User, Headphones } from "lucide-react";

export function LoginForm() {
    const t = useTranslations("loginForm");
    const tr = useTranslations("roles");
    const locale = useLocale();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo");

    const [role, setRole] = useState<UserRole>("mukhtar");
    const [formData, setFormData] = useState<LoginCredentials>({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        await new Promise(r => setTimeout(r, 800));

        let session: UserSession | null = null;

        if (role === 'mukhtar') {
            const user = AUTH_CONFIG.MUKHTAR_USERS.find(u => u.username === formData.username && u.password === formData.password);
            if (user) {
                session = {
                    role: 'mukhtar',
                    userId: 'user-' + user.username,
                    name: user.name,
                    neighborhoodId: user.neighborhood,
                    district: user.district
                };
            }
        } else if (role === 'unit') {
            const user = AUTH_CONFIG.UNIT_USERS.find(u => u.code === formData.code && u.password === formData.password);
            if (user) {
                session = {
                    role: 'unit',
                    userId: 'user-' + user.code,
                    name: user.name,
                    unitId: user.unitId
                };
            }
        } else if (role === 'call_center') {
            const user = AUTH_CONFIG.CALL_CENTER_USERS.find(u => u.id === formData.operatorId && u.password === formData.password);
            if (user) {
                session = {
                    role: 'call_center',
                    userId: 'user-' + user.id,
                    name: user.name
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

    const handleRoleChange = (r: UserRole) => {
        setRole(r);
        setFormData({});
        setError("");
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-fg ml-1">
                    Giriş Yöntemi Seçin
                </span>
                <div className="flex bg-surface-2 p-1 rounded-xl w-full border border-border">
                    {(['mukhtar', 'unit', 'call_center'] as UserRole[]).map(r => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => handleRoleChange(r)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer",
                                role === r
                                    ? "bg-surface shadow-md text-primary"
                                    : "text-muted-fg hover:text-fg"
                            )}
                        >
                            {r === 'mukhtar' && <Shield size={14} strokeWidth={2.5} />}
                            {r === 'unit' && <User size={14} strokeWidth={2.5} />}
                            {r === 'call_center' && <Headphones size={14} strokeWidth={2.5} />}
                            {tr(r)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold tracking-tight text-fg leading-tight">
                        {t('loginTitle')}
                    </h3>
                    <p className="text-sm text-muted-fg leading-relaxed">
                        {role === 'mukhtar' && t('mukhtarDesc')}
                        {role === 'unit' && t('unitDesc')}
                        {role === 'call_center' && t('callCenterDesc')}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {role === 'mukhtar' && (
                        <FormField label={t('usernameLabel')} required>
                            <Input
                                placeholder="mukhtar_kod"
                                value={formData.username || ''}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="h-12 rounded-xl text-base font-medium"
                                required
                            />
                        </FormField>
                    )}
                    {role === 'unit' && (
                        <FormField label={t('unitCodeLabel')} required>
                            <Input
                                placeholder="UNIT-XXX"
                                value={formData.code || ''}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="h-12 rounded-xl text-base font-medium"
                                required
                            />
                        </FormField>
                    )}
                    {role === 'call_center' && (
                        <FormField label={t('operatorIdLabel')} required>
                            <Input
                                placeholder="OP-XX"
                                value={formData.operatorId || ''}
                                onChange={e => setFormData({ ...formData, operatorId: e.target.value })}
                                className="h-12 rounded-xl text-base font-medium"
                                required
                            />
                        </FormField>
                    )}

                    <FormField label={t('passwordLabel')} required hint={t('demoHint', { password: '123' })}>
                        <Input
                            type="password"
                            placeholder="••••••"
                            value={formData.password || ''}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="h-12 rounded-xl text-base font-medium"
                            required
                        />
                    </FormField>

                    {error && (
                        <div className="flex items-center gap-3 text-sm font-semibold text-danger bg-danger/5 p-4 rounded-xl border border-danger/10">
                            <Lock size={16} strokeWidth={2.5} />
                            {error}
                        </div>
                    )}

                    <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 transition-all" isLoading={loading}>
                        {t('submit')}
                    </Button>
                </form>
            </div>
        </div>
    );
}



