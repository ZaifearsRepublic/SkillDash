'use client';

// hooks/useTradeHistory.ts
// Reads the user's executed orders for the Portfolio screen's Orders tab.
//
// Records are written server-side only (app/api/simulator/trade/route.ts) and
// firestore.rules grants the owner read but denies every client write, so this
// is a strictly read-only view of what actually settled.
import { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export interface TradeRecord {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  commission: number;
  totalAmount: number;
  timestamp: string;
}

export function useTradeHistory(max = 100) {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTrades([]);
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'stocksimulatorbd-dse-v1';
    // Matches the exact path the trade route writes to — trade_history is
    // nested under the simulator/state document, not beside it.
    const col = collection(db, 'artifacts', appId, 'users', user.uid, 'simulator', 'state', 'trade_history');

    const unsubscribe = onSnapshot(
      query(col, orderBy('timestamp', 'desc'), limit(max)),
      (snap) => {
        setTrades(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TradeRecord, 'id'>) })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        // Degrade to an empty list with a message rather than throwing — a
        // missing index or a brand-new account with no orders yet should not
        // take the whole Portfolio screen down.
        console.warn('[useTradeHistory]', err);
        setError('Order history is unavailable right now.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, max]);

  return { trades, loading, error };
}
