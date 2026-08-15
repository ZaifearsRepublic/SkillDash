// lib/utils/money.ts
// Shared paisa-based (integer-cent) money math for trade calculations.
//
// Used by BOTH hooks/useSimulator.ts (client-side, fast UX pre-validation
// only) and app/api/simulator/trade/route.ts (server-side, authoritative).
// Previously these helpers were duplicated in the hook; extracting them here
// means the two can never quietly drift apart and disagree on a trade's
// cost/proceeds.

export const COMMISSION_RATE = 0.004;

export const toPaisa = (amount: number): number => Math.round(amount * 100);
export const fromPaisa = (paisa: number): number => paisa / 100;

export const moneyMultiply = (price: number, quantity: number): number => {
  return fromPaisa(toPaisa(price) * quantity);
};

export const moneyAdd = (a: number, b: number): number => {
  return fromPaisa(toPaisa(a) + toPaisa(b));
};

export const moneySubtract = (a: number, b: number): number => {
  return fromPaisa(toPaisa(a) - toPaisa(b));
};

export const roundMoney = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};
