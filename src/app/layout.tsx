import type { Metadata } from 'next';

import { cookies } from 'next/headers';

import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import { User } from '@/domain/users/apis/users.dto';
import RQProvider from '@/shared/components/queries/RQProvider';
import ToastProvider from '@/shared/components/toast/ToastProvider';
import { LOCALE_META } from '@/shared/i18n/config';
import { getUserLocale } from '@/shared/i18n/locale';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { OverlayProvider } from 'overlay-kit';

import Contents from './_layout/Contents';
import Footer from './_layout/Footer';
import Header from './_layout/Header';
import './globals.css';

const { WEB_SERVICE_HOST } = process.env;

const COOKIE_NAME_THEME = 'theme';
const COOKIE_NAME_TOKEN = 'auth-token';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const theme = (cookieStore.get(COOKIE_NAME_THEME)?.value ?? 'light') as Theme;

  const locale = await getUserLocale();
  const messages = await getMessages();
  const htmlLang = LOCALE_META[locale].htmlLang;

  const queryClient = new QueryClient();

  const res = await fetch(`${WEB_SERVICE_HOST}/users/me`, {
    method: 'get',
    headers: {
      Cookie: `${COOKIE_NAME_TOKEN}=${cookieStore.get(COOKIE_NAME_TOKEN)?.value || ''}`,
    },
  });

  let user;

  if (res.ok) {
    user = (await res.json()) as User;
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang={htmlLang} data-theme={theme}>
      <body className="relative size-full">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <OverlayProvider>
            <RQProvider>
              <HydrationBoundary state={dehydratedState}>
                <ToastProvider limit={5} timeout={5}>
                  <Header />
                  <Contents>{children}</Contents>
                  <Footer />
                </ToastProvider>
              </HydrationBoundary>
            </RQProvider>
          </OverlayProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
