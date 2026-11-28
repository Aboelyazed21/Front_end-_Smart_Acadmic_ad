import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, errorMessage } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';

type Quiz = { id: string; title: string; status: string; course_code: string; question_count: number; submitted_count: number; total_marks: string };

export function DoctorQuizzesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const quizzes = useQuery({ queryKey: ['doctor-quizzes'], queryFn: () => api<{ data: Quiz[] }>('/quizzes/doctor/me') });
  const refresh = () => qc.invalidateQueries({ queryKey: ['doctor-quizzes'] });

  const setStatus = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      api(`/quizzes/${id}/${publish ? 'publish' : 'unpublish'}`, { method: 'POST', body: {} }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/quizzes/${id}`, { method: 'DELETE' }),
    onSuccess: refresh,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{t('الكويزات')}</h1>
        <Link to="/doctor/quizzes/new"><Button>{t('كويز جديد')}</Button></Link>
      </div>

      {(setStatus.isError || remove.isError) && <Alert tone="danger">{errorMessage((setStatus.error ?? remove.error) as Error)}</Alert>}

      {quizzes.isLoading && <p className="text-sm text-ink-500">{t('جارٍ التحميل…')}</p>}
      {(quizzes.data?.data.length ?? 0) === 0 && !quizzes.isLoading && <Alert tone="info">{t('لا توجد كويزات بعد.')}</Alert>}

      <div className="grid gap-3">
        {(quizzes.data?.data ?? []).map((q) => (
          <div key={q.id} className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{q.title}</p>
                <p className="text-xs text-ink-500">{q.course_code} · {q.question_count} {t('سؤال')} · {q.total_marks} {t('درجة')} · {q.submitted_count} {t('تسليم')}</p>
              </div>
              <span className="rounded-full bg-ink-50 px-3 py-1 text-xs">{q.status === 'published' ? t('منشور') : q.status === 'closed' ? t('مغلق') : t('مسودة')}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to={`/doctor/quizzes/${q.id}/edit`}><Button size="sm" variant="outline">{t('تعديل')}</Button></Link>
              <Link to={`/doctor/quizzes/${q.id}/attempts`}><Button size="sm" variant="outline">{t('المحاولات')}</Button></Link>
              <Button size="sm" variant="outline" loading={setStatus.isPending} onClick={() => setStatus.mutate({ id: q.id, publish: q.status !== 'published' })}>
                {q.status === 'published' ? t('إلغاء النشر') : t('نشر')}
              </Button>
              <Button size="sm" variant="danger" loading={remove.isPending} onClick={() => { if (window.confirm(t('حذف الكويز؟'))) remove.mutate(q.id); }}>{t('حذف')}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
