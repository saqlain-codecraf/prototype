import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, StarFilled, CheckIcon, XIcon, MapPinIcon, CameraIcon, Glyph } from './Icons'

// ------------------------------------------------------------------
// Chrome
// ------------------------------------------------------------------

/** Which app is showing: hirer screens use a brand header, worker screens an ink header. */
export type Tone = 'neutral' | 'hirer' | 'worker'
export const ToneContext = createContext<Tone>('neutral')
export const useTone = () => useContext(ToneContext)

/** Header surface for the current app; `dark` = text and controls should be light. */
export function headerSurface(tone: Tone) {
  return tone === 'hirer'
    ? { bg: 'bg-brand', text: 'text-white', sub: 'text-white/75', btn: 'bg-white/15 text-white', dark: true }
    : tone === 'worker'
      ? { bg: 'bg-ink', text: 'text-white', sub: 'text-white/70', btn: 'bg-white/15 text-white', dark: true }
      : { bg: 'bg-surface', text: 'text-ink', sub: 'text-muted', btn: 'bg-divider text-ink', dark: false }
}

export function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? 'text-white' : 'text-ink'
  return (
    <div className={`fake-status flex items-center justify-between px-5 pt-3 pb-1 text-tab font-bold ${c}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
          <rect x="0" y="7" width="2.5" height="4" rx="0.8"/>
          <rect x="4" y="4.5" width="2.5" height="6.5" rx="0.8"/>
          <rect x="8" y="2" width="2.5" height="9" rx="0.8"/>
          <rect x="12" y="0" width="2.5" height="11" rx="0.8" opacity="0.3"/>
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
          <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" strokeWidth="1"/>
          <rect x="2" y="2" width="15" height="7" rx="1.5" fill="currentColor"/>
        </svg>
      </div>
    </div>
  )
}

/** Back-navigation header for pushed screens; colour follows the app tone. */
export function AppHeader({ title, subtitle, onBack, right, step, total }: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
  step?: number
  total?: number
}) {
  const h = headerSurface(useTone())
  return (
    <div className="flex-shrink-0">
      <div className={h.bg}>
        <StatusBar light={h.dark}/>
        <div className="flex items-center gap-3 px-4 pt-1 pb-3">
          {onBack && (
            <button onClick={onBack} aria-label="Back" className={`size-touch flex items-center justify-center rounded-full active:scale-95 transition-all flex-shrink-0 ${h.btn}`}>
              <ChevronLeft size={22}/>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className={`display text-[20px] leading-tight truncate ${h.text}`}>{title}</div>
            {(subtitle || step) && (
              <div className={`text-small font-medium truncate mt-0.5 ${h.sub}`}>
                {step && total ? `Step ${step} of ${total}` : ''}{step && subtitle ? ' · ' : ''}{subtitle}
              </div>
            )}
          </div>
          {right}
        </div>
      </div>
      {step && total ? (
        <div className="bg-surface px-screen py-3 border-b border-divider"><StepProgress step={step} total={total}/></div>
      ) : !h.dark && <div className="border-b border-divider"/>}
    </div>
  )
}

/** Large-title header for tab screens. */
export function ScreenHeader({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: ReactNode; children?: ReactNode }) {
  const h = headerSurface(useTone())
  return (
    <div className={`flex-shrink-0 ${h.bg} ${h.dark ? '' : 'border-b border-divider'}`}>
      <StatusBar light={h.dark}/>
      <div className="flex items-end justify-between gap-3 px-screen pt-2 pb-4">
        <div className="min-w-0">
          <h1 className={`display text-title ${h.text}`}>{title}</h1>
          {subtitle && <div className={`text-ui font-medium mt-1 ${h.sub}`}>{subtitle}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

/** Segmented tabs that sit inside a coloured header (or on canvas when tone is neutral). */
export function SegmentTabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  const dark = headerSurface(useTone()).dark
  return (
    <div className={`flex gap-1 p-1 rounded-full ${dark ? 'bg-white/10' : 'bg-divider'}`} role="tablist">
      {tabs.map(t => {
        const on = t.id === value
        return (
          <button key={t.id} role="tab" aria-selected={on} onClick={() => onChange(t.id)}
            className={`flex-1 min-h-[40px] rounded-full text-ui font-bold flex items-center justify-center gap-1.5 transition-all ${
              on ? 'bg-surface text-brand' : dark ? 'text-white/80' : 'text-muted'
            }`}>
            {t.label}
            {t.count !== undefined && (
              <span className={`min-w-5 h-5 px-1.5 rounded-full text-tab flex items-center justify-center ${on ? 'bg-mint text-brand' : dark ? 'bg-white/15 text-white' : 'bg-surface text-muted'}`}>{t.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Thin segmented progress: brand = done, line = pending. */
export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-brand' : 'bg-line'}`}/>
      ))}
    </div>
  )
}

