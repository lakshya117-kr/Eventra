import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Coins, Wallet, Zap, Shield, Calendar, ScanLine, PlusCircle, ArrowRight } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import TokenPanel from '../components/tokens/TokenPanel';
import { useTokenEconomy } from '../hooks/useTokenEconomy';

const quickLinks = [
  { to: '/events', icon: Calendar, label: 'Browse Events', desc: 'Discover on-chain events', color: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20' },
  { to: '/create-event', icon: PlusCircle, label: 'Create Event', desc: 'Host your own event', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20' },
  { to: '/scanner', icon: ScanLine, label: 'ZK Scanner', desc: 'Verify ticket check-in', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20' },
];

export default function Dashboard() {
  const { publicKey } = useWallet();
  const { buyTokens, sellTokens, refreshBalances, tokenBalance, solBalance, loading } = useTokenEconomy();

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  const stats = [
    { label: 'SOL Balance', value: `${solBalance.toFixed(4)}`, icon: Wallet, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'XTKN Balance', value: `${tokenBalance.toFixed(2)}`, icon: Coins, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Network', value: 'Devnet', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'ZK Proofs', value: 'Groth16', icon: Shield, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <PageContainer title="Dashboard" subtitle="Token economy overview and management">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-xs text-zinc-500 font-medium">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-zinc-100">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Wallet Address */}
      <div className="glass-card p-4 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500">Connected Wallet</p>
          <p className="text-sm font-mono text-zinc-300 truncate">
            {publicKey?.toString()}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Token Economy Panels */}
      <h2 className="text-base font-semibold text-zinc-200 mb-4">Token Economy</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <TokenPanel
          mode="buy"
          onSubmit={buyTokens}
          loading={loading}
          tokenBalance={tokenBalance}
          solBalance={solBalance}
        />
        <TokenPanel
          mode="sell"
          onSubmit={sellTokens}
          loading={loading}
          tokenBalance={tokenBalance}
          solBalance={solBalance}
        />
      </div>

      {/* Quick Links */}
      <h2 className="text-base font-semibold text-zinc-200 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map((link, i) => (
          <motion.div
            key={link.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Link
              to={link.to}
              className={`block p-5 rounded-2xl bg-gradient-to-br ${link.color} border backdrop-blur-sm hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between mb-3">
                <link.icon className="w-5 h-5 text-zinc-300" />
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm font-medium text-zinc-200">{link.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{link.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
}
