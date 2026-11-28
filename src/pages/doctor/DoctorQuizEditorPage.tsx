import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, errorMessage } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Feedback';

type Course = { id: string; code: string; name_ar: string };
type Option = { body: string; isCorrect: boolean };
type Question = { type: 'mcq' | 'true_false'; body: string; marks: number; explanation?: string; options?: Option[]; correctAnswer?: boolean };

type QuizFull = {
  course_id: string; title: string; description: string | null; duration_minutes: number;
  starts_at: string; ends_at: string; attempts_allowed: number; passing_score: string;
  randomize_questions: boolean; result_visibility: string;
  questions: Array<{ id: string; question_type: string; body: string; marks: string; explanation: string | null; options: Array<{ body: string; is_correct: boolean }> }>;
};

const emptyQuestion: Question = { type: 'mcq', body: '', marks: 1, options: [{ body: '', isCorrect: false }, { body: '', isCorrect: true }] };

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DoctorQuizEditorPage() {
  const { id } = useParams<{ id: string }>();
  const editing = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const courses = useQuery({ queryKey: ['doctor-courses'], queryFn: () => api<{ data: Course[] }>('/doctor/courses') });
  const existing = useQuery({
    queryKey: ['doctor-quiz', id],
    queryFn: () => api<{ data: QuizFull }>(`/quizzes/doctor/quizzes/${id}`),
    enabled: editing,
  });

  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDuration] = useState(30);
  const [startsAt, setStartsAt] = useState(toLocalInput(new Date(Date.now() + 3600_000).toISOString()));
  const [endsAt, setEndsAt] = useState(toLocalInput(new Date(Date.now() + 86_400_000).toISOString()));
  const [attemptsAllowed, setAttempts] = useState(1);
  const [passingScore, setPassing] = useState(50);
  const [randomize, setRandomize] = useState(false);
  const [resultVisibility, setResultVisibility] = useState('immediate');
  const [questions, setQuestions] = useState<Question[]>([structuredClone(emptyQuestion)]);

  useEffect(() => {
    const q = existing.data?.data;
    if (!q) return;
    setCourseId(q.course_id);
    setTitle(q.title);
    setDescription(q.description ?? '');
    setDuration(q.duration_minutes);
    setStartsAt(toLocalInput(q.starts_at));
    setEndsAt(toLocalInput(q.ends_at));
    setAttempts(q.attempts_allowed);
    setPassing(Number(q.passing_score));
    setRandomize(q.randomize_questions);
    setResultVisibility(q.result_visibility);
    setQuestions(q.questions.map((x) => (x.question_type === 'true_false'
      ? { type: 'true_false', body: x.body, marks: Number(x.marks), explanation: x.explanation ?? '', correctAnswer: x.options.find((o) => o.is_correct)?.body === 'True' }
      : { type: 'mcq', body: x.body, marks: Number(x.marks), explanation: x.explanation ?? '', options: x.options.map((o) => ({ body: o.body, isCorrect: o.is_correct })) })));
  }, [existing.data]);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        courseId, title, description: description || undefined, durationMinutes, startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(), attemptsAllowed, passingScore, randomizeQuestions: randomize,
        resultVisibility, questions,
      };
      return editing ? api(`/quizzes/${id}`, { method: 'PUT', body: payload }) : api('/quizzes', { method: 'POST', body: payload });
    },
    onSuccess: () => navigate('/doctor/quizzes'),
  });

  const updateQuestion = (index: number, patch: Partial<Question>) =>
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="font-display text-2xl font-bold">{editing ? t('تعديل كويز') : t('كويز جديد')}</h1>

      {save.isError && <Alert tone="danger">{errorMessage(save.error)}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('المادة')}>
          <select className={input} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">{t('اختر مادة')}</option>
            {(courses.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name_ar}</option>)}
          </select>
        </Field>
        <Field label={t('عنوان الكويز')}><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label={t('المدة (دقيقة)')}><input type="number" className={input} value={durationMinutes} onChange={(e) => setDuration(Number(e.target.value))} /></Field>
        <Field label={t('عدد المحاولات')}><input type="number" className={input} value={attemptsAllowed} onChange={(e) => setAttempts(Number(e.target.value))} /></Field>
        <Field label={t('درجة النجاح %')}><input type="number" className={input} value={passingScore} onChange={(e) => setPassing(Number(e.target.value))} /></Field>
        <Field label={t('عرض النتيجة')}>
          <select className={input} value={resultVisibility} onChange={(e) => setResultVisibility(e.target.value)}>
            <option value="immediate">{t('فوري')}</option><option value="after_end">{t('بعد النهاية')}</option><option value="hidden">{t('مخفي')}</option>
          </select>
        </Field>
        <Field label={t('البداية')}><input type="datetime-local" className={input} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></Field>
        <Field label={t('النهاية')}><input type="datetime-local" className={input} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></Field>
      </div>
      <Field label={t('الوصف')}><textarea className={input} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} /> {t('ترتيب عشوائي للأسئلة')}</label>

      <h2 className="text-lg font-semibold">{t('الأسئلة')}</h2>
      {questions.map((q, i) => (
        <div key={i} className="space-y-2 rounded-2xl border border-ink-100 bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{t('سؤال')} {i + 1}</span>
            <select className={input + ' max-w-[160px]'} value={q.type} onChange={(e) => updateQuestion(i, { type: e.target.value as Question['type'], options: e.target.value === 'mcq' ? [{ body: '', isCorrect: false }, { body: '', isCorrect: true }] : undefined })}>
              <option value="mcq">MCQ</option><option value="true_false">{t('صح/خطأ')}</option>
            </select>
            <input type="number" className={input + ' max-w-[90px]'} value={q.marks} onChange={(e) => updateQuestion(i, { marks: Number(e.target.value) })} />
            <Button size="sm" variant="danger" onClick={() => setQuestions((p) => p.filter((_, j) => j !== i))}>×</Button>
          </div>
          <textarea className={input} rows={2} placeholder={t('نص السؤال')} value={q.body} onChange={(e) => updateQuestion(i, { body: e.target.value })} />
          {q.type === 'mcq' ? (
            <div className="space-y-1">
              {(q.options ?? []).map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" checked={o.isCorrect} onChange={() => updateQuestion(i, { options: (q.options ?? []).map((x, xi) => ({ ...x, isCorrect: xi === oi })) })} />
                  <input className={input} placeholder={t('خيار')} value={o.body} onChange={(e) => updateQuestion(i, { options: (q.options ?? []).map((x, xi) => (xi === oi ? { ...x, body: e.target.value } : x)) })} />
                  <Button size="sm" variant="outline" onClick={() => updateQuestion(i, { options: (q.options ?? []).filter((_, xi) => xi !== oi) })}>×</Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => updateQuestion(i, { options: [...(q.options ?? []), { body: '', isCorrect: false }] })}>{t('إضافة خيار')}</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              {t('الإجابة الصحيحة')}:
              <label><input type="radio" checked={q.correctAnswer === true} onChange={() => updateQuestion(i, { correctAnswer: true })} /> {t('صحيح')}</label>
              <label><input type="radio" checked={q.correctAnswer === false} onChange={() => updateQuestion(i, { correctAnswer: false })} /> {t('خطأ')}</label>
            </div>
          )}
          <input className={input} placeholder={t('شرح (اختياري)')} value={q.explanation ?? ''} onChange={(e) => updateQuestion(i, { explanation: e.target.value })} />
        </div>
      ))}
      <Button variant="outline" onClick={() => setQuestions((p) => [...p, structuredClone(emptyQuestion)])}>{t('إضافة سؤال')}</Button>

      <div className="flex gap-2">
        <Button loading={save.isPending} onClick={() => save.mutate()}>{t('حفظ')}</Button>
        <Button variant="outline" onClick={() => navigate('/doctor/quizzes')}>{t('إلغاء')}</Button>
      </div>
    </div>
  );
}

const input = 'w-full rounded-xl border border-ink-200 bg-surface px-3 py-2 text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-medium text-ink-600">{label}</span>{children}</label>;
}
