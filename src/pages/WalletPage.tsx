import React from 'react';
import { useEmberEconomy } from '../context/EmberEconomyContext';
import { EmberToken } from '../components/common/EmberToken';
import {
  History,
  TrendingUp,
  TrendingDown,
  Gift,
  Clock,
  Box,
  Coins,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WalletPage: React.FC = () => {
  const {
    economy,
    isDailyRewardAvailable,
    dailyRewardCountdown,
    claimDailyReward,
  } = useEmberEconomy();

  const totalEarned = economy.transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = economy.transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'registration_bonus':
        return <Gift className="w-4 h-4 text-emerald-500" />;
      case 'daily_reward':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'crate_purchase':
        return <Box className="w-4 h-4 text-blue-500" />;
      case 'duplicate_compensation':
        return <Coins className="w-4 h-4 text-amber-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#737871] mb-1">
            <span>Virtual Campus Economy</span>
            <span>·</span>
            <span>Transaction Ledger & Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171916] dark:text-neutral-100 tracking-tight">
            EMBER Wallet & Vault
          </h1>
          <p className="text-xs sm:text-sm text-[#555952] dark:text-neutral-400 mt-0.5">
            Non-monetary virtual currency for opening badge crates, daily campus activity rewards, and duplicate compensation.
          </p>
        </div>

        <Link
          to="/badges?tab=crates"
          className="px-4 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Box className="w-4 h-4" />
          <span>Spend in Crate Shop</span>
        </Link>
      </div>

      {/* Main Balance Hero */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E3DC] dark:border-neutral-800">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#737871]">
              Available Currency Balance
            </div>
            <div className="mt-2">
              <EmberToken amount={economy.emberBalance} size="xl" />
            </div>
            <p className="text-xs text-[#555952] dark:text-neutral-400 mt-1">
              Guaranteed non-negative balance protected by ledger transactions.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            {isDailyRewardAvailable ? (
              <button
                onClick={claimDailyReward}
                className="py-2.5 px-5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Claim +5 EMBER Daily</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 text-right">
                <span className="text-[10px] font-bold text-[#737871] uppercase tracking-wider block">
                  Daily Reward Cooldown
                </span>
                <span className="text-xs font-mono font-bold text-[#EA580C]">
                  Ready in {dailyRewardCountdown}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ledger Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[#737871]">Lifetime Earned</div>
              <div className="text-xl font-black font-mono text-emerald-600 mt-1">
                +{totalEarned} EMBER
              </div>
              <div className="text-[10px] text-[#737871] mt-0.5">
                From registration, daily claims & duplicates
              </div>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[#737871]">Lifetime Spent</div>
              <div className="text-xl font-black font-mono text-neutral-800 dark:text-neutral-200 mt-1">
                -{totalSpent} EMBER
              </div>
              <div className="text-[10px] text-[#737871] mt-0.5">
                On Bronze, Silver & Golden Badge Crates
              </div>
            </div>
            <TrendingDown className="w-6 h-6 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DC] dark:border-neutral-800">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#171916] dark:text-neutral-100">
            <History className="w-4 h-4 text-[#F97316]" />
            <span>Complete Audit Ledger ({economy.transactions.length})</span>
          </div>
          <span className="text-xs text-[#737871] font-mono">Immutable Log</span>
        </div>

        {economy.transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#737871]">
            No transactions found for this account.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E3DC] dark:divide-neutral-800">
            {economy.transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              const formattedDate = new Date(tx.createdAt).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-[#FAF9F5] dark:hover:bg-neutral-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800 border border-[#E5E3DC] dark:border-neutral-700 flex items-center justify-center shrink-0">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-[#171916] dark:text-neutral-100 truncate">
                        {tx.reason}
                      </div>
                      <div className="text-[10px] text-[#737871] font-mono">
                        {formattedDate} · TxID: {tx.id}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono font-extrabold text-sm ${
                        isPositive ? 'text-emerald-600' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} EMBER
                    </div>
                    <div className="text-[10px] text-[#737871] font-mono">
                      Balance: {tx.balanceAfter} EMBER
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
