import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';

type Doctor = { id: string; full_name: string; email: string; title: string | null; profile_picture_url: string | null; status: string; created_at: string; courses: Array<{ code: string; name_ar: string }> };

export function DoctorProfilePage() {
  const { t } = useTranslation();
  const me = useQuery({ queryKey: ['doctor-me'], queryFn: () => api<{ data: Doctor }>('/doctor/me') });
  const courses = useQuery({ queryKey: ['doctor-courses'], queryFn: () => api<{ data: Doctor['courses'] }>('/doctor/courses') });
  const d = me.data?.data;

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="font-display text-2xl font-bold">{t('ملفي')}</h1>
      <div className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-surface p-5 shadow-card">
        {d?.profile_picture_url ? <img src={d.profile_picture_url} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-brand-100" />}
        <div>
          <p className="text-lg font-semibold">{d?.full_name}</p>
          <p className="text-sm text-ink-500">{d?.email}{d?.title ? ` · ${d.title}` : ''}</p>
          <p className="mt-1 text-xs text-ink-400">{t('حالة الحساب')}: {d?.status} · {t('تاريخ الإنشاء')}: {d ? new Date(d.created_at).toLocaleDateString() : '—'}</p>
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-sm font-semibold">{t('المواد المسندة')}</h2>
        <div className="flex flex-wrap gap-2">
          {(courses.data?.data ?? []).map((c) => <span key={c.code} className="rounded-full bg-ink-50 px-3 py-1 text-xs">{c.code} · {c.name_ar}</span>)}
          {(courses.data?.data.length ?? 0) === 0 && <span className="text-sm text-ink-500">{t('لا توجد مواد مسندة.')}</span>}
        </div>
      </div>
      <p className="text-xs text-ink-400">{t('تُدير معلومات الحساب والمواد من قِبل المشرف.')}</p>
    </div>
  );
}
