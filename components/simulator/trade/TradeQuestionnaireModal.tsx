'use client';

// components/simulator/trade/TradeQuestionnaireModal.tsx
// A mandatory, non-dismissible questionnaire modal shown once per account on /trade.
// Captures user's trading experience (1–10 stars) and community vote on the expiring
// domain transition. Provides both English and Bengali translations.

import React, { useState } from 'react';
import { Star, HelpCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { fetchWithFreshToken } from '@/lib/utils/fetchWithToken';
import { VALID_DOMAIN_CHOICES, DomainChoiceId } from '@/lib/surveyConstants';

interface Props {
  onSuccess: () => void;
}

export default function TradeQuestionnaireModal({ onSuccess }: Props) {
  const [lang, setLang] = useState<'en' | 'bn'>('bn'); // default to Bengali for local audience with toggle to English
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [domainChoice, setDomainChoice] = useState<DomainChoiceId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRating = hoveredRating || rating || 0;

  const getRatingLabel = (score: number) => {
    if (score === 0) return { en: 'Select your rating', bn: 'রেটিং নির্বাচন করুন' };
    if (score <= 2) return { en: 'Beginner / Just starting out', bn: '১-২: সম্পূর্ণ নতুন / শুরু করেছি মাত্র' };
    if (score <= 4) return { en: 'Basic / Learning the ropes', bn: '৩-৪: প্রাথমিক ধারণা আছে / শিখছি' };
    if (score <= 7) return { en: 'Intermediate / Active learner', bn: '৫-৭: মাঝারি অভিজ্ঞতা / নিয়মিত চর্চা করছি' };
    if (score <= 9) return { en: 'Experienced / Active trader', bn: '৮-৯: বেশ অভিজ্ঞ / নিয়মিত ট্রেড করি' };
    return { en: 'Expert / Professional trader', bn: '১০: পেশাদার / বহু বছরের অভিজ্ঞতা' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !domainChoice || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetchWithFreshToken('/api/survey/trade-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradingExperience: rating,
          domainChoice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit response. Please try again.');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Survey submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="questionnaire-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#11161F] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 text-gray-900 dark:text-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Language Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="questionnaire-title" className="text-base sm:text-lg font-bold tracking-tight">
                {lang === 'bn' ? 'কমিউনিটি মতামত' : 'Quick Community Poll'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'bn' ? '১ মিনিটের ছোট মতামত দিন' : 'Help shape the future of this project'}
              </p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700/60">
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                lang === 'bn'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Question 1: Trading Experience (10 Stars) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold">1</span>
                {lang === 'bn' ? 'আপনার ট্রেডিং অভিজ্ঞতা কেমন?' : 'Your trading experience'}
              </label>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                {activeRating > 0 ? `${activeRating}/10` : lang === 'bn' ? 'বাছাই করুন' : 'Rate 1–10'}
              </span>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {lang === 'bn' ? getRatingLabel(activeRating).bn : getRatingLabel(activeRating).en}
            </p>

            {/* 10 Stars Container */}
            <div
              className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 dark:bg-[#181F2A] border border-gray-200 dark:border-gray-800 rounded-xl"
              onMouseLeave={() => setHoveredRating(null)}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((starNum) => {
                const isFilled = starNum <= activeRating;
                const isSelected = starNum === rating;

                return (
                  <button
                    key={starNum}
                    type="button"
                    onClick={() => setRating(starNum)}
                    onMouseEnter={() => setHoveredRating(starNum)}
                    className="p-1 sm:p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95 touch-manipulation"
                    aria-label={`${starNum} star${starNum > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                          : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                      } ${isSelected ? 'scale-110' : ''}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Domain Renewal Dilemma */}
          <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800/80">
            <div>
              <label className="text-xs sm:text-sm font-bold flex items-start gap-1.5 text-gray-800 dark:text-gray-200 leading-snug">
                <span className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold mt-0.5">2</span>
                <span>
                  {lang === 'bn' ? (
                    <>
                      যেহেতু এটি একটি শখের প্রজেক্ট (hobby project), <span className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded">stocksimulator.tech</span> ডোমেইনের মেয়াদ শীঘ্রই শেষ হয়ে যাচ্ছে এবং এটি রিনিউ করার মতো বাজেট আমার কাছে নেই।
                    </>
                  ) : (
                    <>
                      As this is a hobby project, domain <span className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded">stocksimulator.tech</span> is going to expire and renewing it will cost money which I do not have.
                    </>
                  )}
                </span>
              </label>
              <div className="ml-6 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ✨ {lang === 'bn' ? 'সার্ভিসে কোনো পরিবর্তন আসবে না (No change in service)' : 'No change in service'}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 ml-1 sm:ml-6">
              {VALID_DOMAIN_CHOICES.map((option, idx) => {
                const isSelected = domainChoice === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDomainChoice(option.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs sm:text-sm flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold shadow-sm'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#151B24] text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400'
                          : 'border-gray-400 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-gray-900" />}
                    </div>
                    <div className="flex-1 leading-relaxed">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white mr-1.5">
                          {idx + 1}.
                        </span>
                        {lang === 'bn' ? option.labelBn : option.labelEn}
                      </div>
                      {/* Secondary language preview for clarity */}
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-normal">
                        {lang === 'bn' ? option.labelEn : option.labelBn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!rating || !domainChoice || submitting}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 ${
                !rating || !domainChoice || submitting
                  ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'bn' ? 'জমা হচ্ছে…' : 'Submitting…'}</span>
                </>
              ) : (
                <>
                  <span>{lang === 'bn' ? 'জমা দিন এবং ট্রেডিং শুরু করুন' : 'Submit & Continue Trading'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-2">
              🔒 {lang === 'bn' ? 'এই পপ-আপটি প্রতিটি অ্যাকাউন্টে শুধুমাত্র একবারই আসবে' : 'This poll only appears once per account'}
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
