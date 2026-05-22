import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useClosingNote } from '../hooks/useClosingNote';
import { supabase } from '../lib/supabase';

type Props = {
  restaurantId: string;
  businessDate: string;
  isToday: boolean;
  authorId: string;
  authorName: string;
};

function fmtShort(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(new Date(y, m - 1, d));
}

export function ClosingNoteCard({ restaurantId, businessDate, isToday, authorId, authorName }: Props) {
  const qc = useQueryClient();
  const { data } = useClosingNote(restaurantId, businessDate);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!body.trim()) return;
    setBusy(true); setErr(null);
    const { error } = await supabase.from('closing_notes').insert({
      restaurant_id: restaurantId,
      business_date: businessDate,
      author_id: authorId,
      author_name: authorName,
      body: body.trim(),
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
    } else {
      setBody('');
      qc.invalidateQueries({ queryKey: ['closingNote', restaurantId, businessDate] });
    }
  }

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold py-0.5 px-2 rounded bg-[rgba(88,166,255,0.12)] text-[var(--accent)] border border-[rgba(88,166,255,0.25)]">
          Closing note
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">{fmtShort(businessDate)}</span>
      </div>

      {data ? (
        <>
          <div className="text-sm leading-relaxed italic text-[var(--text)] py-3 px-3.5 bg-[var(--panel-2)] rounded-r-lg border-l-[3px] border-[var(--accent)]">
            {data.body}
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] text-right">— {data.author_name}</div>
        </>
      ) : isToday ? (
        <div className="space-y-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="How did tonight go?"
            rows={4}
            className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] resize-vertical"
          />
          {err && <div className="text-xs text-rose-400">{err}</div>}
          <button
            onClick={submit}
            disabled={busy || !body.trim()}
            className="w-full bg-[var(--accent)] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Submitting…' : 'Submit closing note'}
          </button>
        </div>
      ) : (
        <div className="p-3.5 bg-[rgba(255,140,66,0.08)] border border-dashed border-[rgba(255,140,66,0.3)] rounded text-[var(--orange)] text-[13px] text-center">
          No closing note submitted for this day
        </div>
      )}
    </div>
  );
}
