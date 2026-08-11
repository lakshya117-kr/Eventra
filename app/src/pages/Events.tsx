import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import PageContainer from '../components/layout/PageContainer';
import EventGrid from '../components/events/EventGrid';
import { useEvents } from '../hooks/useEvents';
import { ParsedEvent } from '../types';
import { PublicKey } from '@solana/web3.js';

// Demo events for when chain has no events yet
const DEMO_EVENTS: ParsedEvent[] = [
  {
    publicKey: PublicKey.default,
    account: { name: 'Solana Hacker House NYC', organizer: PublicKey.default, eventId: 1, ticketPrice: 500000, maxTicket: 200, ticketSold: 147, eventMetadata: '', bump: 0 },
    metadata: { name: 'Solana Hacker House NYC', description: 'Three-day hacking sprint in Manhattan', image: '', date: '2026-09-15', location: 'New York, USA', category: 'Hackathon' },
  },
  {
    publicKey: PublicKey.default,
    account: { name: 'DeFi Summit Berlin', organizer: PublicKey.default, eventId: 2, ticketPrice: 1000000, maxTicket: 500, ticketSold: 312, eventMetadata: '', bump: 0 },
    metadata: { name: 'DeFi Summit Berlin', description: 'Europe\'s largest decentralized finance conference', image: '', date: '2026-10-01', location: 'Berlin, Germany', category: 'Conference' },
  },
  {
    publicKey: PublicKey.default,
    account: { name: 'Web3 Music Festival', organizer: PublicKey.default, eventId: 3, ticketPrice: 2000000, maxTicket: 1000, ticketSold: 1000, eventMetadata: '', bump: 0 },
    metadata: { name: 'Web3 Music Festival', description: 'Live music meets NFT art installations', image: '', date: '2026-11-20', location: 'Austin, TX', category: 'Concert' },
  },
  {
    publicKey: PublicKey.default,
    account: { name: 'ZK Proofs Workshop', organizer: PublicKey.default, eventId: 4, ticketPrice: 250000, maxTicket: 50, ticketSold: 23, eventMetadata: '', bump: 0 },
    metadata: { name: 'ZK Proofs Workshop', description: 'Hands-on introduction to zero-knowledge proof systems', image: '', date: '2026-09-28', location: 'Virtual', category: 'Workshop' },
  },
  {
    publicKey: PublicKey.default,
    account: { name: 'Solana Validators Meetup', organizer: PublicKey.default, eventId: 5, ticketPrice: 100000, maxTicket: 80, ticketSold: 45, eventMetadata: '', bump: 0 },
    metadata: { name: 'Solana Validators Meetup', description: 'Monthly meetup for Solana node operators', image: '', date: '2026-09-05', location: 'San Francisco, CA', category: 'Meetup' },
  },
  {
    publicKey: PublicKey.default,
    account: { name: 'Blockchain Sports League', organizer: PublicKey.default, eventId: 6, ticketPrice: 750000, maxTicket: 300, ticketSold: 189, eventMetadata: '', bump: 0 },
    metadata: { name: 'Blockchain Sports League', description: 'Tokenized sports event with on-chain ticketing', image: '', date: '2026-12-10', location: 'Miami, FL', category: 'Sports' },
  },
];

const categories = ['All', 'Hackathon', 'Conference', 'Concert', 'Workshop', 'Meetup', 'Sports'];

export default function Events() {
  const { events, fetchAllEvents, loading } = useEvents();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // Use real events if available, else show demo
  const displayEvents = events.length > 0 ? events : DEMO_EVENTS;
  const isDemo = events.length === 0 && !loading;

  const filtered = displayEvents.filter((e) => {
    const name = (e.account.name || e.metadata?.name || '').toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || e.metadata?.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <PageContainer
      title="Events"
      subtitle="Discover and book tickets for on-chain events"
      action={
        <Link to="/create-event" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Create Event</span>
        </Link>
      }
    >
      {/* Demo Banner */}
      {isDemo && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-xs text-amber-300/80">
            <span className="font-medium">Demo Mode</span> — Showing sample events. Deploy your contract and create real events to replace these.
          </p>
        </motion.div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'bg-surface-2 text-zinc-500 border border-surface-4 hover:text-zinc-300 hover:border-surface-4'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <EventGrid events={filtered} loading={loading} />
    </PageContainer>
  );
}
