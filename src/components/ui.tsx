import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, StarFilled, CheckIcon, XIcon, MapPinIcon } from './Icons'

// ------------------------------------------------------------------
// Chrome
// ------------------------------------------------------------------

export function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? 'text-white' : 'text-gray-900'
  return (
    <div className={`flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold ${c}`}>
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

export function AppHeader({ title, subtitle, onBack, right, step, total }: {
  title: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
  step?: number
  total?: number
}) {
  return (
    <div className="bg-white border-b border-gray-100 flex-shrink-0">
      <StatusBar/>
      <div className="flex items-center gap-3 px-5 py-3">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:scale-95 transition-all flex-shrink-0">
            <ChevronLeft size={18} className="text-gray-700"/>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">{title}</div>
          {(subtitle || step) && (
            <div className="text-xs text-gray-400 truncate">{step && total ? `Step ${step} of ${total}` : ''}{step && subtitle ? ' · ' : ''}{subtitle}</div>
          )}
        </div>
        {right}
        {step && total && !right && <StepDots step={step} total={total}/>}
      </div>
      {step && total && (
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / total) * 100}%` }}/>
        </div>
      )}
    </div>
  )
}

export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < step ? 'bg-emerald-500' : 'bg-gray-200'} ${i === step - 1 ? 'w-5' : 'w-1.5'}`}/>
      ))}
    </div>
  )
}

export function BottomBar({ children }: { children: ReactNode }) {
  return <div className="px-5 pb-7 pt-3 border-t border-gray-100 bg-white flex-shrink-0">{children}</div>
}

// ------------------------------------------------------------------
// Buttons & inputs
// ------------------------------------------------------------------

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive' | 'dark' | 'soft'

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
    primary:   'bg-emerald-500 text-white shadow-lg shadow-emerald-200/70',
    secondary: 'bg-white text-gray-700 border-2 border-gray-200',
    ghost:     'bg-transparent text-gray-500',
    danger:    'bg-red-50 text-red-600 border border-red-100',
    destructive: 'bg-red-500 text-white shadow-lg shadow-red-200/60',
    dark:      'bg-gray-900 text-white',
    soft:      'bg-emerald-50 text-emerald-700',
  }[variant]
  const s = { sm: 'py-2 px-3 text-xs rounded-xl', md: 'py-3 px-4 text-sm rounded-xl', lg: 'py-4 px-5 text-base rounded-2xl' }[size]
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
      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className={`flex items-center bg-gray-50 border rounded-xl transition-all focus-within:bg-white ${error ? 'border-red-300 focus-within:border-red-400' : 'border-gray-200 focus-within:border-emerald-400'}`}>
        {prefix && <span className="pl-4 pr-1 text-sm font-semibold text-gray-500">{prefix}</span>}
        <input
          type={isPw && show ? 'text' : type}
          value={value}
          autoFocus={autoFocus}
          inputMode={inputMode}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        {isPw && (
          <button type="button" onClick={() => setShow(s => !s)} className="pr-4 text-xs font-bold text-emerald-600">
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error ? <p className="text-[11px] text-red-500 mt-1.5 font-medium">{error}</p> : hint ? <p className="text-[11px] text-gray-400 mt-1.5">{hint}</p> : null}
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
      className={`relative rounded-full transition-colors duration-300 flex-shrink-0 ${on ? 'bg-emerald-500' : 'bg-gray-300'} ${big ? 'w-16 h-9' : 'w-11 h-6'}`}
    >
      <span className={`absolute top-1 rounded-full bg-white shadow transition-all duration-300 ${big ? 'w-7 h-7' : 'w-4 h-4'} ${on ? (big ? 'left-8' : 'left-6') : 'left-1'}`}/>
    </button>
  )
}

