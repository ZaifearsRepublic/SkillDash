'use client';

import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

interface Props {
  /** Yesterday's closing price, if known — shown so "not traded" doesn't read as "worthless". */
  lastClose?: number;
  className?: string;
}

/**
 * Small (i) affordance explaining why a stock has no live price today.
 * Self-contained: each instance owns its own open state, so many can sit in
 * a long stock table without any shared/lifted state.
 */
export default function NotTradedInfo({ lastClose, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-label="Why isn't this stock trading today?"
        aria-expanded={open}
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
      >
        <Info className="h-2.5 w-2.5" strokeWidth={3} />
      </button>

      {open && (
        <div
          role="tooltip"
          onClick={(event) => event.stopPropagation()}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-amber-200 bg-white p-3 text-left shadow-lg dark:border-amber-800/50 dark:bg-[#1A1F26]"
        >
          <p className="mb-1.5 text-xs font-bold text-gray-900 dark:text-white">Not traded today</p>
          <p className="mb-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
            No shares have changed hands yet today, so there is no live price to trade at. This
            can happen for a few reasons:
          </p>
          <ul className="mb-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
            <li>Trading has been suspended by DSE or BSEC</li>
            <li>Halted for a corporate announcement or corporate action</li>
            <li>The stock has hit its daily circuit breaker / price limit</li>
            <li>The DSE is closed today — outside trading hours, a holiday, or an extraordinary closure</li>
            <li>The company is in its record date / book-closure period (dividend, rights issue, or bonus shares)</li>
          </ul>
          <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
            This doesn&apos;t mean the stock is worthless
            {typeof lastClose === 'number' && lastClose > 0
              ? ` — its last known closing price was ৳${lastClose.toFixed(2)}.`
              : '.'}{' '}
            Trading is disabled until it trades again.
          </p>
        </div>
      )}
    </div>
  );
}