/** @deprecated kept for existing callers — renders the segmented progress. */
export function StepDots({ step, total }: { step: number; total: number }) {
  return <div className="w-24"><StepProgress step={step} total={total}/></div>
}

export function BottomBar({ children }: { children: ReactNode }) {
  return <div className="px-screen pb-7 pt-3 border-t border-divider bg-surface flex-shrink-0">{children}</div>
}

/** Brand mark: marigold rounded square with a lowercase "d", optionally followed by the wordmark. */
export function Logo({ size = 44, wordmark = false, onDark = false }: { size?: number; wordmark?: boolean; onDark?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div className="bg-accent text-ink flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, borderRadius: size * 0.3 }}>
        <span className="display leading-none" style={{ fontSize: size * 0.62, marginTop: -size * 0.06 }}>d</span>
      </div>
      {wordmark && <span className={`display leading-none ${onDark ? 'text-white' : 'text-ink'}`} style={{ fontSize: size * 0.6 }}>Doaura</span>}
    </div>
  )
}

/** Rounded-square icon holder: mint tint with a brand icon. */
export function IconTile({ children, size = 48, tone = 'mint', className = '' }: { children: ReactNode; size?: number; tone?: 'mint' | 'surface' | 'warn' | 'danger' | 'onDark'; className?: string }) {
  const t = { mint: 'bg-mint text-brand', surface: 'bg-surface text-brand border border-line', warn: 'bg-warn text-warn-ink', danger: 'bg-danger-tint text-danger', onDark: 'bg-white/15 text-white' }[tone]
  return (
    <span className={`inline-flex items-center justify-center flex-shrink-0 ${t} ${className}`} style={{ width: size, height: size, borderRadius: size >= 52 ? 18 : size >= 44 ? 14 : 12 }}>
      {children}
    </span>
  )
}

/** Fully rounded selectable pill; selected = mint + 2px brand border + check. */
export function Chip({ selected, onClick, children, className = '' }: { selected: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 min-h-touch px-4 rounded-full text-ui font-bold border-2 transition-all active:scale-[0.97] ${
        selected ? 'bg-mint border-brand text-brand' : 'bg-surface border-line text-label'
      } ${className}`}>
      {selected && <CheckIcon size={15}/>}
      {children}
    </button>
  )
}

// ------------------------------------------------------------------
// Buttons & inputs
// ------------------------------------------------------------------

// primary = ink; accent = marigold (on brand/ink backgrounds); secondary = white + 1px border; danger/destructive = red text.
type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'destructive' | 'dark' | 'soft' | 'onDark'

export function Button({ children, onClick, variant = 'primary', disabled, loading, className = '', size = 'lg', type = 'button' }: {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
}) {
  const v = {
    primary:     'bg-ink text-white',
    accent:      'bg-accent text-ink',
    secondary:   'bg-surface text-ink border border-line',
    ghost:       'bg-transparent text-muted',
    danger:      'bg-surface text-danger border border-line',
    destructive: 'bg-surface text-danger border border-danger',
    dark:        'bg-ink text-white',
    soft:        'bg-mint text-brand',
    onDark:      'bg-white/15 text-white',
  }[variant]
  const s = { sm: 'min-h-touch px-3.5 text-ui rounded-tile', md: 'h-12 px-4 text-ui rounded-btn', lg: 'h-btn px-5 text-body rounded-btn' }[size]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none disabled:active:scale-100 ${v} ${s} ${className}`}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>}
      {children}
    </button>
  )
}

