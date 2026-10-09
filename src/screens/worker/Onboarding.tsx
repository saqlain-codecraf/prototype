import { useRef, useState } from 'react'
import { AppHeader, Badge, BottomBar, Button, Check } from '../../components/ui'
import { ChevronDown, ShieldIcon, UploadIcon, AlertCircle, ToolIcon, CheckIcon, Glyph } from '../../components/Icons'
import { CATEGORIES, rs } from '../../data/catalog'

// ------------------------------------------------------------------
// Documents
// ------------------------------------------------------------------

export interface DocFile {
  name: string
  preview?: string
}

export type DocKey = 'cnicFront' | 'cnicBack' | 'license' | 'certificate'

export type Docs = Partial<Record<DocKey, DocFile>>

const DOC_TYPES: { key: DocKey; title: string; subtitle: string; required: boolean; emoji: string }[] = [
  { key: 'cnicFront', title: 'CNIC — Front', subtitle: 'National identity card, front side', required: true, emoji: '🪪' },
  { key: 'cnicBack', title: 'CNIC — Back', subtitle: 'National identity card, back side', required: true, emoji: '🪪' },
  { key: 'license', title: 'Driving Licence', subtitle: 'If you travel with a vehicle', required: false, emoji: '🚗' },
  { key: 'certificate', title: 'Skill Certificate', subtitle: 'Trade or training certificate', required: false, emoji: '📜' },
]

