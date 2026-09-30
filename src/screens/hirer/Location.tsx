import { useEffect, useRef, useState } from 'react'
import { Button, DEFAULT_CENTER, MapView, StatusBar, type LatLng } from '../../components/ui'
import { ChevronLeft, MapPinIcon, NavigateIcon, SearchIcon, XIcon } from '../../components/Icons'
import { SAVED_PLACES, SECTORS } from '../../data/mock'
import { getCurrentPosition, resolvePlace, reverseGeocode, searchPlaces } from '../../data/geo'
import type { Place } from './types'

export const CURRENT_PLACE: Place = { id: 'gps', label: 'Current location', icon: '📍', line: 'Street 22, G-7/1', area: 'G-7/1, Islamabad', lat: 33.7052, lng: 73.0671 }

const SUGGESTIONS: Place[] = [
  { id: 's1', label: 'F-7 Markaz', icon: '🏬', line: 'Jinnah Super Market', area: 'F-7, Islamabad', lat: 33.7205, lng: 73.0565 },
  { id: 's2', label: 'F-6 Supermarket', icon: '🛒', line: 'Kohsar Market Road', area: 'F-6, Islamabad', lat: 33.7300, lng: 73.0765 },
  { id: 's3', label: 'G-9 Markaz', icon: '🏬', line: 'Karachi Company', area: 'G-9, Islamabad', lat: 33.6916, lng: 73.0308 },
  { id: 's4', label: 'E-7', icon: '🏡', line: 'Margalla Road', area: 'E-7, Islamabad', lat: 33.7335, lng: 73.0595 },
  { id: 's5', label: 'I-8 Markaz', icon: '🏬', line: 'I-8 Commercial', area: 'I-8, Islamabad', lat: 33.6690, lng: 73.0760 },
]

const coords = (p: Place): LatLng => (p.lat && p.lng ? { lat: p.lat, lng: p.lng } : DEFAULT_CENTER)

/** Offline fallback when no geocoder answers: nearest known sector + a stable street number. */
function addressAt(c: LatLng): Place {
  const s = SECTORS.reduce((best, x) =>
    (x.lat - c.lat) ** 2 + (x.lng - c.lng) ** 2 < (best.lat - c.lat) ** 2 + (best.lng - c.lng) ** 2 ? x : best)
  const street = 1 + (Math.abs(Math.round(c.lat * 5e4 + c.lng * 3e4)) % 40)
  return { id: `pin-${c.lat.toFixed(5)},${c.lng.toFixed(5)}`, label: 'Pinned location', icon: '📍', line: `Street ${street}, ${s.name}`, area: `${s.name}, Islamabad`, lat: c.lat, lng: c.lng }
}

// ------------------------------------------------------------------
// First-launch permission prompt
// ------------------------------------------------------------------

