import { ParsedEvent } from '../../types';
import EventCard from './EventCard';
import { Loader2 } from 'lucide-react';

interface EventGridProps {
  events: ParsedEvent[];
  loading: boolean;
}

export default function EventGrid({ events, loading }: EventGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 text-sm">No events found.</p>
        <p className="text-zinc-600 text-xs mt-1">Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event, i) => (
        <EventCard key={event.publicKey.toString()} event={event} index={i} />
      ))}
    </div>
  );
}