export function DocumentsScreen({ docs, onChange, step, total, onBack, onNext, status }: {
  docs: Docs
  onChange: (d: Docs) => void
  step?: number
  total?: number
  onBack: () => void
  onNext: () => void
  status?: 'pending' | 'verified'
}) {
  const [uploading, setUploading] = useState<DocKey | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const target = useRef<DocKey | null>(null)

  const pick = (k: DocKey) => {
    target.current = k
    inputRef.current?.click()
  }

  const onFile = (f?: File) => {
    const k = target.current
    if (!f || !k) return
    setUploading(k)
    const preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
    setTimeout(() => {
      onChange({ ...docs, [k]: { name: f.name, preview } })
      setUploading(null)
    }, 900)
  }

  const requiredDone = DOC_TYPES.filter(d => d.required).every(d => docs[d.key])
  const inOnboarding = !!step

  return (
    <div className="flex flex-col h-full bg-surface">
      <AppHeader title="Verify your identity" subtitle="Documents" onBack={onBack} step={step} total={total}/>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {inOnboarding ? (
          <>
            <h2 className="text-xl display text-ink mb-1">Upload your documents</h2>
            <p className="text-muted text-body mb-4">Hirers only see a “Verified” badge — never your documents.</p>
          </>
        ) : (
          <div className={`flex items-center gap-3 p-4 rounded-card mb-4 ${status === 'verified' ? 'bg-mint' : 'bg-warn'}`}>
            <span className="text-2xl"><Glyph e={status === 'verified' ? '✅' : '⏳'}/></span>
            <div>
              <div className={`font-bold text-body ${status === 'verified' ? 'text-brand' : 'text-warn-ink'}`}>
                {status === 'verified' ? 'Your identity is verified' : 'Verification in progress'}
              </div>
              <div className="text-small text-muted">{status === 'verified' ? 'You can bid on all jobs.' : 'Usually takes a few minutes.'}</div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 p-3 bg-mint rounded-tile mb-5 text-brand">
          <AlertCircle size={16} className="text-brand mt-0.5 flex-shrink-0"/>
          <p className="text-small text-brand">Take clear photos in good light. All four corners of the card should be visible.</p>
        </div>

        <div className="space-y-3">
          {DOC_TYPES.map(d => {
            const file = docs[d.key]
            const busy = uploading === d.key
            return (
              <div key={d.key} className={`border-2 rounded-card p-4 transition-all ${file ? 'border-brand bg-mint/40' : 'border-divider'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-tile bg-surface border border-divider flex items-center justify-center overflow-hidden flex-shrink-0">
                    {file?.preview ? <img src={file.preview} alt="" className="w-full h-full object-cover"/> : <span className="text-2xl"><Glyph e={d.emoji}/></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-body text-ink">{d.title}</span>
                      {d.required ? <Badge label="Required" color="red"/> : <Badge label="Optional" color="gray"/>}
                    </div>
                    <div className="text-small text-muted truncate">{file ? file.name : d.subtitle}</div>
                  </div>
                  {file && !busy && (
                    <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center flex-shrink-0 anim-bounce-in">
                      <CheckIcon size={14} className="text-white"/>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => pick(d.key)}
                  disabled={busy}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-tile text-body font-bold transition-all ${
                    file ? 'bg-surface text-muted border border-line' : 'border-2 border-dashed border-line text-muted active:border-brand active:text-brand'
                  }`}
                >
                  {busy ? (
                    <><span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"/> Uploading…</>
                  ) : file ? 'Replace' : (<><UploadIcon size={16}/> Upload photo</>)}
                </button>
              </div>
            )
          })}
        </div>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden"
          onChange={e => { onFile(e.target.files?.[0]); e.target.value = '' }}/>
      </div>
      <BottomBar>
        {!requiredDone && <div className="text-center text-small text-subtle mb-2">Upload both sides of your CNIC to continue</div>}
        <Button className="w-full" disabled={!requiredDone} onClick={onNext}>
          <ShieldIcon size={18}/> {inOnboarding ? 'Submit & choose skills' : 'Save documents'}
        </Button>
      </BottomBar>
    </div>
  )
}

// ------------------------------------------------------------------
// Skills + tools
// ------------------------------------------------------------------

/** subId -> whether the worker owns the tools for it */
export type Skills = Record<string, { tools: boolean }>

export function SkillSelector({ value, onChange }: { value: Skills; onChange: (s: Skills) => void }) {
  const firstSelected = CATEGORIES.find(c => c.subs.some(s => value[s.id]))?.id ?? CATEGORIES[0].id
  const [open, setOpen] = useState<string | null>(firstSelected)

  const toggleSub = (id: string) => {
    const next = { ...value }
    if (next[id]) delete next[id]
    else next[id] = { tools: false }
    onChange(next)
  }
  const toggleTools = (id: string) => onChange({ ...value, [id]: { tools: !value[id]?.tools } })

  return (
    <div className="space-y-3">
      {CATEGORIES.map(cat => {
        const isOpen = open === cat.id
        const count = cat.subs.filter(s => value[s.id]).length
        return (
          <div key={cat.id} className={`border-2 rounded-card overflow-hidden transition-all ${count ? 'border-brand' : 'border-divider'}`}>
            <button onClick={() => setOpen(isOpen ? null : cat.id)} className={`w-full flex items-center gap-3 p-4 ${count ? 'bg-mint' : 'bg-surface'}`}>
              <span className="w-10 h-10 rounded-tile flex items-center justify-center text-xl bg-mint text-brand"><Glyph e={cat.emoji}/></span>
              <span className="flex-1 text-left">
                <span className="block font-bold text-ink">{cat.name}</span>
                <span className="block text-small text-muted">{cat.subs.length} services</span>
              </span>
              {count > 0 && <span className="text-small bg-brand text-white font-bold px-2 py-0.5 rounded-full">{count} selected</span>}
              <ChevronDown size={18} className={`text-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
            {isOpen && (
              <div className="px-3 pb-3 pt-1 space-y-2 anim-fade-in">
                {cat.subs.map(sub => {
                  const sel = value[sub.id]
                  return (
                    <div key={sub.id} className={`rounded-tile transition-all ${sel ? 'bg-surface border border-brand shadow-sm' : 'bg-canvas'}`}>
                      <button onClick={() => toggleSub(sub.id)} className="w-full flex items-center gap-3 p-3 text-left">
                        <Check checked={!!sel}/>
                        <span className="flex-1 min-w-0">
                          <span className="block text-body font-bold text-ink">{sub.name}</span>
                          <span className="block text-small text-muted">{sub.desc} · from {rs(sub.price)}/hr</span>
                        </span>
                      </button>
                      {sel && (
                        <div className="px-3 pb-3 anim-fade-in">
                          <div className="text-tab text-subtle mb-1.5 flex items-center gap-1">
                            <ToolIcon size={10}/> Needs: {sub.tools.join(', ')}
                          </div>
                          <button
                            onClick={() => toggleTools(sub.id)}
                            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-small font-bold border-2 transition-all ${
                              sel.tools ? 'bg-brand border-brand text-white' : 'bg-surface border-line text-muted'
                            }`}
                          >
                            {sel.tools ? <><CheckIcon size={13}/> I have the tools for this</> : <><ToolIcon size={13}/> Tap if you have the tools</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function SkillsScreen({ value, onChange, step, total, onBack, onNext, cta = 'Finish setup' }: {
  value: Skills
  onChange: (s: Skills) => void
  step?: number
  total?: number
  onBack: () => void
  onNext: () => void
  cta?: string
}) {
  const selected = Object.keys(value).length
  const withTools = Object.values(value).filter(v => v.tools).length
  return (
    <div className="flex flex-col h-full bg-surface">
      <AppHeader title="Your skills" subtitle="Categories & tools" onBack={onBack} step={step} total={total}/>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="text-xl display text-ink mb-1">What can you do?</h2>
        <p className="text-muted text-body mb-5">Pick the services you offer. Jobs that need tools are shown first to workers who have them.</p>
        <SkillSelector value={value} onChange={onChange}/>
      </div>
      <BottomBar>
        <div className="flex items-center justify-between text-small mb-2.5">
          <span className="text-muted"><b className="text-ink">{selected}</b> skills selected</span>
          <span className="text-muted"><b className="text-brand">{withTools}</b> with own tools</span>
        </div>
        <Button className="w-full" disabled={!selected} onClick={onNext}>{selected ? cta : 'Select at least one skill'}</Button>
      </BottomBar>
    </div>
  )
}