export function Check({ checked, round = false }: { checked: boolean; round?: boolean }) {
  return (
    <span className={`w-5 h-5 flex items-center justify-center border-2 flex-shrink-0 transition-all ${round ? 'rounded-full' : 'rounded-md'} ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
      {checked && <CheckIcon size={12} className="text-white"/>}
    </span>
  )
}

export function Radio({ checked }: { checked: boolean }) {
  return (
    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'border-emerald-500' : 'border-gray-300'}`}>
      {checked && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"/>}
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
  const btn = size === 'sm' ? 'w-8 h-8 text-base rounded-lg' : 'w-12 h-12 text-xl rounded-xl'
  return (
    <div className="flex items-center gap-2">
      <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}
        className={`${btn} bg-white border-2 border-gray-200 flex items-center justify-center font-bold text-gray-700 active:scale-95 transition-all disabled:opacity-30`}>−</button>
      <div className={`text-center font-extrabold text-gray-900 ${size === 'sm' ? 'min-w-10 text-sm' : 'flex-1 text-2xl'}`}>{format(value)}</div>
      <button type="button" disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}
        className={`${btn} bg-white border-2 border-gray-200 flex items-center justify-center font-bold text-gray-700 active:scale-95 transition-all disabled:opacity-30`}>+</button>
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
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
            error ? 'border-red-300 bg-red-50 text-red-600' : d ? 'border-emerald-400 bg-emerald-50 text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-400 focus:bg-white'
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
  const t = { emerald: 'bg-emerald-100 text-emerald-700', blue: 'bg-blue-100 text-blue-700', amber: 'bg-amber-100 text-amber-700' }[tone]
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${t} ${ring ? 'ring-2 ring-white shadow-md' : ''}`}
      style={{ width: size, height: size }}
    >
      <span className="font-bold" style={{ fontSize: size * 0.36 }}>{initials}</span>
    </div>
  )
}

export type BadgeColor = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'white' | 'purple'

export function Badge({ label, color, dot = false }: { label: string; color: BadgeColor; dot?: boolean }) {
  const cls = {
    green:  'bg-emerald-100 text-emerald-700',
    amber:  'bg-amber-100 text-amber-700',
    red:    'bg-red-100 text-red-600',
    blue:   'bg-blue-100 text-blue-700',
    gray:   'bg-gray-100 text-gray-600',
    white:  'bg-white/20 text-white',
    purple: 'bg-violet-100 text-violet-700',
  }[color]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${cls}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>}
      {label}
    </span>
  )
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <StarFilled size={12} className="text-amber-400"/>
      <span className="text-xs font-bold text-gray-700">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-gray-400 ml-0.5">({count})</span>}
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
            <StarFilled size={size} className={`transition-colors ${i <= value ? 'text-amber-400' : 'text-gray-200'}`}/>
          </button>
        ))}
      </div>
      <div className="h-5 mt-2 text-sm font-bold text-amber-500">{labels[value]}</div>
    </div>
  )
}

export function EmptyState({ emoji, title, desc, action }: { emoji: string; title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 anim-fade-in">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4">{emoji}</div>
      <div className="font-bold text-gray-800 mb-1">{title}</div>
      <div className="text-sm text-gray-400 max-w-[260px] mb-5">{desc}</div>
      {action}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="font-extrabold text-gray-900">{children}</div>
      {action}
    </div>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">{children}</div>
}

export function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${strong ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-sm text-right ${strong ? 'font-extrabold text-emerald-600 text-base' : 'font-semibold text-gray-900'}`}>{value}</span>
    </div>
  )
}