export function LocationPermission({ onAllow, onManual }: { onAllow: (p: Place) => void; onManual: () => void }) {
  const [locating, setLocating] = useState(false)

  const allow = async () => {
    setLocating(true)
    try {
      const c = await getCurrentPosition()
      onAllow((await reverseGeocode(c)) ?? addressAt(c))
    } catch {
      // No location? Don't block — continue to manual selection.
      onManual()
    }
  }

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
        <Button className="w-full" loading={locating} onClick={allow}>
          {locating ? 'Finding your location…' : 'Allow location access'}
        </Button>
        <Button variant="secondary" className="w-full" onClick={onManual}>Enter address manually</Button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Full-screen picker: drag the map under a fixed pin, like real ride/delivery apps
// ------------------------------------------------------------------

export function LocationPickerScreen({ initial, title = 'Where do you need work done?', onBack, onConfirm }: {
  initial: Place
  gpsAllowed?: boolean
  title?: string
  onBack?: () => void
  onConfirm: (p: Place) => void
}) {
  const [center, setCenter] = useState<LatLng>(coords(initial))
  const [place, setPlace] = useState<Place>(initial)
  const [dragging, setDragging] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [locating, setLocating] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const moved = useRef(false)

  // Turn the pin position into an address once the map stops moving.
  useEffect(() => {
    if (dragging || !moved.current) return
    let cancelled = false
    setResolving(true)
    const t = setTimeout(async () => {
      const p = (await reverseGeocode(center)) ?? addressAt(center)
      if (!cancelled) { setPlace(p); setResolving(false) }
    }, 500)
    return () => { cancelled = true; clearTimeout(t) }
  }, [dragging, center])

  const jump = async (p: Place) => {
    setSearchOpen(false)
    const full = await resolvePlace(p)
    moved.current = false
    setCenter(coords(full))
    setPlace(full)
  }

  const locate = async () => {
    setSearchOpen(false)
    setLocating(true)
    try {
      const c = await getCurrentPosition()
      moved.current = true
      setCenter(c)
    } catch {
      // Location unavailable — keep the current pin and let the user carry on.
    } finally {
      setLocating(false)
    }
  }

  const busy = resolving || dragging || locating

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col anim-fade-in">
      <div className="relative flex-1 min-h-0">
        <MapView height="100%" center={center} zoom={16}
          onCenterChange={c => { moved.current = true; setCenter(c) }}
          onDragState={setDragging}/>

        {/* Fixed centre pin */}
        <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ transform: 'translate(-50%, -100%)' }}>
          <div className={`flex flex-col items-center transition-transform duration-200 ${dragging ? '-translate-y-3' : ''}`}>
            <div className="mb-1.5 bg-gray-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
              {dragging ? 'Release to set location' : locating ? 'Finding you…' : resolving ? 'Finding address…' : 'Work happens here'}
            </div>
            <div className="w-11 h-11 rounded-full rounded-br-none rotate-45 bg-emerald-600 border-[3px] border-white shadow-xl flex items-center justify-center">
              <span className="-rotate-45 w-3 h-3 bg-white rounded-full"/>
            </div>
          </div>
          <div className={`mx-auto mt-1 h-1.5 rounded-full bg-black/25 blur-[1px] transition-all ${dragging ? 'w-5 opacity-60' : 'w-3 opacity-100'}`}/>
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0"><StatusBar/></div>
        <div className="absolute top-10 left-4 right-4 flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} aria-label="Back" className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <ChevronLeft size={20} className="text-gray-800"/>
            </button>
          )}
          <button onClick={() => setSearchOpen(true)} className="flex-1 h-11 bg-white rounded-full shadow-lg flex items-center gap-2.5 px-4 text-left">
            <SearchIcon size={17} className="text-gray-400"/>
            <span className="text-sm text-gray-400 truncate">Search area, street or landmark</span>
          </button>
        </div>

        <button onClick={locate} aria-label="Use my location" disabled={locating}
          className="absolute right-4 bottom-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all">
          {locating
            ? <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/>
            : <NavigateIcon size={19} className="text-blue-600"/>}
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="relative -mt-5 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-5 pt-3 pb-7 flex-shrink-0">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3"/>
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{title}</div>
        <div className="flex items-start gap-3 mt-2">
          <span className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0"><MapPinIcon size={18} className="text-emerald-600"/></span>
          <div className="flex-1 min-w-0">
            {busy ? (
              <div className="space-y-1.5 pt-1">
                <div className="h-3.5 w-3/4 bg-gray-100 rounded animate-pulse"/>
                <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse"/>
              </div>
            ) : (
              <>
                <div className="font-extrabold text-gray-900 truncate">{place.line}</div>
                <div className="text-xs text-gray-500 truncate">{place.area}</div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto -mx-5 px-5">
          <button onClick={locate} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border border-blue-200 text-blue-600 bg-blue-50">
            <NavigateIcon size={12}/> Current location
          </button>
          {SAVED_PLACES.map(p => (
            <button key={p.id} onClick={() => jump(p)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all ${place.id === p.id ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-gray-200 text-gray-600'}`}>
              <span>{p.icon}</span>{p.label}
            </button>
          ))}
        </div>

        <Button className="w-full mt-4" disabled={busy}
          onClick={() => onConfirm(place)}>
          Confirm location
        </Button>
      </div>

      {searchOpen && <PlaceSearch near={center} onClose={() => setSearchOpen(false)} onPick={jump} onLocate={locate}/>}
    </div>
  )
}

function PlaceSearch({ near, onClose, onPick, onLocate }: { near: LatLng; onClose: () => void; onPick: (p: Place) => void; onLocate: () => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  // Debounced live search.
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setResults([]); setLoading(false); setFailed(false); return }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const r = await searchPlaces(term, near)
        if (!cancelled) { setResults(r); setFailed(false) }
      } catch {
        if (!cancelled) { setResults([]); setFailed(true) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 450)
    return () => { cancelled = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const typing = q.trim().length >= 2
  const row = (p: Place, key: string) => (
    <button key={key} onClick={() => onPick(p)} className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 text-left active:bg-gray-50">
      <span className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-base flex-shrink-0">{p.icon}</span>
      <div className="min-w-0"><div className="text-sm font-bold text-gray-900 truncate">{p.label}</div><div className="text-xs text-gray-500 truncate">{p.area || p.line}</div></div>
    </button>
  )

  return (
    <div className="absolute inset-0 z-10 bg-white flex flex-col anim-fade-in">
      <StatusBar/>
      <div className="flex items-center gap-2 px-4 py-2">
        <button onClick={onClose} aria-label="Close search" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ChevronLeft size={18} className="text-gray-700"/>
        </button>
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4">
          <SearchIcon size={16} className="text-gray-400"/>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search area, street or landmark"
            className="flex-1 min-w-0 py-2.5 bg-transparent text-sm outline-none placeholder-gray-400"/>
          {loading
            ? <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin flex-shrink-0"/>
            : q && <button onClick={() => setQ('')} aria-label="Clear"><XIcon size={15} className="text-gray-400"/></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!typing && (
          <>
            <button onClick={onLocate} className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 text-left active:bg-gray-50">
              <span className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center"><NavigateIcon size={15} className="text-blue-600"/></span>
              <div><div className="text-sm font-bold text-blue-600">Use my current location</div><div className="text-xs text-gray-500">Uses your phone's GPS</div></div>
            </button>
            <div className="px-5 pt-4 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Saved places</div>
            {SAVED_PLACES.map(p => row(p, p.id))}
            <div className="px-5 pt-4 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wide">Popular</div>
            {SUGGESTIONS.map(p => row(p, p.id))}
          </>
        )}
        {typing && results.map(p => row(p, p.id))}
        {typing && !loading && !failed && results.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-gray-500">No places found for “{q}”.<br/>Try a sector, street or landmark.</div>
        )}
        {typing && failed && (
          <div className="px-5 py-8 text-center text-sm text-gray-500">Search is unavailable right now. Check your connection, or drag the map to set the pin.</div>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Compact summary used inside Create Job (opens the full-screen picker)
// ------------------------------------------------------------------

export function LocationPickerBody({ value, onChange, detail, onDetail, gpsAllowed }: {
  value: Place
  onChange: (p: Place) => void
  detail: string
  onDetail: (v: string) => void
  gpsAllowed: boolean
}) {
  const [picking, setPicking] = useState(false)
  return (
    <div>
      <button onClick={() => setPicking(true)} className="block w-full rounded-2xl overflow-hidden border border-gray-100 relative text-left">
        <MapView height={160} center={coords(value)} zoom={16} pins={[{ id: 'home', x: 50, y: 50, kind: 'home' }]}/>
        <span className="absolute top-3 right-3 bg-white rounded-full px-3 py-1.5 shadow-md text-xs font-bold text-emerald-700">Adjust pin</span>
      </button>
      <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-2xl">
        <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"><MapPinIcon size={18} className="text-emerald-600"/></span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900 truncate">{value.line}</div>
          <div className="text-xs text-gray-500 truncate">{value.area}</div>
        </div>
        <button onClick={() => setPicking(true)} className="text-xs font-bold text-emerald-600">Change</button>
      </div>

      <div className="flex gap-2 mt-3 overflow-x-auto">
        {SAVED_PLACES.map(p => (
          <button key={p.id} onClick={() => onChange(p)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all ${value.id === p.id ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-gray-200 text-gray-600'}`}>
            <span>{p.icon}</span>{p.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">House / flat / landmark</label>
        <input value={detail} onChange={e => onDetail(e.target.value)} placeholder="e.g. House 14, near the mosque"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:bg-white"/>
      </div>

      {picking && (
        <LocationPickerScreen initial={value} gpsAllowed={gpsAllowed} title="Where should the work be done?"
          onBack={() => setPicking(false)} onConfirm={p => { onChange(p); setPicking(false) }}/>
      )}
    </div>
  )
}
