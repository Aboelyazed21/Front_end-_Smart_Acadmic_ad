import { useEffect, useState } from 'react';

const FIRST_VISIT_KEY = 'aidm-first-visit-typed';

export function useFirstVisitTyping() {
  const [first, setFirst] = useState(() => {
    try {
      return localStorage.getItem(FIRST_VISIT_KEY) !== '1';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    if (!first) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(FIRST_VISIT_KEY, '1');
      } catch {}
      setFirst(false);
    }, 15000);
    return () => window.clearTimeout(t);
  }, [first]);
  return first;
}

export function TypewriterText({
  text,
  className,
  speed = 24,
  active = true,
}: {
  text: string;
  className?: string;
  speed?: number;
  active?: boolean;
}) {
  const [shown, setShown] = useState(active ? '' : text);
  useEffect(() => {
    if (!active) {
      setShown(text);
      return;
    }
    setShown('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, active]);
  return (
    <span className={className}>
      {shown}
      {active && shown.length < text.length ? (
        <span
          className="ms-0.5 inline-block w-[2px] animate-pulse rounded-sm bg-brand-400 align-middle"
          style={{ height: '0.9em' }}
          aria-hidden
        />
      ) : null}
    </span>
  );
}
