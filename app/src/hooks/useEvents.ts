import { useState, useCallback } from 'react';
import { useProgram } from './useProgram';
import { ParsedEvent, EventMetadata } from '../types';
import { fetchMetadataFromIPFS, ipfsToHttp } from '../utils/pinata';

export function useEvents() {
  const { program } = useProgram();
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllEvents = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    try {
      const raw = await (program.account as any).event.all();
      const parsed: ParsedEvent[] = await Promise.all(
        raw.map(async (item: any) => {
          const account = item.account as any;
          let metadata: EventMetadata | undefined;
          
          if (account.eventMetadata) {
            try {
              const data = await fetchMetadataFromIPFS(account.eventMetadata);
              if (data) {
                metadata = {
                  name: data.name || account.name || 'Untitled',
                  description: data.description || '',
                  image: data.image ? ipfsToHttp(data.image) : '',
                  date: data.date,
                  location: data.location,
                  category: data.category,
                };
              }
            } catch {
              // Metadata fetch failed — use on-chain name
            }
          }
          
          return {
            publicKey: item.publicKey,
            account: {
              name: account.name || 'Untitled Event',
              organizer: account.organizer,
              eventId: Number(account.eventId),
              ticketPrice: Number(account.ticketPrice),
              maxTicket: Number(account.maxTicket),
              ticketSold: Number(account.ticketSold),
              eventMetadata: account.eventMetadata,
              bump: account.bump,
            },
            metadata,
          };
        })
      );
      setEvents(parsed);
    } catch (e) {
      console.error('Failed to fetch events:', e);
    } finally {
      setLoading(false);
    }
  }, [program]);

  return { events, fetchAllEvents, loading };
}
