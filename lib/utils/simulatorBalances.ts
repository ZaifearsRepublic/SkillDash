/**
 * Server-side helper for reading every user's simulator (trading) balance —
 * the BDT-equivalent virtual currency credited by bKash recharge and spent/
 * earned by trading, stored at
 * `artifacts/{appId}/users/{uid}/simulator/state.balance`.
 *
 * `users/{uid}.coins` — a separate, older gating currency inherited from an
 * earlier shared codebase — was removed; this trading balance is now the
 * only currency in the app. Anything about "coins in circulation" or "top
 * coin holders" means this balance, so every admin-analytics read of
 * "coins" should go through this helper.
 *
 * Uses a collectionGroup query across every user's `simulator` subcollection
 * (which only ever holds one doc, "state") rather than `orderBy`, so it needs
 * no composite index — just a plain scan, capped defensively.
 */

const BALANCE_FETCH_CAP = 50_000;

export interface UserBalance {
  uid: string;
  balance: number;
}

export interface AllUserBalancesResult {
  balances: UserBalance[];
  truncated: boolean;
}

export async function getAllUserBalances(db: FirebaseFirestore.Firestore): Promise<AllUserBalancesResult> {
  const snap = await db.collectionGroup('simulator').limit(BALANCE_FETCH_CAP).get();

  const balances: UserBalance[] = [];
  for (const doc of snap.docs) {
    if (doc.id !== 'state') continue; // defensive: only the fixed state doc holds a balance
    const uid = doc.ref.parent.parent?.id;
    if (!uid) continue;
    const data = doc.data();
    const balance = typeof data?.balance === 'number' && Number.isFinite(data.balance) ? data.balance : 0;
    balances.push({ uid, balance });
  }

  return { balances, truncated: snap.size >= BALANCE_FETCH_CAP };
}
