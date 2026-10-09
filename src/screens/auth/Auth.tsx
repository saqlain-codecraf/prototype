import { useEffect, useState } from 'react'
import { AppHeader, BottomBar, Button, Check, Chip, Field, IconTile, Logo, OtpInput, Sheet, StatusBar } from '../../components/ui'
import { ShieldIcon, CheckIcon, Glyph } from '../../components/Icons'

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

export { Logo }

// ------------------------------------------------------------------
// Splash
// ------------------------------------------------------------------

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="flex flex-col h-full bg-brand text-white">
      <StatusBar light/>
      <div className="flex-1 flex flex-col items-center justify-center anim-fade-in">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <span className="radar-ring" style={{ borderColor: 'var(--color-accent)' }}/>
          <div className="anim-bounce-in"><Logo size={96}/></div>
        </div>
        <div className="mt-6 display text-[40px] leading-none anim-slide-up" style={{ animationDelay: '0.15s' }}>Doaura</div>
        <div className="mt-2 text-body text-white/80 anim-slide-up" style={{ animationDelay: '0.25s' }}>Trusted pros, right around the corner</div>
      </div>
      <div className="px-16 pb-14">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full anim-grow" style={{ animationDuration: '1.7s' }}/>
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
    <div className="relative flex flex-col h-full bg-canvas">
      <StatusBar/>
      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-4 anim-fade-in">
        <Logo wordmark/>
        <h1 className="text-title display text-ink mt-8">Welcome back</h1>
        <p className="text-muted text-body mt-2 mb-7">Log in to hire a pro or pick up jobs near you.</p>

        <form className="space-y-4" onSubmit={e => { e.preventDefault(); submit() }}>
          <Field label="Email or phone" value={id} onChange={v => { setId(v); setError('') }} placeholder="you@email.com or 0300 1234567" inputMode="email"/>
          <div>
            <Field label="Password" type="password" value={pw} onChange={v => { setPw(v); setError('') }} placeholder="Your password"/>
            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => { setForgot(true); setResetSent(false) }} className="min-h-touch text-ui font-bold text-brand underline-offset-4 hover:underline">Forgot password?</button>
            </div>
          </div>
          {error && (
            <div className="px-4 py-3 bg-danger-tint rounded-input text-ui font-bold text-danger anim-fade-in" role="alert">{error}</div>
          )}
          <Button type="submit" className="w-full" loading={loading}>{loading ? 'Logging in…' : 'Log in'}</Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-divider"/><span className="text-ui text-muted font-bold">New to Doaura?</span><div className="flex-1 h-px bg-divider"/>
        </div>
        <Button variant="secondary" className="w-full" onClick={onRegister}>Create an account</Button>

        {demo.length > 0 && (
          <div className="mt-8 p-4 rounded-card bg-surface border border-line">
            <div className="text-ui font-bold text-label mb-3">Demo accounts (prototype)</div>
            <div className="flex gap-2">
              {demo.map(a => (
                <button key={a.profile.email} type="button" onClick={() => { setId(a.profile.email); setPw(a.password); setError('') }}
                  className="flex-1 text-left p-3 min-h-touch rounded-tile bg-mint active:bg-placeholder">
                  <div className="text-ui font-bold text-brand">{a.role === 'hirer' ? 'Hirer' : 'Worker'}</div>
                  <div className="text-small text-muted truncate">{a.profile.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="px-6 pb-6 pt-2 text-center text-small text-muted">
        By continuing you agree to our <span className="text-brand font-bold">Terms</span> & <span className="text-brand font-bold">Privacy Policy</span>
      </div>

      <Sheet open={forgot} onClose={() => setForgot(false)} title={resetSent ? undefined : 'Reset password'}>
        {resetSent ? (
          <div className="text-center py-4 anim-fade-in">
            <IconTile size={64} className="mx-auto mb-4"><CheckIcon size={30}/></IconTile>
            <div className="display text-ink text-heading">Check your messages</div>
            <p className="text-body text-muted mt-1 mb-5">We sent a reset link to <b className="text-ink">{id || 'your email'}</b>.</p>
            <Button className="w-full" onClick={() => setForgot(false)}>Back to log in</Button>
          </div>
        ) : (
          <div>
            <p className="text-body text-muted mb-4">Enter your email or phone and we'll send you a link to set a new password.</p>
            <Field label="Email or phone" value={id} onChange={setId} placeholder="you@email.com"/>
            <Button className="w-full mt-5" disabled={!id.trim()} onClick={() => setResetSent(true)}>Send reset link</Button>
          </div>
        )}
      </Sheet>
    </div>
  )
}

// ------------------------------------------------------------------
// Register step 0 — the only place we ask how they'll use Doaura
// ------------------------------------------------------------------

const ROLE_OPTIONS: { role: Role; emoji: string; title: string; desc: string; points: string[] }[] = [
  { role: 'hirer', emoji: '🏠', title: 'I need a service', desc: 'Hire trusted pros for your home or business', points: ['Post a job in a minute', 'Get live offers from nearby pros'] },
  { role: 'worker', emoji: '🧰', title: 'I want to work', desc: 'Earn by offering your skills nearby', points: ['Get job requests near you', 'Set your own price'] },
]

export function RolePicker({ onBack, onContinue }: { onBack: () => void; onContinue: (r: Role) => void }) {
  const [role, setRole] = useState<Role | null>(null)
  return (
    <div className="flex flex-col h-full bg-surface anim-slide-right">
      <AppHeader title="Create account" onBack={onBack}/>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <h2 className="text-title display text-ink">How will you use Doaura?</h2>
        <p className="text-muted text-body mt-1 mb-6">Pick one to get started.</p>
        <div className="space-y-3">
          {ROLE_OPTIONS.map(o => {
            const on = role === o.role
            return (
              <button key={o.role} onClick={() => setRole(o.role)}
                className={`w-full flex items-start gap-4 p-4 rounded-card border-2 text-left transition-all active:scale-[0.99] ${on ? 'border-brand bg-mint' : 'border-line bg-surface'}`}>
                <IconTile size={56} tone={on ? 'surface' : 'mint'}><Glyph e={o.emoji} size={26}/></IconTile>
                <div className="flex-1">
                  <div className="display text-[20px] text-ink">{o.title}</div>
                  <div className="text-small text-muted mt-0.5">{o.desc}</div>
                  <div className="mt-2 space-y-1">
                    {o.points.map(p => (
                      <div key={p} className="flex items-center gap-1.5 text-small text-muted"><CheckIcon size={12} className="text-brand"/>{p}</div>
                    ))}
                  </div>
                </div>
                <span className={`size-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${on ? 'bg-brand text-white' : 'border-2 border-line'}`}>{on && <CheckIcon size={16}/>}</span>
              </button>
            )
          })}
        </div>
      </div>
      <BottomBar>
        <Button className="w-full" disabled={!role} onClick={() => role && onContinue(role)}>Continue</Button>
        <div className="text-center text-body text-muted mt-3">
          Already have an account? <button onClick={onBack} className="text-brand font-bold">Log in</button>
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
    <div className="flex flex-col h-full bg-surface">
      <AppHeader title={role === 'worker' ? 'Join as a worker' : 'Create your account'} subtitle="Your details" onBack={onBack} step={step} total={total}/>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="text-heading display text-ink mb-1">Tell us about you</h2>
        <p className="text-muted text-body mb-5">
          {role === 'worker' ? 'This appears on your profile when you send offers.' : 'Workers see your name when you hire them.'}
        </p>
        <div className="space-y-4">
          <Field label="Full name" value={f.name} onChange={v => set({ name: v })} placeholder="Full name" error={e('name')}/>
          <Field label="Email" type="email" inputMode="email" value={f.email} onChange={v => set({ email: v })} placeholder="you@email.com" error={e('email')}/>
          <Field label="Mobile number" type="tel" inputMode="tel" prefix="+92" value={f.phone} onChange={v => set({ phone: v.replace(/[^\d ]/g, '').slice(0, 12) })} placeholder="300 1234567" error={e('phone')} hint="We'll send a 6-digit code to verify"/>
          <div>
            <label className="block text-ui font-bold text-label mb-1.5">City</label>
            <div className="flex gap-2 flex-wrap">
              {['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi'].map(c => (
                <Chip key={c} selected={f.city === c} onClick={() => set({ city: c })}>{c}</Chip>
              ))}
            </div>
          </div>
          <Field label="Password" type="password" value={f.password} onChange={v => set({ password: v })} placeholder="Create a password" error={e('password')} hint="Minimum 8 characters"/>
          <button type="button" onClick={() => set({ agree: !f.agree })} className={`w-full flex items-start gap-3 p-4 rounded-input text-left border ${e('agree') ? 'bg-danger-tint border-danger' : 'bg-surface border-line'}`}>
            <Check checked={f.agree}/>
            <span className="text-ui text-muted">
              I agree to Doaura's <span className="text-brand font-bold underline">Terms of Service</span> and <span className="text-brand font-bold underline">Privacy Policy</span>
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
    <div className="flex flex-col h-full bg-surface">
      <AppHeader title="Verify your number" onBack={onBack} step={step} total={total}/>
      <div className="flex-1 flex flex-col items-center px-5 py-8">
        <IconTile size={64} className="mb-5"><ShieldIcon size={30}/></IconTile>
        <h2 className="text-heading display text-ink mb-2">Enter the 6-digit code</h2>
        <p className="text-muted text-body text-center">Sent by SMS to</p>
        <p className="font-bold text-ink mb-7">{phone}</p>

        <OtpInput value={code} onChange={setCode}/>

        <div className="mt-6 text-body text-muted text-center">
          {left > 0 ? (
            <>Resend code in <span className="font-bold text-ink">0:{String(left).padStart(2, '0')}</span></>
          ) : (
            <button onClick={() => { setLeft(30); setResent(true); setCode('') }} className="text-brand font-bold">Resend code</button>
          )}
        </div>
        {resent && <div className="text-small text-brand mt-2 anim-fade-in">A new code was sent ✓</div>}
        <button onClick={onBack} className="mt-4 text-body text-muted underline">Change phone number</button>

        <button onClick={() => setCode('482193')} className="mt-8 text-small text-subtle border border-dashed border-line rounded-lg px-3 py-1.5">
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
