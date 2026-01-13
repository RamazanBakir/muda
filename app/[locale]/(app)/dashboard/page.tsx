"use client";

import { Link } from "@/navigation";
import { Container } from "@/shared/ui/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { useSession } from "@/features/auth";
import { useTranslations, useLocale } from "next-intl";
import { Plus, List, HelpCircle, ArrowRight } from "lucide-react";

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
        <Container className="space-y-12">
            <PageHeader
                title={t('greeting', { name: firstName })}
                description={role === 'citizen' ? t('citizenSubTitle') : t('systemSubTitle')}
                actions={
                    <div className="text-xs text-muted-fg font-black uppercase tracking-widest bg-surface-2 px-4 py-2.5 rounded-xl border-2 border-border/50 shadow-inner">
                        {new Date().toLocaleDateString(localeStr === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                }
            />

            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {/* ACTION: CREATE ISSUE */}
                <Card className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                        <Plus size={120} />
                    </div>
                    <CardHeader className="relative z-10">
                        <div className="h-16 w-16 bg-primary text-primary-fg rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <Plus size={28} strokeWidth={3} />
                        </div>
                        <CardTitle className="text-2xl">{t('createCard.title')}</CardTitle>
                        <CardDescription className="text-lg">
                            {role === 'citizen'
                                ? t('createCard.descCitizen')
                                : t('createCard.descSystem')
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-8 pt-0 relative z-10">
                        <Link href="/issue/new" className="w-full">
                            <Button size="lg" className="w-full shadow-lg group-hover:shadow-primary/30">
                                {t('createCard.button')}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* ACTION: VIEW LIST */}
                <Card className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="relative z-10">
                        <div className="h-16 w-16 bg-secondary text-secondary-fg rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                            <List size={28} strokeWidth={3} />
                        </div>
                        <CardTitle className="text-2xl">{getListCardTitle()}</CardTitle>
                        <CardDescription className="text-lg">
                            {t('listCard.desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-8 pt-0 relative z-10">
                        <Link href="/issues" className="w-full">
                            <Button size="lg" variant="outline" className="w-full">
                                {t('listCard.button')}
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* ACTION: STATS (Mock) */}
                {role !== 'citizen' && (
                    <Card className="flex flex-col border-2 border-dashed border-border bg-surface-2/30 shadow-none">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm uppercase tracking-widest font-black text-muted-fg opacity-60">
                                {t('statsCard.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-surface p-6 rounded-2xl border-2 border-border/50 shadow-sm transition-transform hover:scale-105">
                                    <div className="text-4xl font-black text-neutral-900 dark:text-neutral-50 leading-none">12</div>
                                    <div className="text-[10px] font-black text-muted-fg uppercase tracking-widest mt-3 opacity-80">{t('statsCard.openIssues')}</div>
                                </div>
                                <div className="bg-surface p-6 rounded-2xl border-2 border-border/50 shadow-sm transition-transform hover:scale-105">
                                    <div className="text-4xl font-black text-success leading-none">8</div>
                                    <div className="text-[10px] font-black text-muted-fg uppercase tracking-widest mt-3 opacity-80">{t('statsCard.resolvedIssues')}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {session.role === 'citizen' && (
                <div className="bg-primary-50 dark:bg-primary-900/10 border-2 border-primary/20 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-primary/5">
                    <div className="space-y-3 text-center md:text-left max-w-2xl">
                        <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs mb-1">
                            <HelpCircle className="w-4 h-4" />
                            {t('helpBanner.title')}
                        </div>
                        <h4 className="text-2xl font-black text-neutral-900 dark:text-neutral-50">{t('helpBanner.title')}</h4>
                        <p className="text-lg text-muted-fg font-medium leading-relaxed">
                            {t('helpBanner.desc')}
                        </p>
                    </div>
                    <Button size="lg" variant="outline" className="min-w-[200px] border-primary/30 text-primary-700 hover:bg-primary-100">
                        {t('helpBanner.button')}
                    </Button>
                </div>
            )}
        </Container>
    );
}


