import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { User, Award, Coins, Copy, CheckCircle2, Loader2, Ticket, Shield, ExternalLink, Sparkles, Image as ImageIcon } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useProfile } from '../hooks/useProfile';
import { useTokenEconomy } from '../hooks/useTokenEconomy';
import toast from 'react-hot-toast';

interface StoredNft {
  mint: string;
  eventKey: string;
  eventName: string;
  bookedAt: string;
}

export default function Profile() {
  const { publicKey } = useWallet();
  const { profile, fetchProfile, createProfile, loading } = useProfile();
  const { tokenBalance, solBalance, refreshBalances } = useTokenEconomy();

  useEffect(() => { fetchProfile(); refreshBalances(); }, [fetchProfile, refreshBalances]);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      toast.success('Address copied!');
    }
  };

  const addr = publicKey?.toString() || '';

  // Check for stored tickets in localStorage
  const storedTickets = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem('zk_tickets') || '{}');
      return Object.keys(raw).map((key) => {
        const [eventKey, commitment] = key.split('_');
        return { eventKey, commitment: commitment?.slice(0, 16) + '...' };
      });
    } catch { return []; }
  })();

  // Get stored NFTs from localStorage
  const [storedNfts] = useState<StoredNft[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nft_mints') || '[]');
    } catch { return []; }
  });

  return (
    <PageContainer title="Profile" subtitle="Your account and loyalty information">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Gradient Header */}
          <div className="h-20 bg-gradient-to-r from-accent/20 via-purple-500/15 to-pink-500/10 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center border-4 border-surface-2 shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="pt-12 px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-500 mb-0.5">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-zinc-300 truncate">{addr}</p>
                  <button onClick={copyAddress} className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <a
                href={`https://explorer.solana.com/address/${addr}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-1.5 text-xs shrink-0"
              >
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-3/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Coins className="w-3 h-3 text-purple-400" />
                  </div>
                  <p className="text-xs text-zinc-500">SOL</p>
                </div>
                <p className="text-lg font-bold text-zinc-100">{solBalance.toFixed(4)}</p>
              </div>
              <div className="bg-surface-3/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Coins className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-xs text-zinc-500">XTKN</p>
                </div>
                <p className="text-lg font-bold text-zinc-100">{tokenBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Customer Profile Card */}
        {profile ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h3 className="text-base font-semibold text-zinc-100">Customer Profile</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-3/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-zinc-500">Loyalty Points</p>
                </div>
                <p className="text-2xl font-bold text-zinc-100">{profile.loyalityPoints}</p>
              </div>
              <div className="bg-surface-3/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-4 h-4 text-accent" />
                  <p className="text-xs text-zinc-500">ZK Tickets</p>
                </div>
                <p className="text-2xl font-bold text-zinc-100">{storedTickets.length}</p>
              </div>
              <div className="bg-surface-3/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-zinc-500">NFTs</p>
                </div>
                <p className="text-2xl font-bold text-zinc-100">{storedNfts.length}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">No Profile Yet</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-xs mx-auto">
              Create your customer profile to start earning loyalty points and booking tickets.
            </p>
            <button onClick={createProfile} disabled={loading} className="btn-primary mx-auto flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create Profile
            </button>
          </motion.div>
        )}

        {/* My NFTs */}
        {storedNfts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-semibold text-zinc-100">My Ticket NFTs</h3>
              <span className="ml-auto text-xs text-zinc-500">{storedNfts.length} collected</span>
            </div>
            <div className="space-y-3">
              {storedNfts.map((nft, i) => (
                <motion.div
                  key={nft.mint}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500/5 via-surface-3/50 to-pink-500/5 rounded-xl border border-purple-500/10 hover:border-purple-500/25 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{nft.eventName} Ticket</p>
                    <p className="text-[10px] font-mono text-zinc-500 truncate">
                      {nft.mint.slice(0, 8)}...{nft.mint.slice(-8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(nft.mint);
                        toast.success('NFT address copied!');
                      }}
                      className="text-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${nft.mint}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-purple-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* My Tickets */}
        {storedTickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-4 h-4 text-accent" />
              <h3 className="text-base font-semibold text-zinc-100">My Tickets</h3>
            </div>
            <div className="space-y-2">
              {storedTickets.map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-surface-3/50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-zinc-400 truncate">Event: {t.eventKey?.slice(0, 8)}...{t.eventKey?.slice(-4)}</p>
                    <p className="text-[10px] font-mono text-zinc-600 truncate">Commitment: {t.commitment}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
