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
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg/60 ml-1">
                    Giriş Yöntemi Seçin
                </span>
                <div className="flex bg-surface-2 p-1.5 rounded-[20px] w-full border-2 border-border/20 shadow-inner">
                    {(['mukhtar', 'unit', 'call_center'] as UserRole[]).map(r => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => handleRoleChange(r)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black rounded-2xl transition-all duration-500 uppercase tracking-widest cursor-pointer",
                                role === r
                                    ? "bg-white dark:bg-neutral-700 shadow-xl shadow-neutral-200 dark:shadow-black/40 text-primary translate-y-[-1px]"
                                    : "text-muted-fg hover:text-neutral-600 dark:hover:text-neutral-300"
                            )}
                        >
                            {r === 'mukhtar' && <Shield size={12} strokeWidth={3} />}
                            {r === 'unit' && <User size={12} strokeWidth={3} />}
                            {r === 'call_center' && <Headphones size={12} strokeWidth={3} />}
                            {tr(r)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 leading-none">
                        {t('loginTitle')}
                    </h3>
                    <p className="text-base text-muted-fg font-medium opacity-80">
                        {role === 'mukhtar' && t('mukhtarDesc')}
                        {role === 'unit' && t('unitDesc')}
                        {role === 'call_center' && t('callCenterDesc')}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {role === 'mukhtar' && (
                        <FormField label={t('usernameLabel')} required>
                            <Input
                                placeholder="mukhtar_kod"
                                value={formData.username || ''}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="h-14 rounded-2xl text-lg font-bold"
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
                                className="h-14 rounded-2xl text-lg font-bold"
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
                                className="h-14 rounded-2xl text-lg font-bold"
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
                            className="h-14 rounded-2xl text-lg font-bold"
                            required
                        />
                    </FormField>

                    {error && (
                        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-danger bg-danger/5 p-5 rounded-2xl animate-in shake-1 border-2 border-danger/10">
                            <Lock size={16} strokeWidth={3} />
                            {error}
                        </div>
                    )}

                    <Button type="submit" size="lg" className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all" isLoading={loading}>
                        {t('submit')}
                    </Button>
                </form>
            </div>
        </div>
    );
}



