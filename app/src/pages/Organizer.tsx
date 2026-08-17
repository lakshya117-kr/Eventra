import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Shield, Building, Award, Plus, Copy, ExternalLink, Loader2, Calendar } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useOrganizer } from '../hooks/useOrganizer';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OrganizerDashboard() {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const { organizer, fetchOrganizer, registerOrganizer, loading } = useOrganizer();
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    fetchOrganizer();
  }, [fetchOrganizer]);

  if (!publicKey) {
    return (
      <PageContainer title="Organizer">
        <div className="text-center py-32">
          <p className="text-zinc-500">Please connect your wallet to access the Organizer Dashboard.</p>
        </div>
      </PageContainer>
    );
  }

  // Handle Registration
  if (!organizer) {
    return (
      <PageContainer title="Become an Organizer" subtitle="Create your organization profile to start hosting events.">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto glass-card p-8 text-center mt-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/20">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Register Organization</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Organizations can create events, mint NFT tickets, and earn reputation on the Solana blockchain.
          </p>

          <div className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Organization Name *</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Solana Foundation"
                className="input-field"
                maxLength={32}
              />
            </div>
            
            <button
              onClick={() => {
                if (!orgName.trim()) {
                  toast.error('Please enter an organization name');
                  return;
                }
                registerOrganizer(orgName);
              }}
              disabled={loading || !orgName.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Register Now
            </button>
          </div>
        </motion.div>
      </PageContainer>
    );
  }

  // Dashboard View
  const addr = publicKey.toString();

  return (
    <PageContainer title="Organizer Dashboard" subtitle="Manage your organization profile and view analytics.">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="h-24 bg-gradient-to-r from-accent/20 via-purple-500/15 to-pink-500/10 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded-2xl bg-surface-3 flex items-center justify-center border-4 border-surface-2 shadow-xl">
                <Building className="w-10 h-10 text-zinc-400" />
              </div>
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Verified Organizer</span>
            </div>
          </div>

          <div className="pt-14 px-6 pb-6">
            <h2 className="text-2xl font-bold text-zinc-100 mb-1">{organizer.name || 'Unnamed Organization'}</h2>
            
            <div className="flex items-center gap-2 mb-6">
              <p className="text-sm font-mono text-zinc-500 truncate max-w-[200px]">{addr}</p>
              <button 
                onClick={() => { navigator.clipboard.writeText(addr); toast.success('Address copied!'); }} 
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <a
                href={`https://explorer.solana.com/address/${addr}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-accent transition-colors ml-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-3/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-sm text-zinc-400">Reputation Score</p>
                </div>
                <p className="text-3xl font-bold text-zinc-100">{organizer.reputationScore}</p>
              </div>

              <div className="bg-surface-3/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sm text-zinc-400">Events Hosted</p>
                </div>
                <p className="text-3xl font-bold text-zinc-100">{organizer.totalEventHosted}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/create')}
            className="flex-1 glass-card p-6 flex flex-col items-center justify-center gap-3 hover:bg-surface-3/80 transition-colors group border-accent/20"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-accent" />
            </div>
            <p className="font-medium text-zinc-200">Host New Event</p>
          </button>
        </div>

      </div>
    </PageContainer>
  );
}
