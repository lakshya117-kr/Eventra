import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles, Shield, Coins, Zap } from 'lucide-react';

interface WalletGateProps {
  children: React.ReactNode;
}

const features = [
  { icon: Shield, label: 'ZK Verified', desc: 'Groth16 proof check-in' },
  { icon: Coins, label: 'Token Economy', desc: 'Buy & sell XTKN tokens' },
  { icon: Zap, label: 'On-Chain', desc: 'Fully on Solana devnet' },
];

export default function WalletGate({ children }: WalletGateProps) {
  const { connected } = useWallet();

  return (
    <AnimatePresence mode="wait">
      {!connected ? (
        <motion.div
          key="gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0"
        >
          {/* Subtle animated gradient background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/3 rounded-full blur-3xl"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative text-center max-w-lg px-6"
          >
            {/* Logo with pulse glow */}
            <div className="mb-8 flex justify-center">
              <motion.div
                animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.15)', '0 0 40px rgba(99,102,241,0.3)', '0 0 20px rgba(99,102,241,0.15)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center"
              >
                <Ticket className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              <span className="gradient-text">Eventra</span>
            </h1>
            <p className="text-zinc-400 text-lg mb-2">
              Decentralized Event Ticketing
            </p>
            <p className="text-zinc-600 text-sm mb-8 max-w-sm mx-auto">
              Zero-knowledge proof verified tickets on Solana. Private, secure, unforgeable.
            </p>

            {/* Feature Pills */}
            <div className="flex items-center justify-center gap-3 mb-10">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2/60 border border-surface-4/50 backdrop-blur-sm"
                >
                  <f.icon className="w-3.5 h-3.5 text-accent" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-zinc-300">{f.label}</p>
                    <p className="text-[10px] text-zinc-600">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Connect Button */}
            <div className="flex justify-center mb-6">
              <WalletMultiButton />
            </div>

            <div className="flex items-center justify-center gap-2 text-zinc-600 text-xs">
              <Sparkles className="w-3 h-3" />
              <span>Supports Phantom & Solflare</span>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
