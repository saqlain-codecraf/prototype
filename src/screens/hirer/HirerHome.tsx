import { useEffect, useState } from 'react'
import { Avatar, Badge, Button, IconTile, StatusBar } from '../../components/ui'
import { BellIcon, ChevronDown, MapPinIcon, SearchIcon, PlusIcon, MessageIcon, ChevronRight, XIcon, Glyph, StarFilled } from '../../components/Icons'
import { CATEGORIES, findSub, rs } from '../../data/catalog'
import { jobEmoji, jobTitle, stepIndex, WORK_STEPS, type WorkStatus } from '../../data/jobs'
import type { CreatePreset, HirerJob, Place } from './types'

const PROMOS = [
  { id: 'p1', categoryId: 'electrical', title: '20% off Electrical', desc: 'Wiring, fans, sockets & lights', emoji: '⚡', tone: 'brand', promo: 'Flash deal: 20% off' },
  { id: 'p2', categoryId: 'ac', title: 'AC service from Rs 1,800', desc: 'Beat the heat before summer', emoji: '❄️', tone: 'ink', promo: 'AC deal: free gas check' },
  { id: 'p3', categoryId: 'cleaning', title: 'Weekend deep clean', desc: '15% off bookings of 4+ hours', emoji: '🧹', tone: 'accent', promo: 'Weekend deal: 15% off' },
] as const

// Solid promo cards (no gradients): green and ink use a marigold CTA; marigold uses an ink CTA.
const PROMO_TONE = {
  brand:  { card: 'bg-brand text-white', sub: 'text-white/80', badge: 'bg-accent text-ink', btn: 'bg-accent text-ink', art: 'text-white/15' },
  ink:    { card: 'bg-ink text-white', sub: 'text-white/75', badge: 'bg-accent text-ink', btn: 'bg-accent text-ink', art: 'text-white/12' },
  accent: { card: 'bg-accent text-ink', sub: 'text-ink/75', badge: 'bg-ink text-white', btn: 'bg-ink text-white', art: 'text-ink/12' },
}

const POPULAR = ['lawn', 'pipe-repair', 'deep-clean', 'fan-install', 'ac-service']

