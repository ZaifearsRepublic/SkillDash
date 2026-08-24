'use client';

// contexts/SimulatorContext.tsx
// One shared useSimulator instance for the whole app shell.
//
// The broker-style shell renders live figures in three places at once (the
// top market strip, the screen body, and the order screen). Calling
// useSimulator() in each would spin up a separate 3-minute market poll and a
// separate Firestore onSnapshot per consumer — multiplying reads and letting
// the strip and the body disagree mid-refresh. This provider runs the hook
// exactly once per mounted app surface and hands the same object to everyone.
import React, { createContext, useContext, ReactNode } from 'react';
import { useSimulator } from '@/hooks/useSimulator';

type SimulatorValue = ReturnType<typeof useSimulator>;

const SimulatorContext = createContext<SimulatorValue | null>(null);

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const simulator = useSimulator();
  return <SimulatorContext.Provider value={simulator}>{children}</SimulatorContext.Provider>;
}

/**
 * Read the shared simulator state. Throws rather than silently falling back
 * to its own hook instance, so a component accidentally rendered outside the
 * app shell is caught in development instead of quietly doubling Firestore
 * reads in production.
 */
export function useSharedSimulator(): SimulatorValue {
  const ctx = useContext(SimulatorContext);
  if (!ctx) {
    throw new Error('useSharedSimulator must be used inside a <SimulatorProvider> (see components/app/AppShell.tsx)');
  }
  return ctx;
}
