import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';

type Quiz = {
  id: string;
  title: string;
  course_code: string;
  course_name_ar: string;
  total_marks: string;
  duration_minutes: number;
  starts_at: string;
  ends_at: string;
  attempts_allowed: number;
  attempts_used: number;
  question_count: number;
  can_start: boolean;
  in_progress: number;
};

export function StudentQuizzesPage() {
  const { t } = useTranslation();
  const quizzes = useQuery({
    queryKey: ['student-quizzes'],
    queryFn: () => api<{ data: Quiz[] }>('/quizzes/student'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">{t('الكويزات')}</h1>
        <p className="mt-1 text-sm text-ink-500">{t('كويزات موادك المسجّلة فقط.')}</p>
      </div>

      {quizzes.isLoading && <p className="text-sm text-ink-500">{t('جارٍ التحميل…')}</p>}
      {quizzes.isError && <Alert tone="danger">{t('تعذّر تحميل الكويزات.')}</Alert>}
      {!quizzes.isLoading && (quizzes.data?.data.length ?? 0) === 0 && (
        <Alert tone="info">{t('لا توجد كويزات منشورة لموادك حاليًا.')}</Alert>
      )}

      <div className="grid gap-4">
        {(quizzes.data?.data ?? []).map((quiz) => (
          <div key={quiz.id} className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">{quiz.title}</p>
                <p className="mt-0.5 text-xs text-ink-500">{quiz.course_code} · {quiz.course_name_ar}</p>
              </div>
              <span className="rounded-full bg-ink-50 px-3 py-1 text-xs text-ink-600">
                {quiz.attempts_used}/{quiz.attempts_allowed} {t('محاولة')}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-500">
              <span>{quiz.question_count} {t('سؤال')}</span>
              <span>{quiz.total_marks} {t('درجة')}</span>
              <span>{quiz.duration_minutes} {t('دقيقة')}</span>
              <span>{new Date(quiz.starts_at).toLocaleString()} → {new Date(quiz.ends_at).toLocaleString()}</span>
            </div>
            <div className="mt-4">
              <Link to={`/student/quizzes/${quiz.id}`}>
                <Button size="sm" disabled={!quiz.can_start && quiz.in_progress === 0}>
                  {quiz.in_progress > 0 ? t('متابعة الكويز') : t('ابدأ الكويز')}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
