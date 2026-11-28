import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, errorMessage } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';

type Option = { id: string; body: string };
type Question = { id: string; question_type: string; body: string; marks: string; options: Option[] };
type Started = { attemptId: string; attemptNo: number; expiresAt: string; questions: Question[] };
type Result = { score: number; total: number; percentage: number; passed: boolean; review?: unknown[] };

export function StudentQuizTakePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<Started | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const startQuery = useQuery({
    queryKey: ['quiz-start', id],
    queryFn: () => api<{ data: Started }>(`/quizzes/student/${id}/start`, { method: 'POST', body: {} }),
    enabled: !!id && !attempt && !result,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (startQuery.data) setAttempt(startQuery.data.data);
  }, [startQuery.data]);

  const expiresAt = attempt ? new Date(attempt.expiresAt).getTime() : null;

  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => setRemaining(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
    tick();
    const id2 = window.setInterval(tick, 1000);
    return () => window.clearInterval(id2);
  }, [expiresAt]);

  const submit = useMutation({
    mutationFn: () => {
      const body = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })),
      };
      return api<{ data: Result }>(`/quizzes/student/attempts/${attempt!.attemptId}/submit`, { method: 'POST', body });
    },
    onSuccess: (res) => setResult(res.data),
  });

  const unanswered = useMemo(() => {
    if (!attempt) return 0;
    return attempt.questions.filter((q) => !answers[q.id]).length;
  }, [attempt, answers]);

  if (startQuery.isError) return <Alert tone="danger">{errorMessage(startQuery.error)}</Alert>;
  if (!attempt && !result) return <p className="text-sm text-ink-500">{t('جارٍ التحميل…')}</p>;

  if (result) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold">{t('نتيجتك')}</h1>
        <Alert tone={result.passed ? 'success' : 'danger'}>
          {t('النتيجة')}: {result.score}/{result.total} — {result.percentage}% — {result.passed ? t('ناجح') : t('راسب')}
        </Alert>
        <Button variant="outline" onClick={() => navigate('/student/quizzes')}>{t('العودة إلى الكويزات')}</Button>
      </div>
    );
  }

  const mm = remaining != null ? String(Math.floor(remaining / 60)).padStart(2, '0') : '--';
  const ss = remaining != null ? String(remaining % 60).padStart(2, '0') : '--';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold">{t('أجب عن الأسئلة')}</h1>
        <span className="rounded-full bg-danger/10 px-3 py-1 text-sm font-semibold text-danger">⏱ {mm}:{ss}</span>
      </div>

      {attempt!.questions.map((q, index) => (
        <div key={q.id} className="rounded-2xl border border-ink-100 bg-surface p-4 shadow-card">
          <p className="font-semibold text-ink-900">
            {index + 1}. {q.body} <span className="text-xs text-ink-500">({q.marks} {t('درجة')})</span>
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((o) => (
              <label key={o.id} className="flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === o.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: o.id }))}
                />
                {o.body}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink-500">{t('غير مُجاب')}: {unanswered}</span>
        <Button loading={submit.isPending} onClick={() => submit.mutate()}>{t('سلّم الكويز')}</Button>
      </div>
      {submit.isError && <Alert tone="danger">{errorMessage(submit.error)}</Alert>}
    </div>
  );
}