/** Shrinking bar that fires onEnd after `seconds`. Remount (change `key`) to restart. */
export function CountdownBar({ seconds, onEnd, color = 'bg-emerald-500' }: { seconds: number; onEnd?: () => void; color?: string }) {
  const endRef = useRef(onEnd)
  endRef.current = onEnd
  useEffect(() => {
    const t = setTimeout(() => endRef.current?.(), seconds * 1000)
    return () => clearTimeout(t)
  }, [seconds])
  return (
    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
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

export function MapView({ height, pins = [], route, className = '', children }: {
  height: number | string
  pins?: MapPin[]
  route?: [{ x: number; y: number }, { x: number; y: number }]
  className?: string
  children?: ReactNode
}) {
  const id = useId().replace(/:/g, '')
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height, background: '#EEF6F1' }}>
      <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id={`g${id}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#DCEFE4" strokeWidth="0.25"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#g${id})`}/>
        {/* blocks */}
        <rect x="4" y="6" width="18" height="14" rx="1.5" fill="#E2EFE7"/>
        <rect x="40" y="6" width="20" height="16" rx="1.5" fill="#E2EFE7"/>
        <rect x="74" y="62" width="20" height="22" rx="1.5" fill="#E2EFE7"/>
        <rect x="6" y="60" width="16" height="12" rx="1.5" fill="#E2EFE7"/>
        {/* park & water */}
        <rect x="62" y="8" width="30" height="20" rx="3" fill="#C9EBD5"/>
        <circle cx="70" cy="16" r="2" fill="#A7DDB9"/><circle cx="82" cy="20" r="2.5" fill="#A7DDB9"/>
        <path d="M0 88 Q 25 80 45 90 T 100 86 L100 100 L0 100 Z" fill="#CDE7F5"/>
        {/* roads */}
        <rect x="0" y="44" width="100" height="7" fill="#FFFFFF"/>
        <rect x="28" y="0" width="6" height="100" fill="#FFFFFF"/>
        <rect x="66" y="30" width="4.5" height="70" fill="#FFFFFF"/>
        <rect x="0" y="26" width="66" height="3.5" fill="#FFFFFF"/>
        <line x1="0" y1="47.5" x2="100" y2="47.5" stroke="#F3D98B" strokeWidth="0.4" strokeDasharray="3 2" vectorEffect="non-scaling-stroke"/>
        {route && (
          <path
            d={`M ${route[0].x} ${route[0].y} Q ${(route[0].x + route[1].x) / 2} ${Math.min(route[0].y, route[1].y) - 12} ${route[1].x} ${route[1].y}`}
            fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {pins.map(p => <Pin key={p.id} pin={p}/>)}
      {children}
    </div>
  )
}

function Pin({ pin }: { pin: MapPin }) {
  const style = { left: `${pin.x}%`, top: `${pin.y}%` }
  if (pin.kind === 'me') {
    return (
      <div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000" style={style}>
        <div className="relative w-5 h-5">
          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-60"/>
          <span className="absolute inset-0 rounded-full bg-blue-500 border-[3px] border-white shadow-lg"/>
        </div>
      </div>
    )
  }
  if (pin.kind === 'job' || pin.kind === 'home') {
    return (
      <div className="absolute -translate-x-1/2 -translate-y-full anim-drop" style={style}>
        <div className="flex flex-col items-center">
          {pin.label && <div className="mb-1 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow whitespace-nowrap">{pin.label}</div>}
          <div className={`w-9 h-9 rounded-full rounded-br-none rotate-45 flex items-center justify-center shadow-lg ${pin.kind === 'home' ? 'bg-emerald-500' : 'bg-red-500'}`}>
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
          pin.active ? 'w-11 h-11 bg-emerald-500 border-white text-white text-xs scale-110' : 'w-9 h-9 bg-white border-emerald-400 text-emerald-600 text-[10px]'
        }`}>
          {pin.label}
        </div>
        {pin.sub && (
          <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 shadow whitespace-nowrap ${pin.active ? 'bg-gray-900 text-white' : 'bg-emerald-500 text-white'}`}>
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
      <div className="absolute inset-0 bg-black/45 anim-fade-in" onClick={dismissible ? onClose : undefined}/>
      <div className="relative w-full bg-white rounded-t-3xl anim-slide-up-sheet max-h-[90%] flex flex-col">
        <div className="pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto"/>
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
            <div className="font-extrabold text-gray-900 text-lg">{title}</div>
            {dismissible && (
              <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <XIcon size={16} className="text-gray-500"/>
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
  const tone = toast.tone === 'error' ? 'bg-red-600' : toast.tone === 'success' ? 'bg-emerald-600' : 'bg-gray-900'
  return (
    <div key={toast.id} className="absolute top-10 left-3 right-3 z-50 anim-toast">
      <div className={`${tone} text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3`}>
        {toast.emoji && <span className="text-xl">{toast.emoji}</span>}
        <div className="flex-1 min-w-0" onClick={onClose}>
          <div className="text-sm font-bold">{toast.title}</div>
          {toast.desc && <div className="text-xs text-white/75 truncate">{toast.desc}</div>}
        </div>
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); onClose() }}
            className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg flex-shrink-0"
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
      <div className="absolute inset-0 bg-black/45 anim-fade-in" onClick={onCancel}/>
      <div className="relative w-full bg-white rounded-3xl p-6 anim-bounce-in text-center">
        <div className="font-extrabold text-gray-900 text-lg mb-1">{title}</div>
        <div className="text-sm text-gray-500 mb-5">{desc}</div>
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
          className="w-20 h-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 active:scale-95 transition-all"
        >
          <span className="text-xl">📷</span>
          <span className="text-[10px] font-semibold mt-0.5">{label}</span>
        </button>
      )}
      {photos.map((p, i) => (
        <div key={p + i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-emerald-50 flex items-center justify-center anim-bounce-in">
          {isUrl(p) ? <img src={p} alt="" className="w-full h-full object-cover"/> : <span className="text-3xl">{p}</span>}
          <button
            type="button"
            onClick={() => onChange(photos.filter((_, j) => j !== i))}
            aria-label="Remove photo"
            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
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
    <div className="rounded-xl overflow-hidden bg-emerald-50 flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      {isUrl ? <img src={src} alt="" className="w-full h-full object-cover"/> : <span style={{ fontSize: size * 0.45 }}>{src}</span>}
    </div>
  )
}

// ------------------------------------------------------------------
// Floating bottom navigation (icon-only pill; active tab rises into a notch)
// ------------------------------------------------------------------

export interface NavItem {
  id: string
  label: string
  Icon: (p: { size?: number; className?: string }) => ReactNode
  badge?: number
}

export function FloatingNav({ items, active, onSelect }: { items: NavItem[]; active: string | null; onSelect: (id: string) => void }) {
  const idx = items.findIndex(i => i.id === active)
  const current = items[idx]
  const left = `${((idx + 0.5) / items.length) * 100}%`
  return (
    <div className="flex-shrink-0 bg-gray-50 px-4 pt-7 pb-4">
      <nav className="relative h-16 bg-white rounded-[28px] shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex items-stretch">
        {current && (
          <>
            {/* Raised indicator; the thick ring in the page colour reads as a notch in the bar */}
            <div
              className="absolute -top-7 w-[68px] h-[68px] -translate-x-1/2 rounded-full bg-gray-50 flex items-center justify-center transition-[left] duration-300 ease-out pointer-events-none"
              style={{ left }}
            >
              <span key={current.id} className="w-14 h-14 rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/30 flex items-center justify-center anim-bounce-in">
                <current.Icon size={24} className="text-white"/>
              </span>
            </div>
          </>
        )}
        {items.map(({ id, label, Icon, badge }) => {
          const on = id === active
          return (
            <button key={id} onClick={() => onSelect(id)} aria-label={label} aria-current={on ? 'page' : undefined}
              className="relative flex-1 flex items-center justify-center active:scale-90 transition-transform">
              <span className={`transition-opacity duration-200 ${on ? 'opacity-0' : 'opacity-100'}`}>
                <Icon size={22} className="text-gray-400"/>
              </span>
              {!!badge && !on && (
                <span className="absolute top-3 left-1/2 ml-1.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">{badge}</span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
