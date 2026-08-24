'use client';

// app/trade/page.tsx
// The Market screen: the live DSE board. Holdings now live on their own
// Portfolio tab (app/portfolio/page.tsx), so this screen is the board and
// only the board — search, dense broker-style rows, buy/sell straight from
// the list, and a chart link into each symbol's static page.
import React, { useState, useMemo, useRef, useCallback, useTransition, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSharedSimulator } from '@/contexts/SimulatorContext';
import { useTradeModal } from '@/hooks/useTradeModal';
import { searchByNameOrSymbol } from '@/lib/dseCompanyNames';
import { getUpcomingHolidays } from '@/lib/bangladeshHolidays';
import { Search, X } from 'lucide-react';
import AppShell, { useRegisterSearchFocus } from '@/components/app/AppShell';
import MarketRow from '@/components/market/MarketRow';
import StockRow from '@/components/simulator/trade/StockRow';
import StockSkeleton from '@/components/simulator/trade/StockSkeleton';
import TradeModal from '@/components/simulator/trade/TradeModal';

const MarketCalendar = dynamic(() => import('@/components/simulator/MarketCalendar'), {
  ssr: false,
  loading: () => <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />,
});

export default function TradePage() {
  return (
    <AppShell redirectPath="/trade" redirectMessage="Please sign in to access the trading simulator">
      <MarketScreen />
    </AppShell>
  );
}

function MarketScreen() {
  const {
    marketInfo, simulatorState, loading: simulatorLoading, isMarketOpen,
    executeTrade, transactionStatus, transactionMessage, resetTransaction,
  } = useSharedSimulator();

  const modal = useTradeModal(executeTrade);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const [holidays, setHolidays] = useState<string[]>([]);

  useRegisterSearchFocus(() => searchInputRef.current?.focus());

  useEffect(() => {
    getUpcomingHolidays().then(setHolidays).catch(() => setHolidays([]));
  }, []);

  const marketOpen = isMarketOpen();

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    startTransition(() => {
      setSearchQuery(value);
      setVisibleCount(50);
    });
  }, []);

  const portfolioBySymbol = useMemo(
    () => new Map(simulatorState.portfolio.map((item) => [item.symbol, item])),
    [simulatorState.portfolio]
  );

  const normalizedQuery = searchQuery.trim();
  const companyNameMatches = useMemo(
    () => (normalizedQuery.length >= 2 ? new Set(searchByNameOrSymbol(normalizedQuery)) : new Set<string>()),
    [normalizedQuery]
  );

  const filteredStocks = useMemo(() => {
    const all = marketInfo?.stocks || [];
    if (!normalizedQuery) return all;
    const upper = normalizedQuery.toUpperCase();
    return all.filter((s) => s.symbol.includes(upper) || companyNameMatches.has(s.symbol));
  }, [marketInfo?.stocks, normalizedQuery, companyNameMatches]);

  const visibleStocks = useMemo(() => filteredStocks.slice(0, visibleCount), [filteredStocks, visibleCount]);
  const hasMore = filteredStocks.length > visibleCount;

  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) setVisibleCount((prev) => prev + 50);
        },
        { threshold: 0.1 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMore]
  );

  const onTrade = useCallback(
    (symbol: string, type: 'buy' | 'sell') => modal.openTradeModal(symbol, type, resetTransaction),
    [modal, resetTransaction]
  );

  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-4">
      <div className="px-4 sm:px-0 pt-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search symbol or company…"
            aria-label="Search DSE stocks"
            className="w-full h-11 pl-9 pr-9 bg-white dark:bg-[#1A1F26] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {isPending && <p className="text-[11px] text-blue-500 font-semibold mt-1">Searching…</p>}
      </div>

      <div className="bg-white dark:bg-[#1A1F26] border-y sm:border sm:rounded-2xl border-gray-200 dark:border-gray-800 overflow-hidden">
        {simulatorLoading ? (
          <StockSkeleton count={10} />
        ) : visibleStocks.length === 0 ? (
          <div className="py-16 px-6 flex flex-col items-center text-center gap-2">
            <Search className="w-8 h-8 opacity-20" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No stocks found matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Symbol</th>
                    <th className="px-6 py-4 font-semibold text-right">Price (LTP)</th>
                    <th className="px-6 py-4 font-semibold text-right">Change</th>
                    <th className="px-6 py-4 font-semibold text-center">Category</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {visibleStocks.map((stock) => (
                    <StockRow
                      key={stock.symbol}
                      stock={stock}
                      marketOpen={marketOpen}
                      variant="market"
                      onTrade={onTrade}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {visibleStocks.map((stock) => (
                <MarketRow
                  key={stock.symbol}
                  stock={stock}
                  portfolioItem={portfolioBySymbol.get(stock.symbol)}
                  marketOpen={marketOpen}
                  onTrade={onTrade}
                />
              ))}
            </div>

            {hasMore && (
              <div ref={observerRef} className="h-10 w-full flex items-center justify-center p-4 text-xs text-gray-400 bg-gray-50 dark:bg-gray-900/20">
                Loading more…
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 sm:px-0 mt-6 mb-4">
        <MarketCalendar holidays={holidays} />
      </div>

      {modal.showTradeModal && modal.selectedStock && (
        <TradeModal
          selectedStock={modal.selectedStock}
          tradeType={modal.tradeType}
          setTradeType={modal.setTradeType}
          tradeQuantity={modal.tradeQuantity}
          setTradeQuantity={modal.setTradeQuantity}
          tradeQuantityInput={modal.tradeQuantityInput}
          setTradeQuantityInput={modal.setTradeQuantityInput}
          onClose={modal.closeTradeModal}
          onExecute={modal.handleExecuteModalTrade}
          marketInfo={marketInfo}
          simulatorState={simulatorState}
          marketOpen={marketOpen}
          transactionStatus={transactionStatus}
          transactionMessage={transactionMessage}
          resetTransaction={resetTransaction}
        />
      )}
    </div>
  );
}
