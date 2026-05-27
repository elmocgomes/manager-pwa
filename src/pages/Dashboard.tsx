import { useEffect, useMemo, useState } from 'react';
import { useUserProfile } from '../contexts/ProfileContext';
import { useDaySummary } from '../hooks/useDaySummary';
import { useRealtimeInvalidation } from '../hooks/useRealtimeInvalidation';
import { UserStrip } from '../components/UserStrip';
import { Header } from '../components/Header';
import { LoadingBar } from '../components/LoadingBar';
import { InstallBanner } from '../components/InstallBanner';
import { RestaurantToggle } from '../components/RestaurantToggle';
import { DayToggle } from '../components/DayToggle';
import { RestaurantLine } from '../components/RestaurantLine';
import { TotalsCard } from '../components/TotalsCard';
import { BookingsCard } from '../components/BookingsCard';
import { SplitCard } from '../components/SplitCard';
import { LaborCard } from '../components/LaborCard';
import { IncomingNoteCard } from '../components/IncomingNoteCard';
import { ClosingNoteCard } from '../components/ClosingNoteCard';

const VERSION = 'v1.0';

function readParams(): { r: string | null; d: 0 | 1 | 2 } {
  const params = new URLSearchParams(window.location.search);
  const r = params.get('r');
  const dNum = parseInt(params.get('d') ?? '0', 10);
  const d = (dNum === 1 || dNum === 2 ? dNum : 0) as 0 | 1 | 2;
  return { r, d };
}

function writeParams(r: string, d: 0 | 1 | 2) {
  const params = new URLSearchParams(window.location.search);
  params.set('r', r);
  params.set('d', String(d));
  const next = `${window.location.pathname}?${params.toString()}`;
  if (next !== window.location.pathname + window.location.search) {
    window.history.replaceState(null, '', next);
  }
}

// The restaurants are in Denmark and the data's business_date is
// Copenhagen-based, so "today/yesterday" must be computed in Copenhagen time —
// not the viewer's browser timezone (which would drift around midnight).
const RESTAURANT_TZ = 'Europe/Copenhagen';

function copenhagenToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: RESTAURANT_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function isoDate(offset: 0 | 1 | 2): string {
  const [y, m, d] = copenhagenToday().split('-').map(Number);
  // Anchor at UTC noon so day arithmetic never crosses a timezone boundary.
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  dt.setUTCDate(dt.getUTCDate() - offset);
  return dt.toISOString().slice(0, 10);
}

function dateFromOffset(offset: 0 | 1 | 2): Date {
  const [y, m, d] = isoDate(offset).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)); // noon-UTC anchor → stable calendar date
}

export function Dashboard() {
  const profile = useUserProfile();
  const [{ r: initialR, d: initialD }] = useState(readParams);

  // Resolve the selected restaurant slug — default to first assigned if URL missing/invalid
  const validSlugs = useMemo(() => new Set(profile.restaurants.map(x => x.slug)), [profile.restaurants]);
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    if (initialR && validSlugs.has(initialR)) return initialR;
    return profile.restaurants[0]?.slug ?? '';
  });
  const [day, setDay] = useState<0 | 1 | 2>(initialD);

  useEffect(() => { if (selectedSlug) writeParams(selectedSlug, day); }, [selectedSlug, day]);

  const restaurant = profile.restaurants.find(x => x.slug === selectedSlug);
  const businessDate = isoDate(day);
  const isToday = day === 0;
  const { data: summary, isPending, isFetching } = useDaySummary(restaurant?.id, businessDate, isToday);
  useRealtimeInvalidation(restaurant?.id, isToday);

  if (!restaurant) {
    return (
      <div className="p-6 text-center text-[var(--text-muted)]">
        No restaurants assigned to your account.
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto border-l border-r border-[var(--border)] min-h-screen">
      <div className="px-5 pb-8" style={{ paddingTop: 'env(safe-area-inset-top, 24px)' }}>
        <InstallBanner />
        <UserStrip fullName={profile.full_name} version={VERSION} />
        <Header live={isToday} lastSyncedAt={summary?.last_synced_at} />
        <RestaurantToggle
          restaurants={profile.restaurants}
          selected={selectedSlug}
          onSelect={setSelectedSlug}
        />
        <DayToggle selected={day} onSelect={setDay} />
        <RestaurantLine name={restaurant.name} date={dateFromOffset(day)} />

        {/* Fixed-height slot so layout doesn't jump when the bar appears */}
        <div className="h-[3px] mt-3">{isFetching && <LoadingBar />}</div>

        {/* Dim the metric cards while the first load is in flight so the
            zeroed placeholders don't read as "no data". */}
        <div className={`transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.18em] mt-3.5 mb-1.5 ml-1">
          {day === 0 ? 'Today' : day === 1 ? 'Yesterday' : 'Two days ago'}
        </div>
        <section className="mb-3">
          <TotalsCard
            totalRevenue={summary?.total_revenue ?? 0}
            totalGuests={summary?.total_guests ?? 0}
            isToday={isToday}
          />
        </section>

        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.18em] mt-3.5 mb-1.5 ml-1">
          Bookings vs walk-ins
        </div>
        <section className="mb-3">
          <BookingsCard
            bookingsServed={summary?.bookings_guests_served ?? 0}
            walkinsServed={summary?.walkins_guests_served ?? 0}
            bookingsToCome={summary?.bookings_to_come ?? 0}
            isToday={isToday}
          />
        </section>

        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.18em] mt-3.5 mb-1.5 ml-1">
          Drinks vs Dining
        </div>
        <section className="mb-3">
          <SplitCard
            totalRevenue={summary?.total_revenue ?? 0}
            drinksRevenue={summary?.drinks_revenue ?? 0}
            drinksGuests={summary?.drinks_guests ?? 0}
            drinksAvg={summary?.drinks_avg ?? 0}
            diningRevenue={summary?.dining_revenue ?? 0}
            diningGuests={summary?.dining_guests ?? 0}
            diningAvg={summary?.dining_avg ?? 0}
          />
        </section>

        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.18em] mt-3.5 mb-1.5 ml-1">
          Labor cost ratio
        </div>
        <section className="mb-3">
          <LaborCard
            laborPct={summary?.labor_pct ?? 0}
            laborDkk={summary?.labor_dkk ?? 0}
            totalRevenue={summary?.total_revenue ?? 0}
            tone={summary?.labor_tone ?? 'ok'}
          />
        </section>
        </div>

        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.18em] mt-3.5 mb-1.5 ml-1">
          Closing notes
        </div>
        <section className="mb-3">
          <IncomingNoteCard restaurantId={restaurant.id} businessDate={businessDate} />
        </section>
        <section className="mb-3">
          <ClosingNoteCard
            restaurantId={restaurant.id}
            businessDate={businessDate}
            isToday={isToday}
            authorId={profile.id}
            authorName={profile.full_name}
          />
        </section>

      </div>
    </div>
  );
}
