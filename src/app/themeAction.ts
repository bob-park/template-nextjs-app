'use server';

import { cookies } from 'next/headers';

import { Theme } from '@/shared/components/theme/theme';

const COOKIE_NAME_THEME = 'theme';

export async function setTheme(theme: Theme) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME_THEME, theme);
}
