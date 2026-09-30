import { useEffect, useState } from 'react'
import { Avatar, Badge, StatusBar } from '../../components/ui'
import { BellIcon, ChevronDown, MapPinIcon, SearchIcon, PlusIcon, MessageIcon, ChevronRight, XIcon } from '../../components/Icons'
import { CATEGORIES, findSub, rs } from '../../data/catalog'
import { jobEmoji, jobTitle, stepIndex, WORK_STEPS, type WorkStatus } from '../../data/jobs'
import type { CreatePreset, HirerJob, Place } from './types'

const PROMOS = [
  { id: 'p1', categoryId: 'electrical', title: '20% off Electrical', desc: 'Wiring, fans, sockets & lights', emoji: '⚡', bg: 'linear-gradient(135deg,#059669,#0d9488)', promo: 'Flash deal: 20% off' },
  { id: 'p2', categoryId: 'ac', title: 'AC service from Rs 1,800', desc: 'Beat the heat before summer', emoji: '❄️', bg: 'linear-gradient(135deg,#0284c7,#0891b2)', promo: 'AC deal: free gas check' },
  { id: 'p3', categoryId: 'cleaning', title: 'Weekend deep clean', desc: '15% off bookings of 4+ hours', emoji: '🧹', bg: 'linear-gradient(135deg,#7c3aed,#9333ea)', promo: 'Weekend deal: 15% off' },
]

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
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white flex-shrink-0 pb-4 rounded-b-3xl shadow-sm">
        <StatusBar/>
        <div className="px-5 pt-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] text-gray-400 font-medium">{greeting()}</div>
              <div className="text-xl font-extrabold text-gray-900">Hi, {name.split(' ')[0]} 👋</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onNotifications} aria-label="Notifications" className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <BellIcon size={18} className="text-gray-600"/>
                {unread + offers > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">{unread + offers}</span>}
              </button>
              <button onClick={onProfile} aria-label="Profile"><Avatar name={name} size={40}/></button>
            </div>
          </div>

          <button onClick={onChangeLocation} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100 mb-3">
            <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><MapPinIcon size={15} className="text-white"/></span>
            <div className="flex-1 text-left min-w-0">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Work location</div>
              <div className="text-sm font-bold text-gray-900 truncate">{place.label} · {place.area}</div>
            </div>
            <ChevronDown size={16} className="text-gray-500"/>
          </button>

          <div className="relative">
            <div className="flex items-center gap-2.5 px-4 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-emerald-400 focus-within:bg-white">
              <SearchIcon size={18} className="text-gray-400"/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="What service do you need?"
                className="flex-1 py-3.5 bg-transparent text-sm outline-none placeholder-gray-400"/>
              {q && <button onClick={() => setQ('')} aria-label="Clear"><XIcon size={16} className="text-gray-400"/></button>}
            </div>
            {q.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden anim-fade-in">
                {matches.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No services match “{q}”. Try “pipe”, “fan” or “clean”.</div>
                ) : matches.map(({ c, s }) => (
                  <button key={s.id} onClick={() => { setQ(''); onCreate({ subId: s.id }) }} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 text-left active:bg-gray-50">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: c.tint }}>{c.emoji}</span>
                    <div className="flex-1 min-w-0"><div className="text-sm font-bold text-gray-900">{s.name}</div><div className="text-xs text-gray-500">{c.name} · from {rs(s.price)}/hr</div></div>
                    <ChevronRight size={14} className="text-gray-300"/>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Active jobs */}
        {active.length > 0 && (
          <div className="px-5 mb-5 space-y-3">
            {active.map(hj => <HirerJobCard key={hj.id} hj={hj} onOpen={() => onOpenJob(hj)}/>)}
          </div>
        )}

        {/* Flash sale */}
        <div className="px-5 flex items-center justify-between mb-3">
          <div className="font-extrabold text-gray-900 flex items-center gap-2">⚡ Flash sale</div>
          <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Ends in {left}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 scroll-px-5 pb-1 mb-5 snap-x snap-mandatory after:content-[''] after:w-2 after:flex-shrink-0">
          {PROMOS.map(p => (
            <button key={p.id} onClick={() => onCreate({ categoryId: p.categoryId, promo: p.promo })}
              className="relative flex-shrink-0 w-[82%] snap-start rounded-2xl p-4 text-left overflow-hidden active:scale-[0.98] transition-all" style={{ background: p.bg }}>
              <span className="absolute -right-2 -bottom-4 text-8xl opacity-25">{p.emoji}</span>
              <Badge label="Limited time" color="white"/>
              <div className="text-white font-extrabold text-lg mt-2 leading-tight">{p.title}</div>
              <div className="text-white/80 text-xs mt-0.5">{p.desc}</div>
              <span className="inline-block mt-3 px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg">Book now →</span>
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="px-5 mb-5">
          <div className="font-extrabold text-gray-900 mb-3">Categories</div>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => onCreate({ categoryId: c.id })} className="flex flex-col items-center gap-1.5 active:scale-95 transition-all">
                <div className="w-full aspect-square rounded-2xl flex items-center justify-center text-2xl shadow-sm" style={{ background: c.tint }}>{c.emoji}</div>
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Create job CTA */}
        <div className="px-5 mb-5">
          <button onClick={() => onCreate({})} className="w-full flex items-center gap-4 p-4 bg-gray-900 rounded-2xl text-left active:scale-[0.98] transition-all">
            <span className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><PlusIcon size={22} className="text-white"/></span>
            <div className="flex-1">
              <div className="font-extrabold text-white">Post a job</div>
              <div className="text-xs text-white/60">Get offers from nearby pros in minutes</div>
            </div>
            <ChevronRight size={18} className="text-white/60"/>
          </button>
        </div>

        {/* Popular */}
        <div className="px-5 mb-5">
          <div className="font-extrabold text-gray-900 mb-3">Popular near you</div>
          <div className="space-y-2">
            {POPULAR.map(id => {
              const f = findSub(id)!
              return (
                <button key={id} onClick={() => onCreate({ subId: id })} className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: f.category.tint }}>{f.category.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-sm text-gray-900">{f.sub.name}</div>
                    <div className="text-xs text-gray-500">{f.category.name} · {f.sub.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-gray-900">{rs(f.sub.price)}</div>
                    <div className="text-[10px] text-gray-400">per hour</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent */}
        {recent.length > 0 && (
          <div className="px-5 mb-5">
            <div className="font-extrabold text-gray-900 mb-3">Book again</div>
            <div className="flex gap-3 overflow-x-auto -mx-5 px-5">
              {recent.map(hj => (
                <button key={hj.id} onClick={() => onCreate({ subId: hj.job.lines[0].subId })} className="flex-shrink-0 w-40 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-left">
                  <div className="text-2xl">{jobEmoji(hj.job)}</div>
                  <div className="font-bold text-sm text-gray-900 truncate mt-1">{jobTitle(hj.job)}</div>
                  <div className="text-xs text-gray-500 truncate">with {hj.worker?.name}</div>
                  <div className="text-xs font-bold text-emerald-600 mt-2">Book again →</div>
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
      <button onClick={onOpen} className="w-full bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm text-left active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <span className="radar-ring" style={{ borderColor: '#F59E0B' }}/>
            <span className="absolute inset-0 bg-amber-50 rounded-full flex items-center justify-center text-2xl">{jobEmoji(hj.job)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <Badge label="Finding workers" color="amber" dot/>
            <div className="font-extrabold text-gray-900 mt-1 truncate">{jobTitle(hj.job)}</div>
            <div className="text-xs text-gray-500">{hj.job.dateLabel}, {hj.job.time} · tap to see live offers</div>
          </div>
          <ChevronRight size={18} className="text-gray-300"/>
        </div>
      </button>
    )
  }
  const s = hj.status as WorkStatus
  const idx = stepIndex(s)
  const done = s === 'done'
  return (
    <button onClick={onOpen} className={`w-full rounded-2xl p-4 text-left active:scale-[0.98] transition-all shadow-lg ${done ? 'bg-amber-500 shadow-amber-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge label={done ? 'Action needed' : 'Active job'} color="white" dot/>
        <span className="text-white text-xs font-bold">{done ? 'Confirm completion →' : WORK_STEPS[idx].label}</span>
      </div>
      <div className="text-white font-extrabold">{jobEmoji(hj.job)} {jobTitle(hj.job)}</div>
      <div className="flex items-center gap-3 mt-3">
        <Avatar name={hj.worker!.name} size={34} ring/>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-bold truncate">{hj.worker!.name}</div>
          <div className="text-white/75 text-[11px]">⭐ {hj.worker!.rating} · {s === 'on_way' ? `ETA ${Math.round(hj.worker!.etaMin / 2)} min` : `${hj.job.dateLabel}, ${hj.job.time}`}</div>
        </div>
        <span className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"><MessageIcon size={15} className="text-white"/></span>
      </div>
      <div className="flex gap-1 mt-3">
        {WORK_STEPS.slice(0, 5).map((st, i) => <div key={st.key} className={`h-1.5 flex-1 rounded-full ${i <= idx ? 'bg-white' : 'bg-white/25'}`}/>)}
      </div>
    </button>
  )
}
