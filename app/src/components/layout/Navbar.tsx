import { NavLink } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Ticket, LayoutDashboard, Calendar, PlusCircle, User, ScanLine } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/organizer', label: 'Organizer', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/scanner', label: 'Scanner', icon: ScanLine },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-4/50 bg-surface-0/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight gradient-text hidden sm:block">
            Eventra
          </span>
        </NavLink>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-zinc-100 bg-surface-3'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface-2'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Wallet */}
        <div className="flex items-center">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
