import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ImageIcon } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useOrganizer } from '../hooks/useOrganizer';
import { uploadFileToPinata, uploadMetadataToPinata } from '../utils/pinata';
import { TOKEN_DECIMALS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { organizer, fetchOrganizer, registerOrganizer, createEvent, loading } = useOrganizer();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: '', description: '', ticketPrice: '', maxTickets: '', date: '', location: '', category: '' });

  useEffect(() => { fetchOrganizer(); }, [fetchOrganizer]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.ticketPrice || !form.maxTickets) { toast.error('Fill required fields'); return; }
    try {
      setUploading(true);
      let imageCid = '';
      if (imageFile) imageCid = await uploadFileToPinata(imageFile);
      const metadataCid = await uploadMetadataToPinata({
        name: form.name, description: form.description,
        image: imageCid ? `ipfs://${imageCid}` : '',
        date: form.date, location: form.location, category: form.category,
      });
      setUploading(false);
      const priceInSmallestUnit = Math.floor(parseFloat(form.ticketPrice) * 10 ** TOKEN_DECIMALS);
      await createEvent(priceInSmallestUnit, parseInt(form.maxTickets), metadataCid, form.name);
      navigate('/events');
    } catch (error: any) { 
      toast.error(error.message || 'Failed to upload event data');
      setUploading(false); 
    }
  };

  return (
    <PageContainer title="Create Event" subtitle="Set up a new event as an organizer">
      {!organizer ? (
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">Register as Organizer</h3>
          <p className="text-sm text-zinc-500 mb-6">You need to register an organization profile before creating events.</p>
          <button onClick={() => navigate('/organizer')} className="btn-primary mx-auto flex items-center gap-2">
            Go to Organizer Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div>
            <label className="label-text">Event Image</label>
            <label className="block cursor-pointer">
              <div className="glass-card overflow-hidden aspect-[2/1] flex items-center justify-center hover:border-accent/30 transition-colors">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  : <div className="text-center"><ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" /><p className="text-sm text-zinc-500">Click to upload</p></div>}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <div>
            <label className="label-text">Event Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Solana Hackathon" maxLength={50} />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input-field resize-none h-24" placeholder="Describe your event..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-text">Price (XTKN) *</label><input type="number" step="0.01" min="0" value={form.ticketPrice} onChange={(e) => setForm({...form, ticketPrice: e.target.value})} className="input-field" placeholder="10.00" /></div>
            <div><label className="label-text">Max Tickets *</label><input type="number" min="1" value={form.maxTickets} onChange={(e) => setForm({...form, maxTickets: e.target.value})} className="input-field" placeholder="100" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-text">Date</label><input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input-field" /></div>
            <div><label className="label-text">Location</label><input type="text" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="input-field" placeholder="Virtual / City" /></div>
          </div>
          <div>
            <label className="label-text">Category</label>
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input-field">
              <option value="">Select</option><option value="Hackathon">Hackathon</option><option value="Conference">Conference</option>
              <option value="Concert">Concert</option><option value="Workshop">Workshop</option><option value="Meetup">Meetup</option>
            </select>
          </div>
          <button type="submit" disabled={loading || uploading} className="btn-primary w-full flex items-center justify-center gap-2">
            {(loading || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? 'Uploading to IPFS...' : loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      )}
    </PageContainer>
  );
}
