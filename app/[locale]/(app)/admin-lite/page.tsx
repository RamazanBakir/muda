"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { CategoryManager } from "@/features/admin/ui/CategoryManager";
import { UnitManager } from "@/features/admin/ui/UnitManager";
import { DemoToggle } from "@/features/demo";
import { useSession } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLitePage() {
    const { session } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Only allow if role is call_center (or actual admin if we had one)
        // For demo, call_center acts as Admin Lite
        if (session && session.role !== 'call_center') {
            router.push('/dashboard');
        }
    }, [session]);

    if (!session) return null;

    return (
        <Container className="space-y-8 animate-in fade-in">
            <PageHeader
                title="Sistem Konfigürasyonu (Admin Lite)"
                description="Kategoriler, Birimler ve Demo Senaryoları yönetimi."
                actions={<DemoToggle />}
            />

            <div className="grid lg:grid-cols-2 gap-8">
                <CategoryManager />
                <UnitManager />
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
                <strong>Bilgi:</strong> Bu ekran sadece demo ve sunum amaçlıdır. Yapılan değişiklikler sadece bu tarayıcıda (localStorage) saklanır.
            </div>
        </Container>
    );
}
