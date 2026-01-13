import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from './config';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !locales.includes(locale as Locale)) notFound();

    return {
        locale: locale as string,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
