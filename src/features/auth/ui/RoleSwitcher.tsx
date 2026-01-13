"use client";

import { useSession } from "../lib/useSession";
import { Button } from "@/shared/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { LogOut, UserCircle, LogIn } from "lucide-react";

interface RoleSwitcherProps {
    mobile?: boolean;
}

export function RoleSwitcher({ mobile }: RoleSwitcherProps) {
    const { session, logout } = useSession();
    const router = useRouter();
    const t = useTranslations("auth");
    const tr = useTranslations("roles");

    if (session) {
        if (mobile) {
            return (
                <button
                    onClick={logout}
                    className="flex flex-col items-center justify-center gap-1 text-white/60 hover:text-danger p-2 transition-all"
                    title={t('logout')}
                >
                    <LogOut size={24} />
                </button>
            );
        }

        return (
            <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 bg-surface-2 px-4 py-2 rounded-2xl border-2 border-border/10 shadow-sm">
                    <UserCircle size={16} className="text-primary" strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
                        {tr(session.role)} <span className="text-muted-fg opacity-40 mx-1">•</span> {session.name}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-muted-fg hover:text-danger hover:bg-danger/5 rounded-2xl gap-2 transition-all"
                >
                    <LogOut size={14} strokeWidth={3} />
                    {t('logout')}
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/login')}
                className="h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl gap-2 shadow-lg shadow-primary/20"
            >
                <LogIn size={14} strokeWidth={3} />
                {t('login')}
            </Button>
        </div>
    );
}



