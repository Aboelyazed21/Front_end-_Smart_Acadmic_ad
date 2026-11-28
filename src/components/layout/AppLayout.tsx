import { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  BadgeCheck,
  Bell,
  BellRing,
  BotMessageSquare,
  Building2,
  CalendarClock,
  Calculator,
  ChartColumn,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Contact,
  FileUp,
  FileWarning,
  GitCompareArrows,
  GraduationCap,
  Inbox,
  Library,
  LogOut,
  Megaphone,
  Menu,
  Monitor,
  Moon,
  PanelsTopLeft,
  Scale,
  ScrollText,
  Settings,
  Siren,
  Sun,
  UserCog,
  UsersRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { useLanguage } from '../../i18n/LanguageProvider';
import { api, qs } from '../../lib/api';
import { NAV_GROUPS, ROLE_LABELS } from '../../lib/constants';
import { cn, initials } from '../../lib/format';
import type { NotificationRow, Paginated } from '../../lib/types';
import { IconButton } from '../ui/Button';
import { BuaLogo } from '../brand/BuaLogo';
import { FloatingAssistant } from '../assistant/FloatingAssistant';

const ICONS: Record<string, LucideIcon> = {
  PanelsTopLeft,
  BadgeCheck,
  ClipboardList,
  Activity,
  Siren,
  GraduationCap,
  Calculator,
  GitCompareArrows,
  Library,
  Contact,
  BotMessageSquare,
  BellRing,
  UsersRound,
  ClipboardCheck,
  CalendarClock,
  Inbox,
  UserCog,
  Building2,
  Scale,
  ScrollText,
  ChartColumn,
  FileUp,
  FileWarning,
  Megaphone,
};

function Logo() {
  const { t } = useTranslation();
  return (
    <div className="min-w-0">
      <BuaLogo
        variant="white"
        globeClassName="h-8 w-8"
        wordmarkClassName="h-[19px] w-auto"
        className="max-w-[190px]"
      />
      <p className="mt-1.5 truncate text-[11px] font-semibold text-[#dbe9f9]/80">
        {t('المرشد الأكاديمي الذكي · AIDM')}
      </p>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, me, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = useMemo(() => (user ? NAV_GROUPS[user.role] : []), [user]);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () =>
      api<Paginated<NotificationRow>>(
        `/student/notifications${qs({ unread: 'true', page: 1, limit: 1 })}`,
      ),
    enabled: user?.role === 'student',
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const unread = notifications?.pagination.total ?? 0;

  const roleLabel = user ? t(ROLE_LABELS[user.role]) : '';
  const subtitle = useMemo(() => {
    if (user?.role === 'student' && me?.student) return `${me.student.student_code} · ${me.student.program}`;
    if (user?.role === 'advisor' && me?.advisor)
      return t('مرشد · {{count}} طالب كحد أقصى', { count: me.advisor.max_students });
    return user?.email ?? '';
  }, [user, me, t]);

  // Current section label for the header. Prefer the most specific nav entry so
  // nested routes (e.g. /student/quizzes/123) still read as "الكويزات".
  const pageTitle = useMemo(() => {
    const items = [...navItems].sort((a, b) => b.to.length - a.to.length);
    const active = items.find(
      (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
    );
    if (active) return t(active.label);
    return user ? t(ROLE_LABELS[user.role]) : '';
  }, [navItems, location.pathname, t, user]);

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-canvas">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        data-open={mobileOpen}
        className={cn(
          'app-sidebar fixed inset-y-0 start-0 z-40 flex w-72 flex-col bg-gradient-to-b from-[#0a2545] via-[#123a63] to-[#071a2e] lg:shadow-none',
          mobileOpen ? 'shadow-2xl' : '',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-5">
          <Logo />
          <IconButton
            label={t('إغلاق القائمة')}
            className="text-[#dbe9f9] hover:bg-white/10 lg:hidden"
            onClick={closeMobile}
          >
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="mx-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a8c6e8]/70">{t('الحساب الحالي')}</p>
          <p className="mt-1 truncate text-sm font-bold text-white">{user?.fullName}</p>
          <p className="truncate text-[11px] text-[#dbe9f9]/70">{subtitle}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-bold text-gold-200">
              {roleLabel}
            </span>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-2 pb-4" aria-label={t('القائمة الرئيسية')}>
          {navItems.map((item) => {
            const Icon = ICONS[item.icon] ?? PanelsTopLeft;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split('/').length === 2}
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-white/12 text-white shadow-inner ring-1 ring-white/10'
                      : 'text-[#dbe9f9]/75 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      strokeWidth={1.75}
                      className={cn(
                        'h-[18px] w-[18px] shrink-0',
                        isActive ? 'text-gold-300' : 'text-[#a8c6e8]/80',
                      )}
                    />
                    <span className="flex-1">{t(item.label)}</span>
                    {item.to === '/student/notifications' && unread > 0 && (
                      <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-[10px] font-black text-[#111b25]">
                        {unread}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <NavLink
            to="/settings"
            onClick={closeMobile}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#dbe9f9]/75 transition hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-[18px] w-[18px] text-[#a8c6e8]/70" />
            {t('إعدادات الحساب')}
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#dbe9f9]/75 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px] text-[#a8c6e8]/70" />
            {t('تسجيل الخروج')}
          </button>
          <p className="mt-2 px-3 text-[10px] leading-5 text-[#a8c6e8]/50">
            {t('نظام استشاري فقط — لا يتم تسجيل أي مقررات تلقائيًا.')}
          </p>
        </div>
      </aside>

      <div className="lg:ms-72">
        <header className="sticky top-0 z-20 border-b border-ink-200/60 bg-surface/85 backdrop-blur-xl shadow-[0_1px_0_rgba(16,24,40,0.04),0_8px_24px_-20px_rgba(16,24,40,0.18)] dark:border-white/10 dark:bg-surface/70 dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
            <IconButton label={t('فتح القائمة')} className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </IconButton>

            <div className="min-w-0">
              <p className="hidden truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400 sm:block">
                {t('المرشد الأكاديمي الذكي · AIDM')}
              </p>
              <p className="truncate text-sm font-bold text-ink-900">{pageTitle}</p>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-full border border-ink-200/70 bg-ink-50/70 p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                {user?.role === 'student' && (
                  <>
                    <NavLink
                      to="/student/notifications"
                      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition hover:bg-surface hover:text-brand-700 hover:shadow-sm dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label={
                        unread
                          ? t('الإشعارات ({{count}} غير مقروء)', { count: unread })
                          : t('الإشعارات')
                      }
                    >
                      <Bell className="h-[18px] w-[18px]" />
                      {unread > 0 && (
                        <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-solid px-1 text-[10px] font-bold text-white ring-2 ring-surface">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </NavLink>
                    <span className="mx-0.5 h-6 w-px bg-ink-200/80 dark:bg-white/10" aria-hidden />
                  </>
                )}

                <div
                  role="group"
                  aria-label={t('تبديل اللغة')}
                  className="segmented relative inline-flex h-9 items-center rounded-full p-[var(--seg-pad)]"
                >
                  <span
                    aria-hidden
                    data-index={lang === 'en' ? 0 : 1}
                    className="segmented-indicator pointer-events-none absolute bottom-1 top-1 rounded-full bg-gradient-to-b from-primary to-brand-600 shadow-sm ring-1 ring-black/5"
                  />
                  {(
                    [
                      { key: 'en', label: 'EN', title: t('English') },
                      { key: 'ar', label: 'ع', title: t('العربية') },
                    ] as const
                  ).map((option) => {
                    const active = lang === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => !active && toggleLang()}
                        aria-pressed={active}
                        title={option.title}
                        className={cn(
                          'segmented-item relative z-10 inline-flex h-7 items-center justify-center rounded-full text-[11px] font-bold tracking-wide transition-colors',
                          active ? 'text-on-primary' : 'text-ink-500 hover:text-ink-900',
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <span className="mx-0.5 h-6 w-px bg-ink-200/80 dark:bg-white/10" aria-hidden />

                <div
                  role="group"
                  aria-label={t('مظهر الواجهة')}
                  className="segmented relative inline-flex h-9 items-center rounded-full p-[var(--seg-pad)]"
                >
                  <span
                    aria-hidden
                    data-index={['light', 'dark', 'system'].indexOf(theme)}
                    className="segmented-indicator pointer-events-none absolute bottom-1 top-1 rounded-full bg-gradient-to-b from-primary to-brand-600 shadow-sm ring-1 ring-black/5"
                  />
                  {(
                    [
                      { key: 'light', icon: Sun, title: t('الوضع الفاتح') },
                      { key: 'dark', icon: Moon, title: t('الوضع الداكن') },
                      { key: 'system', icon: Monitor, title: t('حسب إعداد النظام') },
                    ] as const
                  ).map((option) => {
                    const active = theme === option.key;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => !active && setTheme(option.key)}
                        aria-pressed={active}
                        aria-label={option.title}
                        title={option.title}
                        className={cn(
                          'segmented-item relative z-10 inline-flex h-7 items-center justify-center rounded-full transition-colors',
                          active ? 'text-on-primary' : 'text-ink-500 hover:text-ink-900',
                        )}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className={cn(
                    'flex h-11 items-center gap-2 rounded-full border bg-surface ps-1 pe-1 text-start shadow-sm transition sm:pe-2.5',
                    menuOpen
                      ? 'border-brand-300 ring-2 ring-brand-100 dark:ring-brand-400/20'
                      : 'border-ink-200/80 hover:border-brand-300 hover:shadow-md',
                  )}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-700 text-xs font-bold text-on-primary shadow-sm ring-2 ring-white/60 dark:ring-white/10">
                    {initials(user?.fullName)}
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block max-w-[9.5rem] truncate text-xs font-bold text-ink-900">
                      {user?.fullName}
                    </span>
                    <span className="block text-[10px] font-medium text-ink-500">{roleLabel}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'hidden h-4 w-4 shrink-0 text-ink-400 transition sm:block',
                      menuOpen && 'rotate-180',
                    )}
                    aria-hidden
                  />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                    <div className="absolute end-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-100 bg-surface shadow-float">
                      <div className="flex items-center gap-3 border-b border-ink-50 bg-ink-50/40 px-4 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-700 text-xs font-bold text-on-primary">
                          {initials(user?.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink-900">{user?.fullName}</p>
                          <p className="truncate text-[11px] text-ink-500">{user?.email}</p>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <NavLink
                          to="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-700 transition hover:bg-ink-50"
                        >
                          <Settings className="h-4 w-4 text-ink-400" /> {t('إعدادات الحساب')}
                        </NavLink>
                        <button
                          type="button"
                          onClick={onLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-danger transition hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <LogOut className="h-4 w-4" /> {t('تسجيل الخروج')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {user?.mustChangePassword && (
            <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900 sm:px-6">
              {t('يجب تغيير كلمة المرور المؤقتة قبل متابعة استخدام النظام.')}{' '}
              <NavLink to="/settings" className="font-bold underline">
                {t('تغيير كلمة المرور الآن')}
              </NavLink>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>

        <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-center text-[11px] leading-5 text-ink-400 sm:px-6">
          {t('كل الخطط والمخرجات استشارية (DRAFT) ولا تُعد تسجيلًا رسميًا. القرار النهائي للجنة الأكاديمية بالكلية.')}
          <br />
          {t('Smart Academic Advisor · Badr University in Assiut · {{year}}', {
            year: new Date().getFullYear(),
          })}
          <br />© {new Date().getFullYear()} Aboelyazed Hatem Aboelyazed · {t('جميع الحقوق محفوظة')}
        </footer>
      </div>

      <FloatingAssistant />
    </div>
  );
}
