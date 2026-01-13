"use client";

import { useSession } from "../lib/useSession";
import { Button } from "@/shared/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { LogOut, UserCircle, LogIn } from "lucide-react";
import { cn } from "@/shared/lib/cn";

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
                    className={cn(
                        "flex flex-col items-center justify-center gap-0.5 p-2",
                        "text-[hsl(var(--neutral-6))] hover:text-[hsl(var(--red-6))]",
                        "transition-colors"
                    )}
                    title={t('logout')}
                >
                    <LogOut size={20} />
                    <span className="text-[10px] font-medium">Çıkış</span>
                </button>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <div className={cn(
                    "hidden lg:flex items-center gap-1.5",
                    "bg-[hsl(var(--neutral-2))] px-3 py-1.5 rounded-[var(--radius-sm)]"
                )}>
                    <UserCircle size={14} className="text-[hsl(var(--blue-6))]" />
                    <span className="text-xs font-medium text-[hsl(var(--neutral-9))]">
                        {tr(session.role)} <span className="text-[hsl(var(--neutral-5))]">•</span> {session.name}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="h-8 px-2 text-xs gap-1 text-[hsl(var(--neutral-7))] hover:text-[hsl(var(--red-6))]"
                >
                    <LogOut size={14} />
                    <span className="hidden sm:inline">{t('logout')}</span>
                </Button>
            </div>
        )
    }

    return (
        <Button
            size="sm"
            onClick={() => router.push('/login')}
            className="h-8 px-3 text-xs gap-1.5"
        >
            <LogIn size={14} />
            {t('login')}
        </Button>
    );
}
