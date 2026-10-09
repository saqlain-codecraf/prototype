import { useState } from 'react'
import { AppHeader, Avatar, Badge, Button, EmptyState, ScreenHeader, SegmentTabs, StatusBar, Toggle } from '../../components/ui'
import { ChevronRight, StarFilled, Glyph } from '../../components/Icons'
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
    <div className="flex flex-col h-full bg-canvas">
      <ScreenHeader title="My jobs">
        <div className="px-screen pb-4">
          <SegmentTabs value={tab} onChange={setTab}
            tabs={[{ id: 'active', label: 'Active', count: active.length }, { id: 'history', label: 'History', count: history.length }]}/>
        </div>
      </ScreenHeader>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {list.length === 0 ? (
          <EmptyState emoji={<Glyph e={tab === 'active' ? '📋' : '🗂️'}/>} title={tab === 'active' ? 'No active jobs' : 'No past jobs yet'}
            desc={tab === 'active' ? 'Post a job and nearby workers will start sending offers.' : 'Completed and cancelled jobs will appear here.'}
            action={tab === 'active' ? <Button size="md" onClick={onCreate}>Post a job</Button> : undefined}/>
        ) : tab === 'active' ? (
          list.map(hj => <HirerJobCard key={hj.id} hj={hj} onOpen={() => onOpen(hj)}/>)
        ) : (
          list.map(hj => (
            <div key={hj.id} className="bg-surface rounded-card p-4 border border-divider flex items-center gap-3">
              <div className="w-12 h-12 bg-mint rounded-tile flex items-center justify-center text-2xl text-brand"><Glyph e={jobEmoji(hj.job)}/></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-body text-ink truncate">{jobTitle(hj.job)}</div>
                <div className="text-small text-muted truncate">{hj.worker ? `${hj.worker.name} · ` : ''}{hj.job.dateLabel}</div>
                {hj.rating ? (
                  <div className="flex items-center gap-0.5 mt-1">{[1, 2, 3, 4, 5].map(i => <StarFilled key={i} size={11} className={i <= hj.rating! ? 'text-accent' : 'text-subtle'}/>)}</div>
                ) : null}
              </div>
              <div className="text-right">
                {hj.status === 'cancelled' ? <Badge label="Cancelled" color="red"/> : (
                  <><div className="display text-body text-ink">{rs(hj.total ?? 0)}</div><Badge label="Paid" color="green"/></>
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
    <div className="flex flex-col h-full bg-canvas">
      <AppHeader title="Notifications" subtitle="Offers, assignments, payments & reviews" onBack={onBack}/>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <EmptyState emoji={<Glyph e="🔔"/>} title="Nothing yet" desc="Offers, assignments, payments and reviews will show up here."/>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-line"/>
            <div className="space-y-3">
              {items.map(a => (
                <div key={a.id} className="relative flex items-start gap-3 anim-slide-up">
                  <span className="relative z-10 w-10 h-10 bg-surface rounded-full border-2 border-divider flex items-center justify-center text-lg flex-shrink-0"><Glyph e={a.emoji}/></span>
                  <div className="flex-1 bg-surface rounded-card p-3 border border-divider">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-body text-ink">{a.title}</span>
                      <span className="text-tab text-subtle flex-shrink-0">{a.time}</span>
                    </div>
                    <div className="text-small text-muted mt-0.5">{a.desc}</div>
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
    <div className="flex flex-col h-full bg-canvas">
      <ScreenHeader title="Profile"/>
      <div className="flex-1 overflow-y-auto">
        <div className="bg-surface mb-3 px-5 py-5">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} size={68}/>
            <div className="flex-1 min-w-0">
              <div className="display text-ink text-lg truncate">{profile.name}</div>
              <div className="text-small text-muted truncate">{profile.email}</div>
              <div className="text-small text-muted">{profile.phone}</div>
              <div className="mt-1.5"><Badge label="✓ Phone verified" color="green"/></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[{ l: 'Jobs posted', v: posted }, { l: 'Completed', v: completed }, { l: 'City', v: profile.city }].map(s => (
              <div key={s.l} className="bg-canvas rounded-tile py-3 text-center">
                <div className="display text-ink truncate px-1">{s.v}</div>
                <div className="text-small text-subtle">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface mb-3">
          <button onClick={onLocation} className="w-full flex items-center gap-4 px-5 py-4 border-b border-divider active:bg-canvas">
            <span className="text-xl"><Glyph e="📍"/></span>
            <div className="flex-1 text-left"><div className="font-bold text-body text-ink">Default work location</div><div className="text-small text-subtle">{place.label} · {place.area}</div></div>
            <ChevronRight size={16} className="text-subtle"/>
          </button>
          <div className="px-5 py-4 border-b border-divider">
            <div className="flex items-center gap-4 mb-2"><span className="text-xl"><Glyph e="🏠"/></span><div className="font-bold text-body text-ink">Saved places</div></div>
            <div className="pl-9 space-y-1">{SAVED_PLACES.map(p => <div key={p.id} className="text-small text-muted"><Glyph e={p.icon}/> {p.label} — {p.line}</div>)}</div>
          </div>
          <div className="px-5 py-4 border-b border-divider">
            <div className="flex items-center gap-4 mb-2"><span className="text-xl"><Glyph e="💳"/></span><div className="font-bold text-body text-ink">Payment methods</div></div>
            <div className="pl-9 space-y-1">{PAYMENT_METHODS.map(p => <div key={p.id} className="text-small text-muted"><Glyph e={p.icon}/> {p.label} · {p.sub}</div>)}</div>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <span className="text-xl"><Glyph e="🔔"/></span>
            <div className="flex-1"><div className="font-bold text-body text-ink">Offer notifications</div><div className="text-small text-subtle">{notif ? 'On — get alerted for every new offer' : 'Off'}</div></div>
            <Toggle on={notif} onChange={setNotif}/>
          </div>
        </div>

        <div className="bg-surface mb-8">
          <button onClick={onSignOut} className="w-full flex items-center gap-4 px-5 py-4 text-danger active:bg-danger-tint">
            <span className="text-xl"><Glyph e="🚪"/></span><div className="font-bold text-body">Sign out</div>
          </button>
        </div>
      </div>
    </div>
  )
}
