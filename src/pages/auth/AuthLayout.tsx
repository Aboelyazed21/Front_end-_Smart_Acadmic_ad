import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChartNoAxesColumn, GraduationCap, MessageCircle, Moon, ShieldCheck, Sun } from 'lucide-react';
import { BuaLogo } from '../../components/brand/BuaLogo';
import { useTheme } from '../../theme/ThemeProvider';
import buaCampus from '../../assets/bua-campus.jpg';

const FEATURES = [
  { icon: MessageCircle, title: 'المساعد الذكي', text: 'اسأل أسئلتك' },
  { icon: CalendarDays, title: 'حلّ التعارضات', text: 'بلا تعارضات' },
  { icon: ChartNoAxesColumn, title: 'محاكي المعدل', text: 'خطط لمستقبلك' },
] as const;

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = 'transparent';
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas text-ink-900">
      <header id="home" className="sticky top-0 z-30 border-b border-ink-200/70 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <BuaLogo globeClassName="h-10 w-10" wordmarkClassName="h-9 w-auto" />
          <div
            role="group"
            aria-label={t('مظهر الواجهة')}
            className="inline-flex items-center gap-1 rounded-full bg-[#1d5fb4] p-1 shadow-sm ring-1 ring-white/20 dark:bg-brand-500/15 dark:ring-brand-400/30"
          >
            {(
              [
                { key: 'light', icon: Sun, title: t('الوضع الفاتح') },
                { key: 'dark', icon: Moon, title: t('الوضع الداكن') },
              ] as const
            ).map((option) => {
              const active = resolvedTheme === option.key;
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTheme(option.key)}
                  aria-pressed={active}
                  aria-label={option.title}
                  title={option.title}
                  className={[
                    'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                    active ? 'bg-white/20 text-white' : 'text-white/65 hover:text-white',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <img
          src={buaCampus}
          alt={t('حرم جامعة بدر بأسيوط')}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(199,220,248,0.86)_0%,rgba(233,243,254,0.87)_45%,rgba(248,251,255,0.95)_100%)] dark:bg-[linear-gradient(180deg,rgba(10,27,51,0.92)_0%,rgba(12,23,37,0.92)_45%,rgba(9,9,11,0.96)_100%)]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1440px] flex-1 px-4 pb-4 pt-10 sm:px-6 lg:px-10 lg:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <section id="about" className="max-w-xl scroll-mt-24 text-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 shadow-sm backdrop-blur dark:border-brand-400/30 dark:bg-brand-500/15 dark:text-brand-700">
                <GraduationCap className="h-4 w-4" />
                {t('كلية تكنولوجيا المعلومات وعلوم البيانات')}
              </span>
              <h1 className="mt-5 max-w-[38rem] text-balance font-display text-[1.75rem] font-black leading-[1.2] tracking-tight text-[#0b2e5c] dark:text-white sm:text-[2.15rem] xl:text-[2.35rem]">
                {t('قرارات أكاديمية واضحة،')} {t('لكل طالب وفي كل فصل.')}
              </h1>
              <p className="mt-4 max-w-lg text-pretty text-sm leading-7 text-[#294a70] dark:text-ink-600 sm:text-[15px]">
                {t(
                  'المرشد الأكاديمي الذكي يقرأ لائحة الكلية، ويتحقق من كل متطلب، ويشرح كل قرار بالمادة والصفحة — دون أن يسجّل أي مقرر نيابة عن الطالب.',
                )}
              </p>
              <div id="features" className="mt-7 grid max-w-lg scroll-mt-24 gap-3 sm:grid-cols-3">
                {FEATURES.map(({ icon: Icon, title: featureTitle, text }) => (
                  <div
                    key={featureTitle}
                    className="rounded-2xl border border-white/70 bg-white/85 px-3 py-4 text-center shadow-[0_10px_30px_-18px_rgba(0,58,117,0.45)] backdrop-blur dark:border-white/10 dark:bg-white/5"
                  >
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf1fe] text-brand-700 dark:bg-brand-500/15 dark:text-brand-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-2 text-sm font-bold text-[#0b2e5c] dark:text-white">{t(featureTitle)}</p>
                    <p className="mt-0.5 text-[11px] leading-5 text-[#52739a] dark:text-ink-500">{t(text)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="relative mx-auto mt-10 w-full max-w-[460px] lg:mt-0">
              <div className="relative">
                <div className="absolute left-1/2 top-0 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7ad0] to-[#124a8f] text-white shadow-lg shadow-[#0b2e5c]/30 ring-4 ring-[#f7faff] dark:ring-[#141b26]">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div className="rounded-[26px] border border-white/80 bg-[#f7faff]/95 px-5 pb-5 pt-12 shadow-[0_30px_80px_-30px_rgba(0,58,117,0.55)] backdrop-blur-md dark:border-white/10 dark:bg-[#141b26]/95 sm:px-7 sm:pb-6">
                  <h2 className="text-center font-display text-[26px] font-extrabold text-[#0b2e5c] dark:text-white">{title}</h2>
                  <p className="mx-auto mt-2 max-w-sm text-center text-[13px] leading-6 text-[#52739a] dark:text-ink-500">
                    {subtitle}
                  </p>
                  <div className="mt-5">{children}</div>
                  {footer && <div className="mt-4 text-center text-[13px] text-[#52739a] dark:text-ink-500">{footer}</div>}
                  <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#dbe8fb] bg-[#edf4fe] px-3 py-2.5 text-center text-[11px] font-medium text-[#52739a] dark:border-white/10 dark:bg-white/5 dark:text-ink-500">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-700" />
                    {t('الوصول محمي · الجلسات تُجدَّد تلقائيًا')}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div id="contact" className="relative mt-auto scroll-mt-24 pt-6">
          <svg
            className="block h-9 w-full text-[#0e3873] dark:text-[#0a1b33]"
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M0,34 C180,4 360,58 540,42 C720,26 900,54 1080,40 C1260,26 1350,34 1440,18 L1440,60 L0,60 Z"
            />
          </svg>
          <div className="bg-[#0e3873] px-5 pb-6 pt-2 text-white dark:bg-[#0a1b33] sm:px-10">
            <div className="mx-auto flex max-w-[1440px] items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold">{t('كل قرار قابل للتتبع')}</p>
                <p className="text-[11px] text-white/70">{t('موثوق · آمن · شفاف')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
