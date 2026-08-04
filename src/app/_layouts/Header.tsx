import { cookies } from 'next/headers';

import LanguageSwitcher from '@/shared/components/i18n/LanguageSwitcher';
import ThemeSwitcher from '@/shared/components/theme/ThemeSwitcher';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

const COOKIE_NAME_THEME = 'theme';

export default async function Header() {
  const cookieStore = await cookies();
  const theme = (cookieStore.get(COOKIE_NAME_THEME)?.value ?? 'light') as Theme;

  return (
    <header className="flex w-full flex-row items-center justify-between">
      <div className="">header</div>

      <div className="">
        <LanguageSwitcher />
      </div>

      <div className="">
        <ThemeSwitcher current={theme} />
      </div>
    </header>
  );
}
