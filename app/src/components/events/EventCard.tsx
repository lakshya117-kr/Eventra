import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, MapPin, Calendar as CalIcon } from 'lucide-react';
import { ParsedEvent } from '../../types';
import { TOKEN_DECIMALS } from '../../utils/constants';

interface EventCardProps {
  event: ParsedEvent;
  index: number;
}

export default function EventCard({ event, index }: EventCardProps) {
  const { account, metadata, publicKey } = event;
  const ticketsLeft = account.maxTicket - account.ticketSold;
  const soldOutPercent = (account.ticketSold / account.maxTicket) * 100;
  const price = account.ticketPrice / 10 ** TOKEN_DECIMALS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/events/${publicKey.toString()}`}
        className="block glass-card-hover overflow-hidden group"
      >
        {/* Image */}
        <div className="aspect-[16/9] bg-surface-3 overflow-hidden relative">
          {metadata?.image ? (
            <img
              src={metadata.image}
              alt={account.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-3 to-surface-4">
              <Ticket className="w-10 h-10 text-zinc-700" />
            </div>
          )}
          {/* Category badge */}
          {metadata?.category && (
            <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-surface-0/70 backdrop-blur-md rounded-full text-zinc-300 border border-surface-4/50">
              {metadata.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-base font-semibold text-zinc-100 mb-2 line-clamp-1 group-hover:text-accent-hover transition-colors">
            {account.name || metadata?.name || 'Untitled Event'}
          </h3>

          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
            {metadata?.date && (
              <span className="flex items-center gap-1">
                <CalIcon className="w-3 h-3" /> {metadata.date}
              </span>
            )}
            {metadata?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {metadata.location}
              </span>
            )}
          </div>

          {/* Price & Availability */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-zinc-100">{price} <span className="text-xs font-normal text-zinc-500">XTKN</span></p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium ${ticketsLeft === 0 ? 'text-danger' : ticketsLeft < 10 ? 'text-warning' : 'text-success'}`}>
                {ticketsLeft === 0 ? 'Sold Out' : `${ticketsLeft} left`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-surface-4 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-purple-400 transition-all duration-500"
              style={{ width: `${Math.min(soldOutPercent, 100)}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
