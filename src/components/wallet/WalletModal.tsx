import React from 'react';
import { UserEconomyState, EmberTransaction } from '../../types/ember';
import { EmberToken } from '../common/EmberToken';
import {
  X,
  History,
  TrendingUp,
  TrendingDown,
  Gift,
  Clock,
  Box,
  Coins,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WalletModalProps {
  economy: UserEconomyState;
  isOpen: boolean;
  onClose: () => void;
  onClaimDaily?: () => void;
  isDailyClaimAvailable?: boolean;
  dailyCountdown?: string;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  economy,
  isOpen,
  onClose,
  onClaimDaily,
  isDailyClaimAvailable = false,
  dailyCountdown,
}) => {
  if (!isOpen) return null;

  const totalEarned = economy.transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = economy.transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const getTransactionIcon = (type: EmberTransaction['type']) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#F97316] flex items-center justify-center font-bold">
              🔥
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#171916] dark:text-neutral-100">
                EMBER Vault & Transaction Ledger
              </h2>
              <p className="text-[11px] text-[#737871]">
                Campfire virtual campus currency & audit trail
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance & Stats Cards */}
        <div className="p-5 bg-[#FAF9F5] dark:bg-neutral-950/50 border-b border-[#E5E3DC] dark:border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 shadow-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#737871]">
                Active Balance
              </div>
              <div className="mt-1">
                <EmberToken amount={economy.emberBalance} size="xl" />
              </div>
            </div>

            {onClaimDaily && (
              <div>
                {isDailyClaimAvailable ? (
                  <button
                    onClick={onClaimDaily}
                    className="py-2.5 px-4 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Claim 5 EMBER Daily</span>
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      Daily Claim Cooldown
                    </span>
                    <div className="text-xs font-mono font-bold text-[#EA580C] mt-0.5">
                      Ready in {dailyCountdown || 'tomorrow'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ledger quick stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#737871] font-semibold">Total Embers Earned</div>
                <div className="text-sm font-extrabold font-mono text-emerald-600 mt-0.5">
                  +{totalEarned} EMBER
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#737871] font-semibold">Total Embers Spent</div>
                <div className="text-sm font-extrabold font-mono text-neutral-700 dark:text-neutral-300 mt-0.5">
                  -{totalSpent} EMBER
                </div>
              </div>
              <TrendingDown className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Transaction History List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#171916] dark:text-neutral-200">
            <span className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#F97316]" />
              <span>Transaction History ({economy.transactions.length})</span>
            </span>
            <span className="text-[10px] text-[#737871] font-normal">Audit Log</span>
          </div>

          {economy.transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#737871]">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {economy.transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                const formattedDate = new Date(tx.createdAt).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-neutral-800/60 border border-[#E5E3DC] dark:border-neutral-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-900 border border-[#E5E3DC] dark:border-neutral-700 flex items-center justify-center shrink-0">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-[#171916] dark:text-neutral-100 truncate">
                          {tx.reason}
                        </div>
                        <div className="text-[10px] text-[#737871] font-mono">
                          {formattedDate}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-extrabold ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {isPositive ? `+${tx.amount}` : tx.amount} EMBER
                      </div>
                      <div className="text-[9px] text-[#737871] font-mono">
                        Bal: {tx.balanceAfter}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E3DC] dark:border-neutral-800 bg-[#FAF9F5] dark:bg-neutral-950 flex items-center justify-between text-xs">
          <Link
            to="/crates"
            onClick={onClose}
            className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1"
          >
            <span>Spend Embers in Crate Shop</span>
            <Box className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white font-bold hover:bg-neutral-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
