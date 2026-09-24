import { useState } from 'react'
import { AppHeader, Avatar, Badge, Button, EmptyState, StatusBar, Toggle } from '../../components/ui'
import { ChevronRight, StarFilled } from '../../components/Icons'
import { rs } from '../../data/catalog'
import { PAYMENT_METHODS, SAVED_PLACES } from '../../data/mock'
import { jobEmoji, jobTitle } from '../../data/jobs'
import type { Profile } from '../auth/Auth'
import { HirerJobCard } from './HirerHome'
import type { ActivityItem, HirerJob, Place } from './types'

export function HirerJobsScreen({ active, history, onOpen, onCreate }: {
  active: HirerJob[]
  history: HirerJob[]
  onOpen: (hj: HirerJob) => void
  onCreate: () => void
}) {
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const list = tab === 'active' ? active : history
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <StatusBar/>
        <div className="px-5 py-3 font-extrabold text-gray-900 text-xl">My Jobs</div>
        <div className="flex px-5 gap-1">
          {(['active', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-bold capitalize border-b-2 transition-all ${tab === t ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}>
              {t} <span className="text-[10px] ml-1 px-1.5 rounded-full bg-gray-100 text-gray-500">{t === 'active' ? active.length : history.length}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {list.length === 0 ? (
          <EmptyState emoji={tab === 'active' ? '📋' : '🗂️'} title={tab === 'active' ? 'No active jobs' : 'No past jobs yet'}
            desc={tab === 'active' ? 'Post a job and nearby workers will start sending offers.' : 'Completed and cancelled jobs will appear here.'}
            action={tab === 'active' ? <Button size="md" onClick={onCreate}>Post a job</Button> : undefined}/>
        ) : tab === 'active' ? (
          list.map(hj => <HirerJobCard key={hj.id} hj={hj} onOpen={() => onOpen(hj)}/>)
        ) : (
          list.map(hj => (
            <div key={hj.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">{jobEmoji(hj.job)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">{jobTitle(hj.job)}</div>
                <div className="text-xs text-gray-500 truncate">{hj.worker ? `${hj.worker.name} · ` : ''}{hj.job.dateLabel}</div>
                {hj.rating ? (
                  <div className="flex items-center gap-0.5 mt-1">{[1, 2, 3, 4, 5].map(i => <StarFilled key={i} size={11} className={i <= hj.rating! ? 'text-amber-400' : 'text-gray-200'}/>)}</div>
                ) : null}
              </div>
              <div className="text-right">
                {hj.status === 'cancelled' ? <Badge label="Cancelled" color="red"/> : (
                  <><div className="font-extrabold text-sm text-gray-900">{rs(hj.total ?? 0)}</div><Badge label="Paid" color="green"/></>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function ActivityScreen({ items, onBack }: { items: ActivityItem[]; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <AppHeader title="Notifications" subtitle="Offers, assignments, payments & reviews" onBack={onBack}/>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <EmptyState emoji="🔔" title="Nothing yet" desc="Offers, assignments, payments and reviews will show up here."/>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gray-200"/>
            <div className="space-y-3">
              {items.map(a => (
                <div key={a.id} className="relative flex items-start gap-3 anim-slide-up">
                  <span className="relative z-10 w-10 h-10 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center text-lg flex-shrink-0">{a.emoji}</span>
                  <div className="flex-1 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-900">{a.title}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{a.time}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function HirerProfile({ profile, place, posted, completed, onLocation, onSignOut }: {
  profile: Profile
  place: Place
  posted: number
  completed: number
  onLocation: () => void
  onSignOut: () => void
}) {
  const [notif, setNotif] = useState(true)
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <StatusBar/>
        <div className="px-5 py-3 font-extrabold text-gray-900 text-xl">Profile</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white mb-3 px-5 py-5">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} size={68}/>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-gray-900 text-lg truncate">{profile.name}</div>
              <div className="text-xs text-gray-500 truncate">{profile.email}</div>
              <div className="text-xs text-gray-500">{profile.phone}</div>
              <div className="mt-1.5"><Badge label="✓ Phone verified" color="green"/></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[{ l: 'Jobs posted', v: posted }, { l: 'Completed', v: completed }, { l: 'City', v: profile.city }].map(s => (
              <div key={s.l} className="bg-gray-50 rounded-xl py-3 text-center">
                <div className="font-extrabold text-gray-900 truncate px-1">{s.v}</div>
                <div className="text-[11px] text-gray-400">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white mb-3">
          <button onClick={onLocation} className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 active:bg-gray-50">
            <span className="text-xl">📍</span>
            <div className="flex-1 text-left"><div className="font-semibold text-sm text-gray-900">Default work location</div><div className="text-xs text-gray-400">{place.label} · {place.area}</div></div>
            <ChevronRight size={16} className="text-gray-300"/>
          </button>
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-4 mb-2"><span className="text-xl">🏠</span><div className="font-semibold text-sm text-gray-900">Saved places</div></div>
            <div className="pl-9 space-y-1">{SAVED_PLACES.map(p => <div key={p.id} className="text-xs text-gray-500">{p.icon} {p.label} — {p.line}</div>)}</div>
          </div>
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-4 mb-2"><span className="text-xl">💳</span><div className="font-semibold text-sm text-gray-900">Payment methods</div></div>
            <div className="pl-9 space-y-1">{PAYMENT_METHODS.map(p => <div key={p.id} className="text-xs text-gray-500">{p.icon} {p.label} · {p.sub}</div>)}</div>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <span className="text-xl">🔔</span>
            <div className="flex-1"><div className="font-semibold text-sm text-gray-900">Offer notifications</div><div className="text-xs text-gray-400">{notif ? 'On — get alerted for every new offer' : 'Off'}</div></div>
            <Toggle on={notif} onChange={setNotif}/>
          </div>
        </div>

        <div className="bg-white mb-8">
          <button onClick={onSignOut} className="w-full flex items-center gap-4 px-5 py-4 text-red-500 active:bg-red-50">
            <span className="text-xl">🚪</span><div className="font-bold text-sm">Sign out</div>
          </button>
        </div>
      </div>
    </div>
  )
}
