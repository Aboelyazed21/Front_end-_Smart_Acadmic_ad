import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, errorMessage } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';

type Course = { id: string; code: string; name_ar: string };
type Doctor = { id: string; full_name: string; email: string; status: string; title: string | null; profile_picture_url: string | null; created_at: string; courses: Course[] };

const input = 'w-full rounded-xl border border-ink-200 bg-surface px-3 py-2 text-sm';

export function AdminDoctorsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const doctors = useQuery({ queryKey: ['admin-doctors'], queryFn: () => api<{ data: Doctor[] }>('/admin/doctors') });
  const courses = useQuery({ queryKey: ['admin-courses-all'], queryFn: () => api<{ data: Course[]; rows?: Course[] }>('/admin/courses').then((r) => ({ data: (r.data ?? (r as unknown as { rows: Course[] }).rows ?? []) as Course[] })) });

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Doctor | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-doctors'] });

  const create = useMutation({
    mutationFn: () => api('/admin/doctors', { method: 'POST', body: { email, fullName, password, title: title || undefined, profilePictureUrl: profilePictureUrl || undefined, courseIds: selected } }),
    onSuccess: () => { reset(); refresh(); },
  });
  const update = useMutation({
    mutationFn: () => api(`/admin/doctors/${editing!.id}`, { method: 'PUT', body: { fullName, email, title: title || null, profilePictureUrl: profilePictureUrl || null, ...(password ? { password } : {}) } }),
    onSuccess: () => { reset(); refresh(); },
  });
  const setStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => api(`/admin/doctors/${id}/status`, { method: 'PATCH', body: { status } }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => api(`/admin/doctors/${id}`, { method: 'DELETE' }), onSuccess: refresh });
  const assign = useMutation({ mutationFn: ({ id, courseIds }: { id: string; courseIds: string[] }) => api(`/admin/doctors/${id}/courses`, { method: 'PUT', body: { courseIds } }), onSuccess: refresh });

  function reset() { setEmail(''); setFullName(''); setPassword(''); setTitle(''); setProfilePictureUrl(''); setSelected([]); setEditing(null); }
  function startEdit(d: Doctor) {
    setEditing(d); setEmail(d.email); setFullName(d.full_name); setTitle(d.title ?? ''); setProfilePictureUrl(d.profile_picture_url ?? ''); setPassword(''); setSelected(d.courses.map((c) => c.id));
  }

  const allCourses = courses.data?.data ?? [];
  const err = create.error ?? update.error ?? setStatus.error ?? remove.error ?? assign.error;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('الأطباء')}</h1>
      {err && <Alert tone="danger">{errorMessage(err as Error)}</Alert>}

      <div className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-card">
        <h2 className="mb-3 text-sm font-semibold">{editing ? t('تعديل طبيب') : t('إنشاء طبيب')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={input} placeholder={t('الاسم الكامل')} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className={input} type="email" placeholder={t('البريد الإلكتروني')} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" placeholder={editing ? t('كلمة مرور جديدة (اختياري)') : t('كلمة المرور (12+)')} value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className={input} placeholder={t('المسمى الأكاديمي')} value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={input} placeholder={t('رابط الصورة')} value={profilePictureUrl} onChange={(e) => setProfilePictureUrl(e.target.value)} />
        </div>

        <p className="mt-3 text-xs font-medium text-ink-600">{t('المواد المسندة')}</p>
        <div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-ink-100 p-2">
          {allCourses.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(c.id)} onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id))} />
              {c.code} · {c.name_ar}
            </label>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <Button loading={create.isPending || update.isPending} onClick={() => editing ? update.mutate() : create.mutate()}>{editing ? t('حفظ') : t('إنشاء')}</Button>
          {editing && <Button variant="outline" onClick={reset}>{t('إلغاء')}</Button>}
        </div>
      </div>

      <div className="grid gap-3">
        {(doctors.data?.data ?? []).map((d) => (
          <div key={d.id} className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{d.full_name}{d.title ? ` · ${d.title}` : ''}</p>
                <p className="text-xs text-ink-500">{d.email} · {d.status} · {new Date(d.created_at).toLocaleDateString()}</p>
                <p className="mt-1 text-xs text-ink-500">{t('المواد')}: {d.courses.map((c) => c.code).join('، ') || '—'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(d)}>{t('تعديل')}</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: d.id, status: d.status === 'active' ? 'inactive' : 'active' })}>{d.status === 'active' ? t('تعطيل') : t('تفعيل')}</Button>
                <Button size="sm" variant="danger" onClick={() => { if (window.confirm(t('حذف الطبيب؟'))) remove.mutate(d.id); }}>{t('حذف')}</Button>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-ink-500">{t('تعديل المواد')}</summary>
              <div className="mt-2 max-h-32 space-y-1 overflow-y-auto rounded-xl border border-ink-100 p-2">
                {allCourses.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={d.courses.some((x) => x.id === c.id)}
                      onChange={(e) => { const ids = e.target.checked ? [...d.courses.map((x) => x.id), c.id] : d.courses.map((x) => x.id).filter((x) => x !== c.id); assign.mutate({ id: d.id, courseIds: ids }); }} />
                    {c.code} · {c.name_ar}
                  </label>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