export function Field({ label, value, onChange, placeholder, type = 'text', error, hint, prefix, inputMode, autoFocus }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  prefix?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  autoFocus?: boolean
}) {
  const [show, setShow] = useState(false)
  const isPw = type === 'password'
  return (
    <div>
      <label className="block text-ui font-bold text-label mb-1.5">{label}</label>
      <div className={`flex items-center h-field bg-surface border rounded-input transition-all ${error ? 'border-danger ring-1 ring-danger' : 'border-line focus-within:border-brand focus-within:ring-1 focus-within:ring-brand'}`}>
        {prefix && <span className="pl-4 pr-1 text-body font-bold text-label">{prefix}</span>}
        <input
          type={isPw && show ? 'text' : type}
          value={value}
          autoFocus={autoFocus}
          inputMode={inputMode}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 h-full bg-transparent px-4 text-body text-ink placeholder-subtle outline-none"
        />
        {isPw && (
          <button type="button" onClick={() => setShow(s => !s)} className="h-full px-4 text-ui font-bold text-brand">
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error ? <p className="text-small text-danger mt-1.5 font-bold">{error}</p> : hint ? <p className="text-small text-muted mt-1.5">{hint}</p> : null}
    </div>
  )
}

export function Toggle({ on, onChange, size = 'md' }: { on: boolean; onChange: (v: boolean) => void; size?: 'md' | 'lg' }) {
  const big = size === 'lg'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative rounded-full transition-colors duration-300 flex-shrink-0 ${on ? 'bg-brand' : 'bg-line'} ${big ? 'w-16 h-9' : 'w-11 h-6'}`}
    >
      <span className={`absolute top-1 rounded-full bg-surface shadow transition-all duration-300 ${big ? 'w-7 h-7' : 'w-4 h-4'} ${on ? (big ? 'left-8' : 'left-6') : 'left-1'}`}/>
    </button>
  )
}

export function Check({ checked, round = false }: { checked: boolean; round?: boolean }) {
  return (
    <span className={`w-5 h-5 flex items-center justify-center border-2 flex-shrink-0 transition-all ${round ? 'rounded-full' : 'rounded-md'} ${checked ? 'bg-brand border-brand' : 'border-line bg-surface'}`}>
      {checked && <CheckIcon size={12} className="text-white"/>}
    </span>
  )
}

export function Radio({ checked }: { checked: boolean }) {
  return (
    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'border-brand' : 'border-line'}`}>
      {checked && <span className="w-2.5 h-2.5 bg-brand rounded-full"/>}
    </span>
  )
}

export function NumberStepper({ value, onChange, min = 0, max = 99, step = 1, format = (v: number) => String(v), size = 'md' }: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  format?: (v: number) => string
  size?: 'sm' | 'md'
}) {
  const btn = size === 'sm' ? 'size-touch text-lg rounded-tile' : 'size-12 text-xl rounded-tile'
  return (
    <div className="flex items-center gap-2">
      <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}
        className={`${btn} bg-surface border border-line flex items-center justify-center font-bold text-ink active:scale-95 transition-all disabled:opacity-30`}>−</button>
      <div className={`text-center display text-ink ${size === 'sm' ? 'min-w-10 text-body' : 'flex-1 text-[26px]'}`}>{format(value)}</div>
      <button type="button" disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}
        className={`${btn} bg-surface border border-line flex items-center justify-center font-bold text-ink active:scale-95 transition-all disabled:opacity-30`}>+</button>
    </div>
  )
}

export function OtpInput({ value, onChange, length = 6, error }: { value: string; onChange: (v: string) => void; length?: number; error?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const setAt = (i: number, d: string) => {
    const arr = digits.slice()
    arr[i] = d
    onChange(arr.join('').slice(0, length))
  }

  return (
    <div className="flex gap-2.5 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          value={d}
          inputMode="numeric"
          autoFocus={i === 0}
          maxLength={1}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, '')
            if (!v) { setAt(i, ''); return }
            setAt(i, v[v.length - 1])
            refs.current[i + 1]?.focus()
          }}
          onKeyDown={e => {
            if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus()
          }}
          onPaste={e => {
            const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (p) { e.preventDefault(); onChange(p); refs.current[Math.min(p.length, length - 1)]?.focus() }
          }}
          className={`w-12 h-14 text-center display text-[22px] rounded-input border outline-none transition-all ${
            error ? 'border-danger ring-1 ring-danger bg-danger-tint text-danger' : d ? 'border-brand ring-1 ring-brand bg-mint text-ink' : 'border-line bg-surface text-ink focus:border-brand focus:ring-1 focus:ring-brand'
          }`}
        />
      ))}
    </div>
  )
}

