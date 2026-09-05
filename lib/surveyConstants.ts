// lib/surveyConstants.ts
// Shared constants and types for the trade questionnaire poll.
// Safe to import in both client components and server API routes.

export const VALID_DOMAIN_CHOICES = [
  {
    id: 'shahoriar_bd',
    labelEn: 'We can use https://stocksimulator.shahoriar.bd/ domain',
    labelBn: 'আমরা https://stocksimulator.shahoriar.bd/ ডোমেইন ব্যবহার করতে পারি',
  },
  {
    id: 'beg_crowdfund',
    labelEn: 'Beg on the internet for money',
    labelBn: 'ইন্টারনেটে মানুষের কাছে সাহায্য/অর্থ চাওয়া যেতে পারে',
  },
  {
    id: 'vercel_app',
    labelEn: 'Use http://stocksimulatorbd.vercel.app/',
    labelBn: 'http://stocksimulatorbd.vercel.app/ ব্যবহার করা যেতে পারে',
  },
] as const;

export type DomainChoiceId = typeof VALID_DOMAIN_CHOICES[number]['id'];
