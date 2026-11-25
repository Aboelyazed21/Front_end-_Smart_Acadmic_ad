import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Eye, EyeOff, KeyRound, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { errorMessage } from '../../lib/api';
import { HOME_BY_ROLE } from '../../lib/constants';
import { Alert } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthLayout } from './AuthLayout';

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerHint, setRegisterHint] = useState(false);

  const mutation = useMutation({
    mutationFn: () => login(email.trim(), password),
    onSuccess: (user) => {
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/login' ? from : HOME_BY_ROLE[user.role], { replace: true });
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!mutation.isPending) mutation.mutate();
  };

  return (
    <AuthLayout
      title={t('تسجيل الدخول')}
      subtitle={t('استخدم البريد الجامعي وكلمة المرور للوصول إلى لوحة الإرشاد الأكاديمي.')}
      footer={
        <div className="space-y-2">
          <span>
            {t('لا تملك حسابًا؟')}{' '}
            <button
              type="button"
              onClick={() => setRegisterHint((value) => !value)}
              className="font-bold text-brand-700 hover:text-brand-900"
            >
              {t('سجّل هنا')}
            </button>
          </span>
          {registerHint && (
            <Alert tone="info" className="text-start text-xs">
              {t('تُنشأ الحسابات من قِبل إدارة الكلية. تواصل مع الدعم لطلب الوصول.')}
            </Alert>
          )}
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {mutation.isError && (
          <Alert tone="danger" icon={<AlertCircle className="h-5 w-5" />} className="items-center text-xs">
            {errorMessage(mutation.error)}
          </Alert>
        )}

        <Input
          label={
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#52739a]" />
              {t('البريد الإلكتروني')}
            </span>
          }
          type="email"
          inputMode="email"
          autoComplete="username"
          dir="ltr"
          placeholder="student1@aidm.bua.edu.eg"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          leading={<Mail className="h-4 w-4" />}
          className="h-11"
          required
        />

        <div className="space-y-1.5">
          <div className="flex items-end justify-between gap-2">
            <label htmlFor="login-password" className="text-sm font-semibold text-ink-800">
              <span className="inline-flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#52739a]" />
                {t('كلمة المرور')} <span className="text-danger">*</span>
              </span>
            </label>
            <Link to="/forgot-password" className="shrink-0 text-xs font-semibold text-brand-700 hover:text-brand-900">
              {t('نسيت كلمة المرور؟')}
            </Link>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-400">
              <KeyRound className="h-4 w-4" />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              dir="ltr"
              placeholder="••••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-ink-200 bg-surface px-3.5 ps-10 text-sm text-ink-900 placeholder:text-ink-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-700"
              aria-label={showPassword ? t('إخفاء كلمة المرور') : t('إظهار كلمة المرور')}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full bg-gradient-to-r from-[#2470c8] to-[#1958ac] text-white shadow-lg shadow-[#0b2e5c]/20 hover:from-[#1f64b5] hover:to-[#144a92]"
          loading={mutation.isPending}
          icon={<LogIn className="h-4 w-4" />}
        >
          {t('دخول إلى المنصة')}
        </Button>
      </form>
    </AuthLayout>
  );
}
