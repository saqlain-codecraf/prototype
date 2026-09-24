import { useState } from 'react'
import { AppHeader, BottomBar, Button, MapView, StatusBar } from '../../components/ui'
import { MapPinIcon, NavigateIcon, SearchIcon, CheckIcon } from '../../components/Icons'
import { SAVED_PLACES } from '../../data/mock'
import type { Place } from './types'

export const CURRENT_PLACE: Place = { id: 'gps', label: 'Current location', icon: '📍', line: 'Street 22, G-7/1', area: 'G-7/1, Islamabad' }

const SUGGESTIONS: Place[] = [
  { id: 's1', label: 'F-7 Markaz', icon: '🏬', line: 'Jinnah Super Market', area: 'F-7, Islamabad' },
  { id: 's2', label: 'DHA Phase 2', icon: '🏘️', line: 'Sector A, DHA Phase 2', area: 'DHA II, Islamabad' },
  { id: 's3', label: 'Bahria Town', icon: '🏡', line: 'Phase 4, Civic Center', area: 'Bahria Town, Rawalpindi' },
  { id: 's4', label: 'G-9 Markaz', icon: '🏬', line: 'Karachi Company', area: 'G-9, Islamabad' },
]

export function LocationPermission({ onAllow, onManual }: { onAllow: () => void; onManual: () => void }) {
  const [locating, setLocating] = useState(false)
  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col anim-fade-in">
      <StatusBar/>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="relative w-40 h-40 mb-8">
          <span className="radar-ring"/><span className="radar-ring" style={{ animationDelay: '0.8s' }}/><span className="radar-ring" style={{ animationDelay: '1.6s' }}/>
          <div className="absolute inset-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
            <MapPinIcon size={36} className="text-white"/>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Find pros near you</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Allow location access so we can show trusted professionals nearby. You can choose a different address for each job.
        </p>
      </div>
      <div className="px-5 pb-8 space-y-3">
        <Button className="w-full" loading={locating} onClick={() => { setLocating(true); setTimeout(onAllow, 1200) }}>
          {locating ? 'Finding your location…' : 'Allow location access'}
        </Button>
        <Button variant="secondary" className="w-full" onClick={onManual}>Enter address manually</Button>
      </div>
    </div>
  )
}

/** Shared body: map + search + saved places. Used on first launch, from the dashboard and inside Create Job. */
export function LocationPickerBody({ value, onChange, detail, onDetail, gpsAllowed }: {
  value: Place
  onChange: (p: Place) => void
  detail: string
  onDetail: (v: string) => void
  gpsAllowed: boolean
}) {
  const [q, setQ] = useState('')
  const all = [...SAVED_PLACES, ...SUGGESTIONS]
  const results = q.trim() ? all.filter(p => `${p.label} ${p.line} ${p.area}`.toLowerCase().includes(q.toLowerCase())) : []
  const pinPos = { x: 50, y: 50 }

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-gray-100 relative">
        <MapView height={170} pins={[{ id: 'home', ...pinPos, kind: 'home', label: value.area.split(',')[0] }]}/>
        {gpsAllowed && (
          <button onClick={() => onChange(CURRENT_PLACE)} className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center" aria-label="Use current location">
            <NavigateIcon size={16} className="text-blue-600"/>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:border-emerald-400 focus-within:bg-white">
        <SearchIcon size={16} className="text-gray-400"/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search area, street or landmark"
          className="flex-1 py-3 bg-transparent text-sm outline-none placeholder-gray-400"/>
      </div>

      {results.length > 0 && (
        <div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden anim-fade-in">
          {results.map(p => (
            <button key={p.id} onClick={() => { onChange(p); setQ('') }} className="w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-gray-50 last:border-0 active:bg-gray-50">
              <span>{p.icon}</span>
              <div><div className="text-sm font-semibold text-gray-900">{p.label}</div><div className="text-xs text-gray-500">{p.line}</div></div>
            </button>
          ))}
        </div>
      )}
      {q.trim() && results.length === 0 && <div className="mt-2 text-xs text-gray-400 px-1">No matches — try a sector like “F-7” or “DHA”.</div>}

      <div className="mt-4 space-y-2">
        {gpsAllowed && <PlaceRow p={CURRENT_PLACE} on={value.id === CURRENT_PLACE.id} onPick={() => onChange(CURRENT_PLACE)}/>}
        {SAVED_PLACES.map(p => <PlaceRow key={p.id} p={p} on={value.id === p.id} onPick={() => onChange(p)}/>)}
        {![CURRENT_PLACE, ...SAVED_PLACES].some(p => p.id === value.id) && <PlaceRow p={value} on onPick={() => {}}/>}
      </div>

      <div className="mt-4">
        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">House / flat / landmark</label>
        <input value={detail} onChange={e => onDetail(e.target.value)} placeholder="e.g. House 14, near the mosque"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:bg-white"/>
      </div>
    </div>
  )
}

function PlaceRow({ p, on, onPick }: { p: Place; on: boolean; onPick: () => void }) {
  return (
    <button onClick={onPick} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${on ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100'}`}>
      <span className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">{p.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-900">{p.label}</div>
        <div className="text-xs text-gray-500 truncate">{p.line}</div>
      </div>
      {on && <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><CheckIcon size={13} className="text-white"/></span>}
    </button>
  )
}

export function LocationPickerScreen({ initial, gpsAllowed, title = 'Where do you need work done?', onBack, onConfirm }: {
  initial: Place
  gpsAllowed: boolean
  title?: string
  onBack?: () => void
  onConfirm: (p: Place) => void
}) {
  const [place, setPlace] = useState(initial)
  const [detail, setDetail] = useState('')
  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col anim-slide-right">
      <AppHeader title="Work location" subtitle="Workers near this address will be notified" onBack={onBack}/>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h2 className="text-lg font-extrabold text-gray-900 mb-3">{title}</h2>
        <LocationPickerBody value={place} onChange={setPlace} detail={detail} onDetail={setDetail} gpsAllowed={gpsAllowed}/>
      </div>
      <BottomBar>
        <Button className="w-full" onClick={() => onConfirm(detail.trim() ? { ...place, line: `${detail.trim()}, ${place.line}` } : place)}>
          <MapPinIcon size={18}/> Confirm location
        </Button>
      </BottomBar>
    </div>
  )
}
