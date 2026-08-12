import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowDownUp, TrendingUp, TrendingDown } from 'lucide-react';

interface TokenPanelProps {
  mode: 'buy' | 'sell';
  onSubmit: (amount: number) => Promise<any>;
  loading: boolean;
  tokenBalance: number;
  solBalance: number;
}

export default function TokenPanel({ mode, onSubmit, loading, tokenBalance, solBalance }: TokenPanelProps) {
  const [amount, setAmount] = useState('1');
  const isBuy = mode === 'buy';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(amount);
    if (val <= 0 || isNaN(val)) return;
    await onSubmit(val);
    setAmount('1');
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBuy ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
          {isBuy ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-100">
            {isBuy ? 'Buy Tokens' : 'Sell Tokens'}
          </h3>
          <p className="text-xs text-zinc-500">
            {isBuy ? 'SOL → XTKN' : 'XTKN → SOL (burn)'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text">Amount (units)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            placeholder="1"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
          <span>Balance: {isBuy ? `${solBalance.toFixed(4)} SOL` : `${tokenBalance.toFixed(0)} XTKN Units`}</span>
          <ArrowDownUp className="w-3 h-3" />
        </div>

        <button
          type="submit"
          disabled={loading || !amount || parseInt(amount) <= 0}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            isBuy
              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
          }`}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isBuy ? 'Buy Tokens' : 'Sell & Burn'}
        </button>
      </form>
    </div>
  );
}
