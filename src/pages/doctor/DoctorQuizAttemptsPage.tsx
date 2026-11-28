import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';

type Attempt = {
  id: string; full_name: string; email: string; student_code: string; attempt_no: number; status: string;
  submitted_at: string | null; score: string | null; total_marks: string | null; percentage: string | null; passed: boolean | null;
};

type Stats = { in_progress: number; submitted: number; expired: number; unique_students: number; avg_percentage: string | null; passed: number; failed: number };

export function DoctorQuizAttemptsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const attempts = useQuery({ queryKey: ['quiz-attempts', id], queryFn: () => api<{ data: Attempt[] }>(`/quizzes/${id}/attempts`) });
  const stats = useQuery({ queryKey: ['quiz-stats', id], queryFn: () => api<{ data: Stats }>(`/quizzes/${id}/stats`) });

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">{t('المحاولات')}</h1>

      {stats.data?.data && (
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label={t('تسليم')} value={stats.data.data.submitted} />
          <Stat label={t('متوسط النسبة')} value={stats.data.data.avg_percentage ?? '—'} />
          <Stat label={t('ناجح')} value={stats.data.data.passed} />
          <Stat label={t('راسب')} value={stats.data.data.failed} />
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs text-ink-500">
            <tr><th className="p-3 text-start">{t('الطالب')}</th><th className="p-3">{t('محاولة')}</th><th className="p-3">{t('الدرجة')}</th><th className="p-3">{t('النسبة')}</th><th className="p-3">{t('النتيجة')}</th></tr>
          </thead>
          <tbody>
            {(attempts.data?.data ?? []).map((a) => (
              <tr key={a.id} className="border-t border-ink-100">
                <td className="p-3"><div>{a.full_name}</div><div className="text-xs text-ink-500">{a.student_code} · {a.email}</div></td>
                <td className="p-3 text-center">{a.attempt_no}</td>
                <td className="p-3 text-center">{a.score ?? '—'}/{a.total_marks ?? '—'}</td>
                <td className="p-3 text-center">{a.percentage ? `${a.percentage}%` : '—'}</td>
                <td className="p-3 text-center">{a.passed === true ? t('ناجح') : a.passed === false ? t('راسب') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-card"><p className="text-xs text-ink-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}
