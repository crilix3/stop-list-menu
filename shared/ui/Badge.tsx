import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'accent' | 'muted';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-black/[0.06] text-ink',
  success: 'bg-(--succes-bg) text-(--succes-color)',
  accent: 'bg-(--stopped-bg) text-(--stopped-color)',
  muted: 'bg-black/[0.04] text-muted',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
