"use client";

import { Link } from "@/navigation";
import { Container } from "@/shared/ui/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { useSession } from "@/features/auth";
import { useTranslations, useLocale } from "next-intl";
import { Plus, List, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export default function DashboardPage() {
    const { session } = useSession();
    const t = useTranslations("dashboard");
    const localeStr = useLocale();

    if (!session) return null;

    const role = session.role;
    const firstName = session.name.split(" ")[0];

    const getListCardTitle = () => {
        switch (role) {
            case 'citizen': return t('listCard.titleCitizen');
            case 'mukhtar': return t('listCard.titleMukhtar');
            case 'unit': return t('listCard.titleUnit');
            default: return t('listCard.titleCallCenter');
        }
    };

    return (
        <Container className="space-y-6">
            <PageHeader
                title={t('greeting', { name: firstName })}
                description={role === 'citizen' ? t('citizenSubTitle') : t('systemSubTitle')}
                actions={
                    <div className="text-xs font-medium text-[hsl(var(--neutral-7))] bg-[hsl(var(--neutral-2))] px-3 py-1.5 rounded-[var(--radius-sm)]">
                        {new Date().toLocaleDateString(localeStr === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* ACTION: CREATE ISSUE */}
                <Card className="group">
                    <CardHeader>
                        <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                            "bg-[hsl(var(--blue-6))] text-white"
                        )}>
                            <Plus size={20} strokeWidth={2} />
                        </div>
                        <CardTitle>{t('createCard.title')}</CardTitle>
                        <CardDescription>
                            {role === 'citizen'
                                ? t('createCard.descCitizen')
                                : t('createCard.descSystem')
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-2">
                        <Link href="/issue/new" className="w-full">
                            <Button className="w-full">
                                {t('createCard.button')}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* ACTION: VIEW LIST */}
                <Card className="group">
                    <CardHeader>
                        <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                            "bg-[hsl(var(--blue-1))] text-[hsl(var(--blue-6))]"
                        )}>
                            <List size={20} strokeWidth={2} />
                        </div>
                        <CardTitle>{getListCardTitle()}</CardTitle>
                        <CardDescription>
                            {t('listCard.desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-2">
                        <Link href="/issues" className="w-full">
                            <Button variant="outline" className="w-full">
                                {t('listCard.button')}
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* ACTION: STATS (Mock) */}
                {role !== 'citizen' && (
                    <Card className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-[hsl(var(--neutral-7))]">
                                {t('statsCard.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[hsl(var(--neutral-2))] p-3 rounded-[var(--radius-sm)]">
                                    <div className="text-2xl font-semibold text-[hsl(var(--neutral-11))]">12</div>
                                    <div className="text-xs text-[hsl(var(--neutral-7))]">{t('statsCard.openIssues')}</div>
                                </div>
                                <div className="bg-[hsl(var(--green-1))] p-3 rounded-[var(--radius-sm)]">
                                    <div className="text-2xl font-semibold text-[hsl(var(--green-9))]">8</div>
                                    <div className="text-xs text-[hsl(var(--neutral-7))]">{t('statsCard.resolvedIssues')}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Help Banner */}
            {session.role === 'citizen' && (
                <div className={cn(
                    "rounded-[var(--radius-lg)] p-5",
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                    "bg-[hsl(var(--blue-1))]",
                    "border border-[hsl(var(--blue-3))]"
                )}>
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[hsl(var(--blue-6))] text-white flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-[hsl(var(--neutral-11))]">{t('helpBanner.title')}</h4>
                            <p className="text-sm text-[hsl(var(--neutral-7))] mt-0.5">
                                {t('helpBanner.desc')}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">
                        {t('helpBanner.button')}
                    </Button>
                </div>
            )}
        </Container>
    );
}
