import { useEffect, useState } from 'react'
import { AppHeader, BottomBar, Button, Check, Field, OtpInput, Radio, Sheet, StatusBar } from '../../components/ui'
import { ShieldIcon, CheckIcon } from '../../components/Icons'

export type Role = 'worker' | 'hirer'

export interface Profile {
  name: string
  email: string
  phone: string
  city: string
}

export interface Account {
  role: Role
  profile: Profile
  password: string
}

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
const digits = (p: string) => p.replace(/\D/g, '')

export function Logo({ size = 56 }: { size?: number }) {
  return (
    <div className="bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200" style={{ width: size, height: size, borderRadius: size * 0.3 }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 26 26" fill="none">
        <path d="M5 13.5L11 19.5L21 8" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

// ------------------------------------------------------------------
// Splash
// ------------------------------------------------------------------

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="flex flex-col h-full bg-emerald-600 text-white">
      <StatusBar light/>
      <div className="flex-1 flex flex-col items-center justify-center anim-fade-in">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <span className="radar-ring" style={{ borderColor: 'rgba(255,255,255,0.6)' }}/>
          <div className="w-24 h-24 bg-white rounded-[30px] flex items-center justify-center shadow-2xl anim-bounce-in">
            <svg width="46" height="46" viewBox="0 0 26 26" fill="none">
              <path d="M5 13.5L11 19.5L21 8" stroke="#10B981" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="mt-6 text-3xl font-extrabold tracking-tight anim-slide-up" style={{ animationDelay: '0.15s' }}>DoAura</div>
        <div className="mt-1 text-sm text-emerald-100 anim-slide-up" style={{ animationDelay: '0.25s' }}>Trusted pros, right around the corner</div>
      </div>
      <div className="px-16 pb-14">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full anim-grow" style={{ animationDuration: '1.7s' }}/>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// Login — one form for everyone; the account decides which app opens
// ------------------------------------------------------------------

export function LoginScreen({ accounts, onLogin, onRegister }: {
  accounts: Account[]
  onLogin: (a: Account) => void
  onRegister: () => void
}) {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const find = () => {
    const v = id.trim().toLowerCase()
    const d = digits(v).slice(-10)
    return accounts.find(a => a.profile.email.toLowerCase() === v || (d.length === 10 && digits(a.profile.phone).slice(-10) === d))
  }

  const submit = () => {
    if (!id.trim() || !pw) { setError('Enter your email or phone and password'); return }
    setError('')
    setLoading(true)
    setTimeout(() => {
      const a = find()
      if (!a || a.password !== pw) {
        setLoading(false)
        setError('Incorrect email/phone or password')
        return
      }
      onLogin(a)
    }, 800)
  }

  const demo = accounts.filter(a => a.password === 'doaura123')

  return (
    <div className="relative flex flex-col h-full bg-white">
      <StatusBar/>
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4 anim-fade-in">
        <Logo/>
        <h1 className="text-[28px] font-extrabold text-gray-900 mt-6 leading-tight">Welcome back</h1>
        <p className="text-gray-500 text-sm mt-1 mb-7">Log in to hire a pro or pick up jobs near you.</p>

        <form className="space-y-4" onSubmit={e => { e.preventDefault(); submit() }}>
          <Field label="Email or phone" value={id} onChange={v => { setId(v); setError('') }} placeholder="you@email.com or 0300 1234567" inputMode="email"/>
          <div>
            <Field label="Password" type="password" value={pw} onChange={v => { setPw(v); setError('') }} placeholder="Your password"/>
            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => { setForgot(true); setResetSent(false) }} className="text-xs font-bold text-emerald-600">Forgot password?</button>
            </div>
          </div>
          {error && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600 anim-fade-in">{error}</div>
          )}
          <Button type="submit" className="w-full" loading={loading}>{loading ? 'Logging in…' : 'Log in'}</Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-100"/><span className="text-xs text-gray-400 font-semibold">New to DoAura?</span><div className="flex-1 h-px bg-gray-100"/>
        </div>
        <Button variant="secondary" className="w-full" onClick={onRegister}>Create an account</Button>

        {demo.length > 0 && (
          <div className="mt-8 p-3 rounded-2xl border border-dashed border-gray-200">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Prototype · demo accounts</div>
            <div className="flex gap-2">
              {demo.map(a => (
                <button key={a.profile.email} type="button" onClick={() => { setId(a.profile.email); setPw(a.password); setError('') }}
                  className="flex-1 text-left p-2.5 rounded-xl bg-gray-50 active:bg-emerald-50">
                  <div className="text-xs font-bold text-gray-900">{a.role === 'hirer' ? '🏠 Hirer' : '🧰 Worker'}</div>
                  <div className="text-[10px] text-gray-500 truncate">{a.profile.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="px-6 pb-6 pt-2 text-center text-[11px] text-gray-400">
        By continuing you agree to our <span className="text-emerald-600 font-semibold">Terms</span> & <span className="text-emerald-600 font-semibold">Privacy Policy</span>
      </div>

      <Sheet open={forgot} onClose={() => setForgot(false)} title={resetSent ? undefined : 'Reset password'}>
        {resetSent ? (
          <div className="text-center py-4 anim-fade-in">
            <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-3"><CheckIcon size={28} className="text-emerald-600"/></div>
            <div className="font-extrabold text-gray-900 text-lg">Check your messages</div>
            <p className="text-sm text-gray-500 mt-1 mb-5">We sent a reset link to <b className="text-gray-800">{id || 'your email'}</b>.</p>
            <Button className="w-full" onClick={() => setForgot(false)}>Back to log in</Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">Enter your email or phone and we'll send you a link to set a new password.</p>
            <Field label="Email or phone" value={id} onChange={setId} placeholder="you@email.com"/>
            <Button className="w-full mt-5" disabled={!id.trim()} onClick={() => setResetSent(true)}>Send reset link</Button>
          </div>
        )}
      </Sheet>
    </div>
  )
}

// ------------------------------------------------------------------
// Register step 0 — the only place we ask how they'll use DoAura
// ------------------------------------------------------------------

const ROLE_OPTIONS: { role: Role; emoji: string; title: string; desc: string; points: string[] }[] = [
  { role: 'hirer', emoji: '🏠', title: 'I need a service', desc: 'Hire trusted pros for your home or business', points: ['Post a job in a minute', 'Get live offers from nearby pros'] },
  { role: 'worker', emoji: '🧰', title: 'I want to work', desc: 'Earn by offering your skills nearby', points: ['Get job requests near you', 'Set your own price'] },
]

export function RolePicker({ onBack, onContinue }: { onBack: () => void; onContinue: (r: Role) => void }) {
  const [role, setRole] = useState<Role | null>(null)
  return (
    <div className="flex flex-col h-full bg-white anim-slide-right">
      <AppHeader title="Create account" onBack={onBack}/>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <h2 className="text-2xl font-extrabold text-gray-900">How will you use DoAura?</h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">Pick one to get started.</p>
        <div className="space-y-3">
          {ROLE_OPTIONS.map(o => {
            const on = role === o.role
            return (
              <button key={o.role} onClick={() => setRole(o.role)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99] ${on ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100' : 'border-gray-100'}`}>
                <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-colors ${on ? 'bg-white' : 'bg-gray-50'}`}>{o.emoji}</span>
                <div className="flex-1">
                  <div className="font-extrabold text-gray-900">{o.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{o.desc}</div>
                  <div className="mt-2 space-y-1">
                    {o.points.map(p => (
                      <div key={p} className="flex items-center gap-1.5 text-xs text-gray-600"><CheckIcon size={12} className="text-emerald-500"/>{p}</div>
                    ))}
                  </div>
                </div>
                <Radio checked={on}/>
              </button>
            )
          })}
        </div>
      </div>
      <BottomBar>
        <Button className="w-full" disabled={!role} onClick={() => role && onContinue(role)}>Continue</Button>
        <div className="text-center text-sm text-gray-500 mt-3">
          Already have an account? <button onClick={onBack} className="text-emerald-600 font-bold">Log in</button>
        </div>
      </BottomBar>
    </div>
  )
}

// ------------------------------------------------------------------
// Sign-up details
// ------------------------------------------------------------------

export function SignupScreen({ role, step, total, initial, onBack, onNext }: {
  role: Role
  step: number
  total: number
  initial?: Profile
  onBack: () => void
  onNext: (p: Profile, password: string) => void
}) {
  const [f, setF] = useState({
    name: initial?.name ?? '', email: initial?.email ?? '', phone: initial?.phone.replace('+92 ', '') ?? '',
    city: initial?.city ?? 'Islamabad', password: '', agree: false,
  })
  const [touched, setTouched] = useState(false)
  const set = (p: Partial<typeof f>) => setF(s => ({ ...s, ...p }))

  const errors = {
    name: f.name.trim().length < 3 ? 'Enter your full name' : '',
    email: !validEmail(f.email) ? 'Enter a valid email address' : '',
    phone: digits(f.phone).length !== 10 ? 'Enter a 10-digit mobile number' : '',
    password: f.password.length < 8 ? 'At least 8 characters' : '',
    agree: !f.agree ? 'Please accept the terms' : '',
  }
  const ok = Object.values(errors).every(e => !e)
  const e = (k: keyof typeof errors) => (touched ? errors[k] : '')

  const submit = () => {
    setTouched(true)
    if (ok) onNext({ name: f.name.trim(), email: f.email.trim(), phone: `+92 ${f.phone.trim()}`, city: f.city }, f.password)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <AppHeader title={role === 'worker' ? 'Join as a worker' : 'Create your account'} subtitle="Your details" onBack={onBack} step={step} total={total}/>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Tell us about you</h2>
        <p className="text-gray-500 text-sm mb-5">
          {role === 'worker' ? 'This appears on your profile when you send offers.' : 'Workers see your name when you hire them.'}
        </p>
        <div className="space-y-4">
          <Field label="Full name" value={f.name} onChange={v => set({ name: v })} placeholder="Full name" error={e('name')}/>
          <Field label="Email" type="email" inputMode="email" value={f.email} onChange={v => set({ email: v })} placeholder="you@email.com" error={e('email')}/>
          <Field label="Mobile number" type="tel" inputMode="tel" prefix="+92" value={f.phone} onChange={v => set({ phone: v.replace(/[^\d ]/g, '').slice(0, 12) })} placeholder="300 1234567" error={e('phone')} hint="We'll send a 6-digit code to verify"/>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
            <div className="flex gap-2 flex-wrap">
              {['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi'].map(c => (
                <button key={c} type="button" onClick={() => set({ city: c })}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${f.city === c ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-600'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Field label="Password" type="password" value={f.password} onChange={v => set({ password: v })} placeholder="Create a password" error={e('password')} hint="Minimum 8 characters"/>
          <button type="button" onClick={() => set({ agree: !f.agree })} className={`w-full flex items-start gap-3 p-3 rounded-xl text-left ${e('agree') ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <Check checked={f.agree}/>
            <span className="text-xs text-gray-600">
              I agree to DoAura's <span className="text-emerald-700 font-semibold">Terms of Service</span> and <span className="text-emerald-700 font-semibold">Privacy Policy</span>
            </span>
          </button>
        </div>
      </div>
      <BottomBar>
        <Button className="w-full" onClick={submit}>Continue</Button>
      </BottomBar>
    </div>
  )
}

// ------------------------------------------------------------------
// OTP
// ------------------------------------------------------------------

export function OtpScreen({ phone, step, total, onBack, onVerify }: {
  phone: string
  step?: number
  total?: number
  onBack: () => void
  onVerify: () => void
}) {
  const [code, setCode] = useState('')
  const [left, setLeft] = useState(30)
  const [verifying, setVerifying] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  const verify = () => {
    setVerifying(true)
    setTimeout(onVerify, 900)
  }

  // Auto-submit once all six digits are in.
  useEffect(() => {
    if (code.length === 6 && !verifying) verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="flex flex-col h-full bg-white">
      <AppHeader title="Verify your number" onBack={onBack} step={step} total={total}/>
      <div className="flex-1 flex flex-col items-center px-5 py-8">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5">
          <ShieldIcon size={28} className="text-emerald-500"/>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Enter the 6-digit code</h2>
        <p className="text-gray-500 text-sm text-center">Sent by SMS to</p>
        <p className="font-bold text-gray-900 mb-7">{phone}</p>

        <OtpInput value={code} onChange={setCode}/>

        <div className="mt-6 text-sm text-gray-500 text-center">
          {left > 0 ? (
            <>Resend code in <span className="font-bold text-gray-800">0:{String(left).padStart(2, '0')}</span></>
          ) : (
            <button onClick={() => { setLeft(30); setResent(true); setCode('') }} className="text-emerald-600 font-bold">Resend code</button>
          )}
        </div>
        {resent && <div className="text-xs text-emerald-600 mt-2 anim-fade-in">A new code was sent ✓</div>}
        <button onClick={onBack} className="mt-4 text-sm text-gray-500 underline">Change phone number</button>

        <button onClick={() => setCode('482193')} className="mt-8 text-[11px] text-gray-400 border border-dashed border-gray-300 rounded-lg px-3 py-1.5">
          Prototype: tap to auto-fill code
        </button>
      </div>
      <BottomBar>
        <Button className="w-full" disabled={code.length < 6} loading={verifying} onClick={verify}>
          {verifying ? 'Verifying…' : 'Verify & Continue'}
        </Button>
      </BottomBar>
    </div>
  )
}
