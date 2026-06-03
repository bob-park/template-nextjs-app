import LanguageSwitcher from '@/shared/components/i18n/LanguageSwitcher';

export default function Header() {
  return (
    <header className="flex w-full flex-row items-center justify-between">
      <div className="">header</div>

      <div className="">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
