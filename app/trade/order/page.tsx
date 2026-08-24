'use client';

// app/trade/order/page.tsx
// Dedicated order-entry screen — the destination of the app shell's raised
// centre tab. Broker apps put order entry on its own screen rather than a
// modal so it survives a refresh, is linkable (?symbol=GP&type=sell), and
// gives the quote and quantity room to breathe instead of squeezing into an
// overlay. Trades are still market orders at the live LTP — this simulator
// has no limit-order book — so the "rate" field is a read-only quote, not an
// editable price like a real order ticket's would be.
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Minus, Plus, Search, X, ChevronDown, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import AppShell from '@/components/app/AppShell';
import { useSharedSimulator } from '@/contexts/SimulatorContext';
import { searchByNameOrSymbol, getCompanyName } from '@/lib/dseCompanyNames';
import { getSaleableQuantity, estimateOrder } from '@/lib/utils/portfolio';
import NotTradedInfo from '@/components/simulator/trade/NotTradedInfo';

export default function OrderPage() {
  return (
    <AppShell redirectPath="/trade/order" redirectMessage="Please sign in to place an order">
      <Suspense fallback={null}>
        <OrderScreen />
      </Suspense>
    </AppShell>
  );
}

function OrderScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    marketInfo, simulatorState, isMarketOpen,
    executeTrade, transactionStatus, transactionMessage, resetTransaction,
  } = useSharedSimulator();

  const marketOpen = isMarketOpen();
  const stocks = marketInfo?.stocks || [];
  const stockBySymbol = useMemo(() => new Map(stocks.map((s) => [s.symbol, s])), [stocks]);
  const portfolioBySymbol = useMemo(
    () => new Map(simulatorState.portfolio.map((item) => [item.symbol, item])),
    [simulatorState.portfolio]
  );

  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>(
    searchParams.get('type') === 'sell' ? 'SELL' : 'BUY'
  );
  const [symbol, setSymbol] = useState(searchParams.get('symbol')?.toUpperCase() || '');
  const [symbolQuery, setSymbolQuery] = useState('');
  const [showPicker, setShowPicker] = useState(!symbol);
  const [quantityInput, setQuantityInput] = useState('1');

  // A symbol arriving via URL after the board has loaded (e.g. deep link
  // opened before market data resolved) should still populate the picker.
  useEffect(() => {
    const urlSymbol = searchParams.get('symbol')?.toUpperCase();
    if (urlSymbol && urlSymbol !== symbol) setSymbol(urlSymbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const stock = symbol ? stockBySymbol.get(symbol) : undefined;
  const holding = symbol ? portfolioBySymbol.get(symbol) : undefined;
  const companyName = symbol ? getCompanyName(symbol) : null;
  const isTraded = stock ? stock.traded !== false : false;
  const quantity = Math.max(0, parseInt(quantityInput, 10) || 0);

  const matches = useMemo(() => {
    const q = symbolQuery.trim();
    if (q.length < 1) return stocks.slice(0, 30);
    const upper = q.toUpperCase();
    const nameMatches = q.length >= 2 ? new Set(searchByNameOrSymbol(q)) : new Set<string>();
    return stocks.filter((s) => s.symbol.includes(upper) || nameMatches.has(s.symbol)).slice(0, 30);
  }, [symbolQuery, stocks]);

  const saleable = holding ? getSaleableQuantity(holding) : 0;
  const locked = holding ? holding.quantity - saleable : 0;
  const price = stock?.ltp || 0;
  const estimate = useMemo(() => estimateOrder(orderType, quantity, price), [orderType, quantity, price]);

  const availableBalance = simulatorState.balance;
  const canAfford = orderType === 'BUY' ? estimate.net <= availableBalance + 0.01 : true;
  const hasEnoughShares = orderType === 'SELL' ? quantity <= saleable : true;

  const blockReason = !marketOpen
    ? 'Market is closed'
    : !symbol
      ? 'Pick a stock to trade'
      : !isTraded
        ? 'This stock has not traded today'
        : quantity <= 0
          ? 'Enter a quantity'
          : orderType === 'BUY' && !canAfford
            ? `Insufficient balance — need ৳${estimate.net.toFixed(2)}`
            : orderType === 'SELL' && !hasEnoughShares
              ? saleable === 0 && holding
                ? 'All shares locked until tomorrow (T+1)'
                : `Only ${saleable} share${saleable === 1 ? '' : 's'} eligible to sell`
              : undefined;

  const canSubmit = !blockReason && transactionStatus !== 'processing';

  const selectSymbol = useCallback(
    (sym: string) => {
      setSymbol(sym);
      setShowPicker(false);
      setSymbolQuery('');
      resetTransaction();
      router.replace(`/trade/order?symbol=${sym}&type=${orderType.toLowerCase()}`, { scroll: false });
    },
    [orderType, resetTransaction, router]
  );

  const adjustQuantity = (delta: number) => {
    setQuantityInput((prev) => String(Math.max(0, (parseInt(prev, 10) || 0) + delta)));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !symbol) return;
    await executeTrade(symbol, orderType, quantity);
  };

  useEffect(() => {
    if (transactionStatus !== 'success') return;
    const t = setTimeout(() => {
      resetTransaction();
      setQuantityInput('1');
    }, 1800);
    return () => clearTimeout(t);
  }, [transactionStatus, resetTransaction]);

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-6">
      <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Place Order</h1>

      {/* BUY / SELL segmented toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl mb-4">
        {(['BUY', 'SELL'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setOrderType(t);
              resetTransaction();
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-extrabold tracking-wide transition-all ${
              orderType === t
                ? t === 'BUY'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Symbol selector */}
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1A1F26] border border-gray-200 dark:border-gray-800 rounded-xl mb-3 text-left"
      >
        {symbol ? (
          <div>
            <div className="font-bold text-base text-gray-900 dark:text-white">{symbol}</div>
            {companyName && <div className="text-xs text-gray-500 dark:text-gray-400">{companyName}</div>}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Select a stock…</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {/* Quote card */}
      {symbol && stock && (
        <div className="bg-white dark:bg-[#1A1F26] border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Order Rate (LTP)
              </div>
              {isTraded ? (
                <div className="font-mono font-extrabold text-2xl text-gray-900 dark:text-white tabular-nums">
                  ৳{price.toFixed(2)}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 dark:text-gray-500 mt-1">
                  Not traded today
                  <NotTradedInfo lastClose={stock.ycp} />
                </div>
              )}
            </div>
            {isTraded && (
              <span
                className={`font-mono text-sm font-bold px-2 py-1 rounded ${
                  stock.change >= 0
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
                }`}
              >
                {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            )}
          </div>

          <dl className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-gray-100 dark:border-gray-800">
            <QuoteFigure label="High" value={stock.high ? stock.high.toFixed(2) : '—'} />
            <QuoteFigure label="Low" value={stock.low ? stock.low.toFixed(2) : '—'} />
            <QuoteFigure label="Prev Close" value={(stock.ycp || 0).toFixed(2)} />
          </dl>

          {orderType === 'SELL' && holding && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">You hold {holding.quantity} shares</span>
              <span className={`font-mono font-bold ${locked > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {saleable} saleable{locked > 0 ? ` (${locked} locked)` : ''}
              </span>
            </div>
          )}
          {orderType === 'SELL' && !holding && (
            <p className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
              You don&apos;t own any {symbol} shares.
            </p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="bg-white dark:bg-[#1A1F26] border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
          Order Quantity
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => adjustQuantity(-1)}
            aria-label="Decrease quantity"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value.replace(/[^0-9]/g, ''))}
            className="flex-1 h-11 text-center font-mono font-bold text-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg tabular-nums"
            aria-label="Order quantity"
          />
          <button
            type="button"
            onClick={() => adjustQuantity(1)}
            aria-label="Increase quantity"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {orderType === 'SELL' && saleable > 0 && (
          <button
            type="button"
            onClick={() => setQuantityInput(String(saleable))}
            className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400"
          >
            Sell all {saleable}
          </button>
        )}
      </div>

      {/* Order summary */}
      {symbol && quantity > 0 && (
        <div className="bg-white dark:bg-[#1A1F26] border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-3 space-y-2">
          <SummaryLine label="Gross value" value={`৳${estimate.gross.toFixed(2)}`} />
          <SummaryLine label="Commission (0.4%)" value={`৳${estimate.commission.toFixed(2)}`} />
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <SummaryLine
              label={orderType === 'BUY' ? 'Total payable' : 'Net proceeds'}
              value={`৳${estimate.net.toFixed(2)}`}
              bold
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 pt-1">
            <span>Buying power</span>
            <span className="font-mono">৳{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* Status */}
      {transactionStatus === 'success' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {transactionMessage}
        </div>
      )}
      {transactionStatus === 'error' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-semibold mb-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {transactionMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        title={blockReason}
        className={`w-full py-3.5 rounded-xl text-white font-extrabold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
          orderType === 'BUY'
            ? 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 dark:disabled:bg-gray-800'
            : 'bg-rose-500 hover:bg-rose-600 disabled:bg-gray-200 dark:disabled:bg-gray-800'
        } disabled:text-gray-400 dark:disabled:text-gray-500`}
      >
        {transactionStatus === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
        {orderType} {symbol || 'STOCK'}
      </button>
      {blockReason && (
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2">{blockReason}</p>
      )}

      {showPicker && (
        <SymbolPicker
          query={symbolQuery}
          onQueryChange={setSymbolQuery}
          matches={matches}
          onSelect={selectSymbol}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

function QuoteFigure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</dt>
      <dd className="font-mono font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{value}</dd>
    </div>
  );
}

function SummaryLine({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
      <span className={`font-mono tabular-nums ${bold ? 'font-extrabold text-base text-gray-900 dark:text-white' : 'text-sm font-semibold text-gray-700 dark:text-gray-300'}`}>
        {value}
      </span>
    </div>
  );
}

function SymbolPicker({
  query,
  onQueryChange,
  matches,
  onSelect,
  onClose,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  matches: import('@/hooks/useSimulator').Stock[];
  onSelect: (symbol: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#0B0E11]">
      <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-800 pt-safe">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search symbol or company…"
            className="w-full h-11 pl-9 pr-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {matches.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No matches</p>
        ) : (
          matches.map((s) => {
            const name = getCompanyName(s.symbol);
            return (
              <button
                key={s.symbol}
                type="button"
                onClick={() => onSelect(s.symbol)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">{s.symbol}</div>
                  {name && <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[220px]">{name}</div>}
                </div>
                <div className="text-right">
                  {s.traded !== false ? (
                    <div className="font-mono font-semibold text-sm text-gray-900 dark:text-white">{s.ltp.toFixed(2)}</div>
                  ) : (
                    <div className="text-[11px] text-gray-400">Not traded</div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