function useCountdown() {
  const end = useState(() => Date.now() + (3 * 3600 + 12 * 60) * 1000)[0]
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((end - now) / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function HirerHome({ name, place, active, recent, unread, offers, onChangeLocation, onCreate, onOpenJob, onNotifications, onProfile }: {
  name: string
  place: Place
  active: HirerJob[]
  recent: HirerJob[]
  unread: number
  offers: number
  onChangeLocation: () => void
  onCreate: (p: CreatePreset) => void
  onOpenJob: (hj: HirerJob) => void
  onNotifications: () => void
  onProfile: () => void
}) {
  const [q, setQ] = useState('')
  const left = useCountdown()
  const matches = q.trim()
    ? CATEGORIES.flatMap(c => c.subs.map(s => ({ c, s }))).filter(({ c, s }) => `${c.name} ${s.name} ${s.desc}`.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : []

  return (
    <div className="flex flex-col h-full bg-canvas">
      {/* Brand header */}
      <div className="bg-brand flex-shrink-0 pb-5">
        <StatusBar light/>
        <div className="px-screen pt-1">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0">
              <div className="text-ui text-white/75 font-medium">{greeting()}</div>
              <h1 className="display text-title text-white truncate">Hi, {name.split(' ')[0]}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onNotifications} aria-label="Notifications" className="relative size-touch bg-white/15 rounded-full flex items-center justify-center">
                <BellIcon size={22} className="text-white"/>
                {unread + offers > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-accent text-ink text-tab font-bold rounded-full flex items-center justify-center">{unread + offers}</span>}
              </button>
              <button onClick={onProfile} aria-label="Profile" className="size-touch flex items-center justify-center"><Avatar name={name} size={44} ring/></button>
            </div>
          </div>

          <button onClick={onChangeLocation} className="w-full min-h-touch flex items-center gap-3 px-3 py-2.5 bg-white/10 border border-white/20 rounded-input mb-3 text-left">
            <IconTile size={36} tone="onDark"><MapPinIcon size={18}/></IconTile>
            <div className="flex-1 min-w-0">
              <div className="text-small font-bold text-white/75">Work location</div>
              <div className="text-body font-bold text-white truncate">{place.label} · {place.area}</div>
            </div>
            <ChevronDown size={20} className="text-white/80"/>
          </button>

          <div className="relative">
            <div className="flex items-center gap-2.5 h-field px-4 bg-surface rounded-input border border-line focus-within:ring-2 focus-within:ring-accent">
              <SearchIcon size={20} className="text-subtle"/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="What service do you need?" aria-label="Search services"
                className="flex-1 min-w-0 h-full bg-transparent text-body text-ink outline-none placeholder-subtle"/>
              {q && <button onClick={() => setQ('')} aria-label="Clear" className="size-touch -mr-3 flex items-center justify-center"><XIcon size={18} className="text-subtle"/></button>}
            </div>
            {q.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-surface rounded-card shadow-lg border border-line z-20 overflow-hidden anim-fade-in">
                {matches.length === 0 ? (
                  <div className="p-4 text-body text-muted">No services match “{q}”. Try “pipe”, “fan” or “clean”.</div>
                ) : matches.map(({ c, s }) => (
                  <button key={s.id} onClick={() => { setQ(''); onCreate({ subId: s.id }) }} className="w-full flex items-center gap-3 px-4 py-3 border-b border-divider last:border-0 text-left active:bg-canvas">
                    <IconTile size={44}><Glyph e={c.emoji} size={22}/></IconTile>
                    <div className="flex-1 min-w-0"><div className="text-body font-bold text-ink">{s.name}</div><div className="text-small text-muted">{c.name} · from {rs(s.price)}/hr</div></div>
                    <ChevronRight size={18} className="text-subtle"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="accent" className="w-full mt-3" onClick={() => onCreate({})}><PlusIcon size={20}/> Post a job</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5">
        {/* Active jobs */}
        {active.length > 0 && (
          <div className="px-screen mb-6 space-y-3">
            {active.map(hj => <HirerJobCard key={hj.id} hj={hj} onOpen={() => onOpenJob(hj)}/>)}
          </div>
        )}

        {/* Flash sale */}
        <div className="px-screen flex items-center justify-between mb-3">
          <h2 className="display text-[20px] text-ink">Flash sale</h2>
          <span className="text-small font-bold text-warn-ink bg-warn px-2.5 py-1 rounded-full">Ends in {left}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-screen scroll-px-5 pb-1 mb-6 snap-x snap-mandatory after:content-[''] after:w-2 after:flex-shrink-0">
          {PROMOS.map(p => {
            const t = PROMO_TONE[p.tone]
            return (
              <button key={p.id} onClick={() => onCreate({ categoryId: p.categoryId, promo: p.promo })}
                className={`relative flex-shrink-0 w-[82%] snap-start rounded-card p-5 text-left overflow-hidden active:scale-[0.98] transition-all ${t.card}`}>
                <span className={`absolute -right-3 -bottom-3 ${t.art}`}><Glyph e={p.emoji} size={110} strokeWidth={1.5}/></span>
                <span className={`inline-block px-2.5 py-1 rounded-full text-small font-bold ${t.badge}`}>Limited time</span>
                <div className="display text-heading mt-3 pr-10">{p.title}</div>
                <div className={`text-ui mt-1 ${t.sub}`}>{p.desc}</div>
                <span className={`inline-flex items-center mt-4 h-10 px-4 text-ui font-bold rounded-tile ${t.btn}`}>Book now</span>
              </button>
            )
          })}
        </div>

        {/* Categories */}
        <div className="px-screen mb-6">
          <h2 className="display text-[20px] text-ink mb-3">Categories</h2>
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => onCreate({ categoryId: c.id })} className="flex flex-col items-center gap-2 active:scale-95 transition-all">
                <IconTile size={56}><Glyph e={c.emoji} size={26}/></IconTile>
                <span className="text-small font-bold text-label text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular */}
        <div className="px-screen mb-6">
          <h2 className="display text-[20px] text-ink mb-3">Popular near you</h2>
          <div className="space-y-2.5">
            {POPULAR.map(id => {
              const f = findSub(id)!
              return (
                <button key={id} onClick={() => onCreate({ subId: id })} className="w-full flex items-center gap-3 p-3 bg-surface rounded-card border border-line active:scale-[0.98] transition-all">
                  <IconTile size={48}><Glyph e={f.category.emoji} size={24}/></IconTile>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-bold text-body text-ink truncate">{f.sub.name}</div>
                    <div className="text-small text-muted truncate">{f.category.name} · {f.sub.desc}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="display text-[18px] text-ink">{rs(f.sub.price)}</div>
                    <div className="text-small text-muted">per hour</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent */}
        {recent.length > 0 && (
          <div className="px-screen mb-6">
            <h2 className="display text-[20px] text-ink mb-3">Book again</h2>
            <div className="flex gap-3 overflow-x-auto -mx-5 px-screen">
              {recent.map(hj => (
                <button key={hj.id} onClick={() => onCreate({ subId: hj.job.lines[0].subId })} className="flex-shrink-0 w-44 bg-surface rounded-card p-4 border border-line text-left">
                  <IconTile size={44}><Glyph e={jobEmoji(hj.job)} size={22}/></IconTile>
                  <div className="font-bold text-body text-ink truncate mt-3">{jobTitle(hj.job)}</div>
                  <div className="text-small text-muted truncate">with {hj.worker?.name}</div>
                  <div className="text-ui font-bold text-brand mt-3 flex items-center gap-1">Book again <ChevronRight size={16}/></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function HirerJobCard({ hj, onOpen }: { hj: HirerJob; onOpen: () => void }) {
  if (hj.status === 'searching') {
    return (
      <button onClick={onOpen} className="w-full bg-surface rounded-card p-4 border-2 border-accent text-left active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3">
          <div className="relative size-12 flex-shrink-0">
            <span className="radar-ring" style={{ borderColor: 'var(--color-accent)' }}/>
            <IconTile size={48} tone="warn"><Glyph e={jobEmoji(hj.job)} size={24}/></IconTile>
          </div>
          <div className="flex-1 min-w-0">
            <Badge label="Finding workers" color="amber" dot/>
            <div className="display text-[18px] text-ink mt-1.5 truncate">{jobTitle(hj.job)}</div>
            <div className="text-small text-muted">{hj.job.dateLabel}, {hj.job.time} · tap to see live offers</div>
          </div>
          <ChevronRight size={20} className="text-subtle"/>
        </div>
      </button>
    )
  }
  const s = hj.status as WorkStatus
  const idx = stepIndex(s)
  const done = s === 'done'
  // Needs action → marigold card with ink text; in progress → brand card with white text.
  const c = done
    ? { card: 'bg-accent text-ink', sub: 'text-ink/75', chip: 'bg-ink text-white', bar: 'bg-ink', rest: 'bg-ink/20', btn: 'bg-ink/10 text-ink' }
    : { card: 'bg-brand text-white', sub: 'text-white/75', chip: 'bg-accent text-ink', bar: 'bg-accent', rest: 'bg-white/25', btn: 'bg-white/15 text-white' }
  return (
    <button onClick={onOpen} className={`w-full rounded-card p-4 text-left active:scale-[0.98] transition-all ${c.card}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-small font-bold ${c.chip}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>{done ? 'Action needed' : 'Active job'}
        </span>
        <span className="text-small font-bold flex items-center gap-1">{done ? 'Confirm completion' : WORK_STEPS[idx].label}{done && <ChevronRight size={16}/>}</span>
      </div>
      <div className="display text-[20px] flex items-center gap-2"><Glyph e={jobEmoji(hj.job)} size={22}/> {jobTitle(hj.job)}</div>
      <div className="flex items-center gap-3 mt-3">
        <Avatar name={hj.worker!.name} size={36} ring/>
        <div className="flex-1 min-w-0">
          <div className="text-body font-bold truncate">{hj.worker!.name}</div>
          <div className={`text-small flex items-center gap-1 ${c.sub}`}><StarFilled size={12} className={done ? 'text-ink' : 'text-accent'}/> {hj.worker!.rating} · {s === 'on_way' ? `ETA ${Math.round(hj.worker!.etaMin / 2)} min` : `${hj.job.dateLabel}, ${hj.job.time}`}</div>
        </div>
        <span className={`size-touch rounded-full flex items-center justify-center ${c.btn}`}><MessageIcon size={20}/></span>
      </div>
      <div className="flex gap-1.5 mt-4">
        {WORK_STEPS.slice(0, 5).map((st, i) => <div key={st.key} className={`h-1.5 flex-1 rounded-full ${i <= idx ? c.bar : c.rest}`}/>)}
      </div>
    </button>
  )
}
