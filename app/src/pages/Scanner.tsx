import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Shield, CheckCircle2, XCircle, Loader2, QrCode, Lock, Fingerprint, Eye } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useVerifyCheckIn } from '../hooks/useVerifyCheckIn';

export default function Scanner() {
  const { verifyCheckIn, loading } = useVerifyCheckIn();
  const [eventKey, setEventKey] = useState('');
  const [ticketKey, setTicketKey] = useState('');
  const [commitmentHex, setCommitmentHex] = useState('');
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    try {
      await verifyCheckIn(new PublicKey(eventKey), new PublicKey(ticketKey), commitmentHex);
      setResult('success');
    } catch {
      setResult('error');
    }
  };

  return (
    <PageContainer title="Stadium Scanner" subtitle="ZK check-in verification simulation">
      <div className="max-w-lg mx-auto">
        {/* Visual Scanner Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-8 rounded-2xl bg-gradient-to-br from-accent/10 via-surface-2 to-purple-500/10 border border-accent/10 text-center"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.1)', '0 0 40px rgba(99,102,241,0.25)', '0 0 20px rgba(99,102,241,0.1)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4"
          >
            <Fingerprint className="w-8 h-8 text-accent" />
          </motion.div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-1">Zero-Knowledge Gate</h3>
          <p className="text-xs text-zinc-500">Verify ticket ownership without revealing the secret</p>
        </motion.div>

        {/* Scanner Form */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Verify Ticket</h3>
              <p className="text-xs text-zinc-500">Enter ticket details to verify ZK proof</p>
            </div>
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="label-text">Event Account (Public Key)</label>
              <input type="text" value={eventKey} onChange={(e) => setEventKey(e.target.value)}
                className="input-field font-mono text-xs" placeholder="Event pubkey..." />
            </div>
            <div>
              <label className="label-text">Ticket Record (Public Key)</label>
              <input type="text" value={ticketKey} onChange={(e) => setTicketKey(e.target.value)}
                className="input-field font-mono text-xs" placeholder="Ticket record pubkey..." />
            </div>
            <div>
              <label className="label-text">Commitment (hex)</label>
              <input type="text" value={commitmentHex} onChange={(e) => setCommitmentHex(e.target.value)}
                className="input-field font-mono text-xs" placeholder="Commitment hex from booking..." />
            </div>

            <button type="submit" disabled={loading || !eventKey || !ticketKey || !commitmentHex}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
              {loading ? 'Verifying...' : 'Verify Check-In'}
            </button>
          </form>
        </div>

        {/* ZK Flow Info */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-medium text-zinc-300">How ZK Verification Works</h4>
          </div>
          <div className="space-y-3">
            {[
              { icon: Lock, step: '1', text: 'Retrieve stored ticket secret from device' },
              { icon: Fingerprint, step: '2', text: 'Compute nullifier = SHA-256(secret ‖ event_key)' },
              { icon: Shield, step: '3', text: 'Generate Groth16 ZK proof locally' },
              { icon: ScanLine, step: '4', text: 'Submit verify_check_in on-chain' },
              { icon: Eye, step: '5', text: 'Nullifier registry prevents double-entry' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <item.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-accent transition-colors" />
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 rounded-2xl border flex items-center gap-4 ${
                result === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
              }`}>
              {result === 'success' ? (
                <>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-400">Entry Verified!</p>
                    <p className="text-xs text-zinc-400 mt-0.5">ZK proof valid. Welcome to the event.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-rose-400">Verification Failed</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Invalid proof or ticket already used.</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
