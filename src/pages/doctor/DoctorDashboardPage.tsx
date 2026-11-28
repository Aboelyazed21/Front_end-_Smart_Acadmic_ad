import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';

type Course = { id: string; code: string; name_ar: string; name_en: string };

export function DoctorDashboardPage() {
  const { t } = useTranslation();
  const me = useQuery({ queryKey: ['doctor-me'], queryFn: () => api<{ data: { full_name: string; title: string | null; profile_picture_url: string | null } }>('/doctor/me') });
  const courses = useQuery({ queryKey: ['doctor-courses'], queryFn: () => api<{ data: Course[] }>('/doctor/courses') });
  const quizzes = useQuery({ queryKey: ['doctor-quizzes'], queryFn: () => api<{ data: Array<{ id: string; title: string; status: string; submitted_count: number; question_count: number }> }>('/quizzes/doctor/me') });

  const submitted = (quizzes.data?.data ?? []).reduce((sum, q) => sum + (q.submitted_count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {me.data?.data.profile_picture_url ? (
          <img src={me.data.data.profile_picture_url} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
            {(me.data?.data.full_name ?? 'ط').trim().charAt(0)}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{t('لوحة الطبيب')}</h1>
          <p className="text-sm text-ink-500">{me.data?.data.full_name}{me.data?.data.title ? ` · ${me.data.data.title}` : ''}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t('المواد المسندة')} value={courses.data?.data.length ?? 0} />
        <Stat label={t('الكويزات')} value={quizzes.data?.data.length ?? 0} />
        <Stat label={t('إجمالي التسليمات')} value={submitted} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t('موادك')}</h2>
        {(courses.data?.data.length ?? 0) === 0 ? (
          <p className="text-sm text-ink-500">{t('لم يُسند إليك أي مادة بعد. تواصل مع المشرف.')}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {(courses.data?.data ?? []).map((c) => (
              <div key={c.id} className="rounded-xl border border-ink-100 bg-surface p-3 shadow-card">
                <p className="text-sm font-semibold">{c.code}</p>
                <p className="text-xs text-ink-500">{c.name_ar}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link to="/doctor/quizzes" className="inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary">
        {t('إدارة الكويزات')}
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-card">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-900">{value}</p>
    </div>
  );
}
