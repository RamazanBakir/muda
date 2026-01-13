import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale,

    // If true, the default locale will not have a prefix (e.g. /dashboard instead of /tr/dashboard)
    // For SEO and clarity, we'll keep it false so /tr/ is always there.
    localePrefix: 'always'
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(tr|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
