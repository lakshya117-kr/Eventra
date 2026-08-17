import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Toaster } from 'react-hot-toast';
import { RPC_ENDPOINT } from './utils/constants';
import WalletGate from './components/wallet/WalletGate';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import OrganizerDashboard from './pages/Organizer';
import Profile from './pages/Profile';
import Scanner from './pages/Scanner';
import ErrorBoundary from './components/ErrorBoundary';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#18181b',
                  color: '#fafafa',
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
              }}
            />
            <WalletGate>
              <ErrorBoundary>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:eventKey" element={<EventDetail />} />
                    <Route path="/create-event" element={<CreateEvent />} />
                    <Route path="/organizer" element={<OrganizerDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/scanner" element={<Scanner />} />
                  </Routes>
                </main>
                <footer className="border-t border-surface-4/30 py-6 mt-auto">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-zinc-600">
                      Built on <span className="text-zinc-500">Solana</span> · Powered by <span className="text-zinc-500">Zero-Knowledge Proofs</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 border border-surface-4 text-zinc-500">Groth16</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 border border-surface-4 text-zinc-500">Anchor 0.30</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 border border-surface-4 text-zinc-500">Devnet</span>
                    </div>
                  </div>
                </footer>
              </div>
              </ErrorBoundary>
            </WalletGate>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