// ------------------------------------------------------------------
// Display
// ------------------------------------------------------------------

export function Avatar({ name, size = 40, ring = false, tone = 'emerald' }: { name: string; size?: number; ring?: boolean; tone?: 'emerald' | 'blue' | 'amber' }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const t = { emerald: 'bg-mint text-brand', blue: 'bg-mint text-brand', amber: 'bg-warn text-warn-ink' }[tone]
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${t} ${ring ? 'ring-2 ring-white' : ''}`}
      style={{ width: size, height: size }}
    >
      <span className="font-bold" style={{ fontSize: size * 0.36 }}>{initials}</span>
    </div>
  )
}

export type BadgeColor = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'white' | 'purple'

export function Badge({ label, color, dot = false }: { label: string; color: BadgeColor; dot?: boolean }) {
  const cls = {
    green:  'bg-mint text-brand',
    amber:  'bg-warn text-warn-ink',
    red:    'bg-danger-tint text-danger',
    blue:   'bg-mint text-brand',
    gray:   'bg-divider text-muted',
    white:  'bg-accent text-ink',
    purple: 'bg-mint text-brand',
  }[color]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-small font-bold leading-none whitespace-nowrap ${cls}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>}
      {label}
    </span>
  )
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <StarFilled size={12} className="text-accent"/>
      <span className="text-small font-bold text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-small text-muted ml-0.5">({count})</span>}
    </span>
  )
}

export function StarInput({ value, onChange, size = 38 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button" onClick={() => onChange(i)} className="active:scale-90 transition-transform">
            <StarFilled size={size} className={`transition-colors ${i <= value ? 'text-accent' : 'text-line'}`}/>
          </button>
        ))}
      </div>
      <div className="h-5 mt-2 text-ui font-bold text-ink">{labels[value]}</div>
    </div>
  )
}

export function EmptyState({ emoji, title, desc, action }: { emoji: ReactNode; title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 anim-fade-in">
      <IconTile size={64} className="mb-4">{emoji}</IconTile>
      <div className="display text-[20px] text-ink mb-1">{title}</div>
      <div className="text-body text-muted max-w-[270px] mb-5">{desc}</div>
      {action}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="display text-[20px] text-ink">{children}</h2>
      {action}
    </div>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="text-ui font-bold text-label mb-2">{children}</div>
}

export function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-body ${strong ? 'font-bold text-ink' : 'text-muted'}`}>{label}</span>
      <span className={`text-right ${strong ? 'display text-[22px] text-ink' : 'text-body font-bold text-ink'}`}>{value}</span>
    </div>
  )
}

/** Shrinking bar that fires onEnd after `seconds`. Remount (change `key`) to restart. */
export function CountdownBar({ seconds, onEnd, color = 'bg-brand' }: { seconds: number; onEnd?: () => void; color?: string }) {
  const endRef = useRef(onEnd)
  endRef.current = onEnd
  useEffect(() => {
    const t = setTimeout(() => endRef.current?.(), seconds * 1000)
    return () => clearTimeout(t)
  }, [seconds])
  return (
    <div className="h-1.5 bg-line rounded-full overflow-hidden">
      <div className={`h-full ${color} anim-shrink`} style={{ animationDuration: `${seconds}s` }}/>
    </div>
  )
}

// ------------------------------------------------------------------
// Map
// ------------------------------------------------------------------

export interface MapPin {
  id: string
  x: number
  y: number
  kind: 'me' | 'job' | 'worker' | 'home'
  label?: string
  sub?: string
  active?: boolean
  onClick?: () => void
}

export interface LatLng { lat: number; lng: number }

/** G-7 / Blue Area, Islamabad — the prototype's default map centre. */
export const DEFAULT_CENTER: LatLng = { lat: 33.7085, lng: 73.0625 }

