import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Btn, Card, Field, PanelHeader, Spinner, Status, Table, Th, Td, TextInput, Toolbar } from './ui';
import { RestaurantPicker } from './RestaurantPicker';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Copenhagen', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function plusDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
function dayList(from: string, to: string): Array<{ date: string; dow: string }> {
  const out: Array<{ date: string; dow: string }> = [];
  if (!from || !to || from > to) return out;
  let cur = from;
  let guard = 0;
  while (cur <= to && guard < 400) {
    const [y, m, d] = cur.split('-').map(Number);
    out.push({ date: cur, dow: DOW[new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay()] });
    cur = plusDaysISO(cur, 1);
    guard++;
  }
  return out;
}

export function TargetsPanel() {
  const qc = useQueryClient();
  const [slug, setSlug] = useState('');
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(plusDaysISO(todayISO(), 30));
  const [edits, setEdits] = useState<Record<string, { revenue?: string; notes?: string }>>({});
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['admin', 'targets', slug, from, to],
    enabled: !!slug && !!from && !!to && from <= to,
    queryFn: () => adminApi.listTargets(slug, from, to),
  });

  const loaded = useMemo(() => {
    const m: Record<string, { revenue: string; notes: string }> = {};
    for (const r of data ?? []) {
      m[r.business_date] = {
        revenue: r.target_revenue == null ? '' : String(r.target_revenue),
        notes: r.notes ?? '',
      };
    }
    return m;
  }, [data]);

  const days = useMemo(() => dayList(from, to), [from, to]);

  const revOf = (d: string) => edits[d]?.revenue ?? loaded[d]?.revenue ?? '';
  const noteOf = (d: string) => edits[d]?.notes ?? loaded[d]?.notes ?? '';
  const isDirty = (d: string) => {
    const e = edits[d]; if (!e) return false;
    const baseR = loaded[d]?.revenue ?? '';
    const baseN = loaded[d]?.notes ?? '';
    return (e.revenue !== undefined && e.revenue !== baseR) || (e.notes !== undefined && e.notes !== baseN);
  };
  const dirtyDates = days.map(d => d.date).filter(isDirty);

  const setRev = (d: string, v: string) => setEdits(p => ({ ...p, [d]: { ...p[d], revenue: v } }));
  const setNote = (d: string, v: string) => setEdits(p => ({ ...p, [d]: { ...p[d], notes: v } }));

  const save = useMutation({
    mutationFn: () => {
      const targets = dirtyDates
        .map(d => ({ business_date: d, target_revenue: parseFloat(revOf(d)), notes: noteOf(d) }))
        .filter(t => !Number.isNaN(t.target_revenue) && t.target_revenue >= 0);
      if (targets.length === 0) return Promise.reject(new Error('Nothing to save (blank revenue rows are skipped).'));
      return adminApi.saveTargets(slug, targets);
    },
    onSuccess: (r) => {
      setMsg({ kind: 'ok', text: `Saved ${r.upserted} row(s).` });
      setEdits({});
      qc.invalidateQueries({ queryKey: ['admin', 'targets', slug, from, to] });
    },
    onError: (e) => setMsg({ kind: 'error', text: (e as Error).message }),
  });

  return (
    <div>
      <PanelHeader title="Daily targets" subtitle="Set a revenue target per day. Blank rows are ignored." />
      <Toolbar>
        <RestaurantPicker value={slug} onChange={setSlug} />
        <Field label="From"><TextInput type="date" value={from} onChange={e => setFrom(e.target.value)} /></Field>
        <Field label="To"><TextInput type="date" value={to} onChange={e => setTo(e.target.value)} /></Field>
      </Toolbar>

      {msg && <Status kind={msg.kind}>{msg.text}</Status>}
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}

      {!isLoading && slug && (
        <>
          <Card className="p-1">
            <Table>
              <thead><tr><Th>Date</Th><Th>Day</Th><Th>Target revenue (DKK)</Th><Th>Notes</Th></tr></thead>
              <tbody>
                {days.map(({ date, dow }) => (
                  <tr key={date} className={isDirty(date) ? 'bg-[rgba(88,166,255,0.05)]' : ''}>
                    <Td className="font-mono text-[12px]">{date}</Td>
                    <Td className="text-[var(--text-muted)]">{dow}</Td>
                    <Td>
                      <TextInput type="number" step="0.01" min="0" value={revOf(date)}
                        onChange={e => setRev(date, e.target.value)} className="w-36" placeholder="—" />
                    </Td>
                    <Td>
                      <TextInput value={noteOf(date)} onChange={e => setNote(date, e.target.value)}
                        className="w-full min-w-[160px]" placeholder="optional" />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <div className="sticky bottom-0 mt-4 py-3 flex items-center gap-3"
               style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <Btn disabled={dirtyDates.length === 0 || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? 'Saving…' : `Save (${dirtyDates.length})`}
            </Btn>
            {isFetching && <span className="text-[12px] text-[var(--text-muted)]">refreshing…</span>}
          </div>
        </>
      )}
    </div>
  );
}
