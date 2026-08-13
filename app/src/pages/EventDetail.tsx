import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { ArrowLeft, Ticket, MapPin, Calendar, User, Loader2, CheckCircle2, Shield, Copy } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useProgram } from '../hooks/useProgram';
import { useBookTicket } from '../hooks/useBookTicket';
import { fetchMetadataFromIPFS, ipfsToHttp } from '../utils/pinata';
import { TOKEN_DECIMALS } from '../utils/constants';
import { EventAccount, EventMetadata } from '../types';

export default function EventDetail() {
  const { eventKey } = useParams<{ eventKey: string }>();
  const navigate = useNavigate();
  const { program } = useProgram();
  const { bookTicket, loading: bookLoading } = useBookTicket();

  const [event, setEvent] = useState<EventAccount | null>(null);
  const [metadata, setMetadata] = useState<EventMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    async function load() {
      if (!program || !eventKey) return;
      try {
        const pubkey = new PublicKey(eventKey);
        const account = await (program.account as any).event.fetch(pubkey);
        const evt: EventAccount = {
          name: (account as any).name || 'Untitled',
          organizer: (account as any).organizer,
          eventId: Number((account as any).eventId),
          ticketPrice: Number((account as any).ticketPrice),
          maxTicket: Number((account as any).maxTicket),
          ticketSold: Number((account as any).ticketSold),
          eventMetadata: (account as any).eventMetadata,
          bump: (account as any).bump,
        };
        setEvent(evt);

        if (evt.eventMetadata) {
          const data = await fetchMetadataFromIPFS(evt.eventMetadata);
          if (data) {
            setMetadata({
              name: data.name || evt.name,
              description: data.description || '',
              image: data.image ? ipfsToHttp(data.image) : '',
              date: data.date,
              location: data.location,
              category: data.category,
            });
          }
        }
      } catch (e) {
        console.error('Failed to load event:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [program, eventKey]);

  const [bookedDetails, setBookedDetails] = useState<{ commitment: string; ticketRecord: string } | null>(null);

  const handleBook = async () => {
    if (!event || !eventKey) return;
    try {
      const result = await bookTicket(new PublicKey(eventKey), event.organizer, event.ticketPrice);
      if (result) {
        setBooked(true);
        setBookedDetails({
          commitment: result.commitment,
          ticketRecord: result.ticketRecord.toString()
        });
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-32">
        <p className="text-zinc-500">Event not found.</p>
      </div>
    );
  }

  const price = event.ticketPrice / 10 ** TOKEN_DECIMALS;
  const ticketsLeft = event.maxTicket - event.ticketSold;
  const soldPct = (event.ticketSold / event.maxTicket) * 100;

  return (
    <PageContainer
      title=""
      action={
        <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Image & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="aspect-[2/1] rounded-2xl overflow-hidden bg-surface-2">
            {metadata?.image ? (
              <img src={metadata.image} alt={event.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-3 to-surface-4">
                <Ticket className="w-16 h-16 text-zinc-700" />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-3">{event.name}</h1>
            {metadata?.description && (
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">{metadata.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
              {metadata?.date && (
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {metadata.date}</span>
              )}
              {metadata?.location && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {metadata.location}</span>
              )}
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {event.organizer.toString().slice(0, 4)}...{event.organizer.toString().slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Booking Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 sticky top-24 space-y-5"
          >
            <div>
              <p className="text-xs text-zinc-500 mb-1">Ticket Price</p>
              <p className="text-3xl font-bold text-zinc-100">{price} <span className="text-base font-normal text-zinc-500">XTKN</span></p>
            </div>

            {/* Availability */}
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-2">
                <span>{event.ticketSold} / {event.maxTicket} sold</span>
                <span className={ticketsLeft === 0 ? 'text-danger' : 'text-success'}>{ticketsLeft} left</span>
              </div>
              <div className="h-2 bg-surface-4 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-purple-400 transition-all duration-700"
                  style={{ width: `${soldPct}%` }}
                />
              </div>
            </div>

            {/* ZK Info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/10 rounded-xl">
              <Shield className="w-4 h-4 text-accent" />
              <p className="text-xs text-zinc-400">ZK commitment will be generated locally for your ticket</p>
            </div>

            {/* Book Button */}
            {booked && bookedDetails ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium text-sm">Ticket Booked!</span>
                </div>
                
                <div className="p-3 bg-surface-3 rounded-lg border border-white/5 space-y-3">
                  <p className="text-xs text-zinc-400 mb-2">Save these for the Scanner Demo:</p>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Event Account</span>
                      <button onClick={() => navigator.clipboard.writeText(eventKey || '')} className="text-zinc-500 hover:text-accent transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <code className="block text-xs text-zinc-300 truncate bg-surface-2 p-1.5 rounded">{eventKey}</code>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Ticket Record</span>
                      <button onClick={() => navigator.clipboard.writeText(bookedDetails.ticketRecord)} className="text-zinc-500 hover:text-accent transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <code className="block text-xs text-zinc-300 truncate bg-surface-2 p-1.5 rounded">{bookedDetails.ticketRecord}</code>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">Commitment (Hex)</span>
                      <button onClick={() => navigator.clipboard.writeText(bookedDetails.commitment)} className="text-zinc-500 hover:text-accent transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <code className="block text-xs text-zinc-300 truncate bg-surface-2 p-1.5 rounded">{bookedDetails.commitment}</code>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleBook}
                disabled={bookLoading || ticketsLeft === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {bookLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {ticketsLeft === 0 ? 'Sold Out' : 'Book Ticket'}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