const TILE = 256

function project({ lat, lng }: LatLng, z: number) {
  const s = TILE * 2 ** z
  const sin = Math.sin((lat * Math.PI) / 180)
  return { x: ((lng + 180) / 360) * s, y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * s }
}

function unproject(x: number, y: number, z: number): LatLng {
  const s = TILE * 2 ** z
  const n = Math.PI - (2 * Math.PI * y) / s
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lng: (x / s) * 360 - 180 }
}

// ------------------------------------------------------------------
// Google Maps (used when VITE_GOOGLE_MAPS_API_KEY is set)
// ------------------------------------------------------------------

export const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? ''

// Minimal typing for the parts of the Maps JS API we use.
type GMap = {
  getCenter(): { lat(): number; lng(): number } | undefined
  setCenter(c: LatLng): void
  setZoom(z: number): void
  setOptions(o: object): void
  addListener(ev: string, fn: () => void): { remove(): void }
}
type GoogleNS = { maps: { Map: new (el: HTMLElement, opts: object) => GMap } }

let googlePromise: Promise<GoogleNS> | null = null
let warnedNoKey = false
function warnNoKey() {
  if (warnedNoKey) return
  warnedNoKey = true
  console.warn('[Doaura] VITE_GOOGLE_MAPS_API_KEY is not set in this build — using OpenStreetMap. Restart the dev server after editing .env.')
}
// Google reports an invalid/restricted key via window.gm_authFailure, not a script error.
let googleAuthFailed = false
const authFailListeners = new Set<() => void>()

