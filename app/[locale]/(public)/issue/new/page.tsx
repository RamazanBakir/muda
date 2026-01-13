"use client";

import { Container } from "@/shared/ui/container";
import { PageHeader } from "@/shared/ui/page-header";
import { IssueMethodSelector } from "@/features/issue";
import { useTranslations } from "next-intl";

export default function CreateIssuePage() {
    const t = useTranslations("createIssue");

    return (
        <Container className="py-10 max-w-3xl">
            <PageHeader
                title={t('title')}
                description={t('desc')}
            />

            <div className="mt-8">
                <IssueMethodSelector />
            </div>
        </Container>
    );
}