export function loadGoogleMaps(): Promise<GoogleNS> {
  const w = window as unknown as { google?: GoogleNS; __doauraMapsReady?: () => void; gm_authFailure?: () => void }
  if (googleAuthFailed) return Promise.reject(new Error('Google Maps key rejected'))
  w.gm_authFailure = () => {
    googleAuthFailed = true
    console.warn('[Doaura] Google Maps rejected the API key — falling back to OpenStreetMap.')
    authFailListeners.forEach(f => f())
  }
  if (w.google?.maps?.Map) return Promise.resolve(w.google)
  if (!googlePromise) {
    googlePromise = new Promise((resolve, reject) => {
      w.__doauraMapsReady = () => resolve(w.google!)
      const s = document.createElement('script')
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_KEY)}&v=weekly&loading=async&libraries=places,geocoding&callback=__doauraMapsReady`
      s.async = true
      s.onerror = () => { googlePromise = null; reject(new Error('Google Maps failed to load')) }
      document.head.appendChild(s)
    })
  }
  return googlePromise
}

// Quiet, brand-friendly style: hide business POIs and transit clutter.
/** Read a colour token from theme.css at runtime (for APIs that need literal colours). */
export function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim()
}

const googleStyle = () => [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: token('placeholder') }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: token('canvas') }] },
]

function GoogleLayer({ center, zoom, interactive, onCenterChange, onDragState, onFail }: {
  center: LatLng
  zoom: number
  interactive: boolean
  onCenterChange?: (c: LatLng) => void
  onDragState?: (d: boolean) => void
  onFail: () => void
}) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<GMap | null>(null)
  const cb = useRef({ onCenterChange, onDragState, onFail })
  cb.current = { onCenterChange, onDragState, onFail }

  useEffect(() => {
    let off: { remove(): void }[] = []
    let cancelled = false
    const fail = () => cb.current.onFail()
    authFailListeners.add(fail)
    loadGoogleMaps().then(g => {
      if (cancelled || !el.current) return
      const m = new g.maps.Map(el.current, {
        center, zoom, disableDefaultUI: true, clickableIcons: false, keyboardShortcuts: false,
        gestureHandling: interactive ? 'greedy' : 'none', styles: googleStyle(),
      })
      map.current = m
      // Only report centre changes the user makes, not our own setCenter() calls.
      let userMoving = false
      off = [
        m.addListener('dragstart', () => { userMoving = true; cb.current.onDragState?.(true) }),
        m.addListener('center_changed', () => {
          const c = m.getCenter()
          if (c && interactive && userMoving) cb.current.onCenterChange?.({ lat: c.lat(), lng: c.lng() })
        }),
        m.addListener('dragend', () => cb.current.onDragState?.(false)),
        m.addListener('idle', () => { userMoving = false }),
      ]
    }).catch(() => cb.current.onFail())
    return () => { cancelled = true; authFailListeners.delete(fail); off.forEach(l => l.remove()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow external centre/zoom changes (e.g. "use my location") without fighting the user's drag.
  useEffect(() => {
    const m = map.current
    const c = m?.getCenter()
    if (!m || !c) return
    if (Math.abs(c.lat() - center.lat) > 1e-6 || Math.abs(c.lng() - center.lng) > 1e-6) m.setCenter(center)
  }, [center.lat, center.lng])
  useEffect(() => { map.current?.setZoom(zoom) }, [zoom])

  return <div ref={el} className="absolute inset-0"/>
}

/**
 * Real street map: Google Maps when VITE_GOOGLE_MAPS_API_KEY is set, otherwise OpenStreetMap tiles. Pins and route are placed in % of the
 * container so screens can position them freely; pass `onCenterChange` to make the map draggable.
 */
export function MapView({ height, pins = [], route, className = '', children, center = DEFAULT_CENTER, zoom = 15, onCenterChange, onDragState }: {
  height: number | string
  pins?: MapPin[]
  route?: [{ x: number; y: number }, { x: number; y: number }]
  className?: string
  children?: ReactNode
  center?: LatLng
  zoom?: number
  onCenterChange?: (c: LatLng) => void
  onDragState?: (dragging: boolean) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 390, h: 300 })
  const drag = useRef<{ x: number; y: number; c: { x: number; y: number } } | null>(null)
  const [google, setGoogle] = useState(!!GOOGLE_KEY)
  useEffect(() => { if (!GOOGLE_KEY) warnNoKey() }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const c = project(center, zoom)
  const left = c.x - size.w / 2
  const top = c.y - size.h / 2
  const tiles: { key: string; x: number; y: number; url: string }[] = []
  const max = 2 ** zoom
  if (!google) for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + size.w) / TILE); tx++) {
    for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + size.h) / TILE); ty++) {
      if (ty < 0 || ty >= max) continue
      const wx = ((tx % max) + max) % max
      tiles.push({ key: `${tx}:${ty}`, x: tx * TILE - left, y: ty * TILE - top, url: `https://tile.openstreetmap.org/${zoom}/${wx}/${ty}.png` })
    }
  }

  const interactive = !!onCenterChange
  const onDown = (e: React.PointerEvent) => {
    if (!interactive || google) return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, c }
    onDragState?.(true)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    onCenterChange!(unproject(d.c.x - (e.clientX - d.x), d.c.y - (e.clientY - d.y), zoom))
  }
  const onUp = () => {
    if (!drag.current) return
    drag.current = null
    onDragState?.(false)
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden select-none ${interactive ? 'cursor-grab active:cursor-grabbing touch-none' : ''} ${className}`}
      style={{ height, background: 'var(--color-divider)' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
    >
      {google ? (
        <GoogleLayer center={center} zoom={zoom} interactive={interactive} onCenterChange={onCenterChange} onDragState={onDragState} onFail={() => setGoogle(false)}/>
      ) : (
      <div className="absolute inset-0 pointer-events-none">
        {tiles.map(t => (
          <img key={t.key} src={t.url} alt="" draggable={false} width={TILE} height={TILE}
            className="absolute max-w-none" style={{ left: t.x, top: t.y, width: TILE, height: TILE }}/>
        ))}
      </div>
      )}
      {route && (
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {(() => {
            const d = `M ${route[0].x} ${route[0].y} Q ${(route[0].x + route[1].x) / 2} ${Math.min(route[0].y, route[1].y) - 12} ${route[1].x} ${route[1].y}`
            return (
              <>
                <path d={d} fill="none" stroke="var(--color-surface)" strokeWidth="9" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
                <path d={d} fill="none" stroke="var(--color-brand)" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
              </>
            )
          })()}
        </svg>
      )}
      {pins.map(p => <Pin key={p.id} pin={p}/>)}
      {children}
      {!google && <div className="absolute bottom-1 right-1.5 text-[8px] text-muted/80 pointer-events-none">© OpenStreetMap contributors</div>}
    </div>
  )
}

function Pin({ pin }: { pin: MapPin }) {
  const style = { left: `${pin.x}%`, top: `${pin.y}%` }
  if (pin.kind === 'me') {
    return (
      <div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000" style={style}>
        <div className="relative w-5 h-5">
          <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-60"/>
          <span className="absolute inset-0 rounded-full bg-brand border-[3px] border-white shadow-lg"/>
        </div>
      </div>
    )
  }
  if (pin.kind === 'job' || pin.kind === 'home') {
    return (
      <div className="absolute -translate-x-1/2 -translate-y-full anim-drop" style={style}>
        <div className="flex flex-col items-center">
          {pin.label && <div className="mb-1 bg-ink text-white text-small font-bold px-2 py-1 rounded-lg whitespace-nowrap">{pin.label}</div>}
          <div className={`w-9 h-9 rounded-full rounded-br-none rotate-45 flex items-center justify-center shadow-lg ${pin.kind === 'home' ? 'bg-brand' : 'bg-danger'}`}>
            <span className="-rotate-45"><MapPinIcon size={15} className="text-white"/></span>
          </div>
        </div>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={pin.onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 anim-drop transition-all duration-1000"
      style={style}
    >
      <div className="flex flex-col items-center">
        <div className={`rounded-full border-2 flex items-center justify-center shadow-md font-bold transition-all ${
          pin.active ? 'w-11 h-11 bg-brand border-white text-white text-small scale-110' : 'w-9 h-9 bg-surface border-brand text-brand text-tab'
        }`}>
          {pin.label}
        </div>
        {pin.sub && (
          <div className={`text-tab font-bold px-1.5 py-0.5 rounded-full mt-0.5 shadow whitespace-nowrap ${pin.active ? 'bg-ink text-white' : 'bg-brand text-white'}`}>
            {pin.sub}
          </div>
        )}
      </div>
    </button>
  )
}

// ------------------------------------------------------------------
// Overlays
// ------------------------------------------------------------------

export function Sheet({ open, onClose, children, title, dismissible = true }: {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  dismissible?: boolean
}) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-ink/45 anim-fade-in" onClick={dismissible ? onClose : undefined}/>
      <div className="relative w-full bg-surface rounded-t-sheet anim-slide-up-sheet max-h-[90%] flex flex-col">
        <div className="pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-line rounded-full mx-auto"/>
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
            <div className="display text-ink text-heading">{title}</div>
            {dismissible && (
              <button onClick={onClose} aria-label="Close" className="size-touch rounded-full bg-divider flex items-center justify-center">
                <XIcon size={20} className="text-ink"/>
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-7">{children}</div>
      </div>
    </div>
  )
}

export interface ToastMsg {
  id: number
  title: string
  desc?: string
  emoji?: string
  tone?: 'default' | 'success' | 'error'
  action?: { label: string; onClick: () => void }
}

export function useToast() {
  const [toast, setToast] = useState<ToastMsg | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hide = useCallback(() => setToast(null), [])
  const show = useCallback((t: Omit<ToastMsg, 'id'>) => {
    clearTimeout(timer.current)
    setToast({ ...t, id: Date.now() })
    timer.current = setTimeout(() => setToast(null), t.action ? 6000 : 3500)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  return { toast, show, hide }
}

export function ToastView({ toast, onClose }: { toast: ToastMsg | null; onClose: () => void }) {
  if (!toast) return null
  const tone = toast.tone === 'error' ? 'bg-danger' : toast.tone === 'success' ? 'bg-brand' : 'bg-ink'
  return (
    <div key={toast.id} className="absolute top-10 left-3 right-3 z-50 anim-toast">
      <div className={`${tone} text-white rounded-card shadow-lg px-4 py-3 flex items-center gap-3`}>
        {toast.emoji && <span className="text-xl"><Glyph e={toast.emoji}/></span>}
        <div className="flex-1 min-w-0" onClick={onClose}>
          <div className="text-body font-bold">{toast.title}</div>
          {toast.desc && <div className="text-small text-white/75 truncate">{toast.desc}</div>}
        </div>
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); onClose() }}
            className="min-h-touch px-3.5 bg-accent text-ink text-ui font-bold rounded-tile flex-shrink-0"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  )
}

export function Confirm({ open, title, desc, confirmLabel, danger, onConfirm, onCancel }: {
  open: boolean
  title: string
  desc: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-ink/45 anim-fade-in" onClick={onCancel}/>
      <div className="relative w-full bg-surface rounded-sheet p-6 anim-bounce-in text-center">
        <div className="display text-ink text-heading mb-1">{title}</div>
        <div className="text-body text-muted mb-5">{desc}</div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>Not now</Button>
          <Button variant={danger ? 'destructive' : 'primary'} size="md" className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Photo picker (local previews only)
// ------------------------------------------------------------------

export function PhotoPicker({ photos, onChange, max = 6, label = 'Add' }: { photos: string[]; onChange: (p: string[]) => void; max?: number; label?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const isUrl = (p: string) => p.startsWith('blob:') || p.startsWith('data:')
  return (
    <div className="flex gap-2 flex-wrap">
      {photos.length < max && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="w-20 h-20 bg-surface rounded-tile border-2 border-dashed border-line flex flex-col items-center justify-center text-brand active:scale-95 transition-all"
        >
          <CameraIcon size={22}/>
          <span className="text-small font-bold mt-1">{label}</span>
        </button>
      )}
      {photos.map((p, i) => (
        <div key={p + i} className="relative w-20 h-20 rounded-tile overflow-hidden bg-placeholder flex items-center justify-center anim-bounce-in">
          {isUrl(p) ? <img src={p} alt="" className="w-full h-full object-cover"/> : <Glyph e={p} size={26} className="text-brand/70"/>}
          <button
            type="button"
            onClick={() => onChange(photos.filter((_, j) => j !== i))}
            aria-label="Remove photo"
            className="absolute top-1 right-1 w-5 h-5 bg-ink/60 rounded-full flex items-center justify-center"
          >
            <XIcon size={11} className="text-white"/>
          </button>
        </div>
      ))}
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []).slice(0, max - photos.length)
          onChange([...photos, ...files.map(f => URL.createObjectURL(f))])
          e.target.value = ''
        }}
      />
    </div>
  )
}

export function PhotoThumb({ src, size = 64 }: { src: string; size?: number }) {
  const isUrl = src.startsWith('blob:') || src.startsWith('data:')
  return (
    <div className="rounded-tile overflow-hidden bg-placeholder flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      {isUrl ? <img src={src} alt="" className="w-full h-full object-cover"/> : <Glyph e={src} size={Math.round(size * 0.42)} className="text-brand/70"/>}
    </div>
  )
}

// ------------------------------------------------------------------
// Bottom tab bar: icon + label, active = brand
// ------------------------------------------------------------------

export interface NavItem {
  id: string
  label: string
  Icon: (p: { size?: number; className?: string; strokeWidth?: number }) => ReactNode
  badge?: number
}

export function TabBar({ items, active, onSelect }: { items: NavItem[]; active: string | null; onSelect: (id: string) => void }) {
  return (
    <nav className="flex-shrink-0 bg-surface border-t border-line flex items-stretch px-2 pb-2">
      {items.map(({ id, label, Icon, badge }) => {
        const on = id === active
        return (
          <button key={id} onClick={() => onSelect(id)} aria-current={on ? 'page' : undefined}
            className="relative flex-1 min-h-[60px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
            <span className={`h-1 w-8 rounded-full absolute top-0 transition-colors ${on ? 'bg-brand' : 'bg-transparent'}`}/>
            <Icon size={24} strokeWidth={on ? 2.25 : 2} className={on ? 'text-brand' : 'text-subtle'}/>
            <span className={`text-tab font-bold ${on ? 'text-brand' : 'text-subtle'}`}>{label}</span>
            {!!badge && (
              <span className="absolute top-1.5 left-1/2 ml-2 min-w-[18px] h-[18px] px-1 bg-accent text-ink text-tab font-bold rounded-full flex items-center justify-center">{badge}</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

/** @deprecated old name, kept so existing imports keep working. */
export const FloatingNav = TabBar
