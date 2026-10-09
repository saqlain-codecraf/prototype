import { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar, EmptyState, IconTile, ScreenHeader, StatusBar, headerSurface, useTone } from './ui'
import { ChevronLeft, PhoneIcon, CameraIcon, ChevronRight, Glyph } from './Icons'
import { nowTime, uid } from '../data/jobs'

export interface ChatMessage {
  id: string
  from: 'me' | 'them' | 'system'
  text: string
  time: string
  image?: string
}

export interface Conversation {
  id: string
  title: string
  emoji: string
  otherName: string
  otherPhone: string
  status: string
  messages: ChatMessage[]
  unread: number
}

/** Job-scoped conversations with a simulated reply from the other party. */
export function useConversations(replyBank: string[]) {
  const [convos, setConvos] = useState<Record<string, Conversation>>({})
  const [typing, setTyping] = useState<Record<string, boolean>>({})
  const replyIdx = useRef(0)

  const ensure = useCallback((c: Omit<Conversation, 'messages' | 'unread'>, first?: ChatMessage[]) => {
    setConvos(p => (p[c.id] ? p : { ...p, [c.id]: { ...c, messages: first ?? [], unread: first?.filter(m => m.from === 'them').length ?? 0 } }))
  }, [])

  const push = useCallback((id: string, from: ChatMessage['from'], text: string) => {
    setConvos(p => {
      const c = p[id]
      if (!c) return p
      const msg = { id: uid(), from, text, time: nowTime() }
      return { ...p, [id]: { ...c, messages: [...c.messages, msg], unread: from === 'them' ? c.unread + 1 : c.unread } }
    })
  }, [])

  const setStatus = useCallback((id: string, status: string) => {
    setConvos(p => (p[id] ? { ...p, [id]: { ...p[id], status } } : p))
  }, [])

  const markRead = useCallback((id: string) => {
    setConvos(p => (p[id] && p[id].unread ? { ...p, [id]: { ...p[id], unread: 0 } } : p))
  }, [])

  const send = useCallback((id: string, text: string, image?: string) => {
    setConvos(p => {
      const c = p[id]
      if (!c) return p
      return { ...p, [id]: { ...c, messages: [...c.messages, { id: uid(), from: 'me', text, image, time: nowTime() }] } }
    })
    setTimeout(() => setTyping(t => ({ ...t, [id]: true })), 700)
    setTimeout(() => {
      setTyping(t => ({ ...t, [id]: false }))
      const reply = replyBank[replyIdx.current++ % replyBank.length]
      setConvos(p => {
        const c = p[id]
        if (!c) return p
        return { ...p, [id]: { ...c, messages: [...c.messages, { id: uid(), from: 'them', text: reply, time: nowTime() }] } }
      })
    }, 2200)
  }, [replyBank])

  const unreadTotal = Object.values(convos).reduce((a, c) => a + c.unread, 0)
  return { convos, typing, ensure, push, send, setStatus, markRead, unreadTotal }
}

export function ChatScreen({ convo, typing, onBack, onSend, onRead, quickReplies, onViewJob }: {
  convo: Conversation
  typing: boolean
  onBack: () => void
  onSend: (text: string, image?: string) => void
  onRead: () => void
  quickReplies: string[]
  onViewJob?: () => void
}) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const h = headerSurface(useTone())
  const readRef = useRef(onRead)
  readRef.current = onRead

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    readRef.current()
  }, [convo.messages.length, typing])

  const submit = () => {
    const t = input.trim()
    if (!t) return
    onSend(t)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-canvas">
      <div className={`${h.bg} flex-shrink-0`}>
        <StatusBar light={h.dark}/>
        <div className="flex items-center gap-3 px-4 pt-1 pb-3">
          <button onClick={onBack} aria-label="Back" className={`size-touch flex items-center justify-center rounded-full ${h.btn}`}>
            <ChevronLeft size={22}/>
          </button>
          <Avatar name={convo.otherName} size={40} ring={h.dark}/>
          <div className="flex-1 min-w-0">
            <div className={`font-bold text-body truncate ${h.text}`}>{convo.otherName}</div>
            <div className={`text-small font-medium truncate flex items-center gap-1.5 ${h.sub}`}>
              <span className="w-2 h-2 rounded-full bg-success"/>{typing ? 'typing…' : 'Online'}
            </div>
          </div>
          <a href={`tel:${convo.otherPhone.replace(/\s/g, '')}`} aria-label="Call" className={`size-touch flex items-center justify-center rounded-full ${h.dark ? 'bg-accent text-ink' : 'bg-mint text-brand'}`}>
            <PhoneIcon size={20}/>
          </a>
        </div>
      </div>
      {/* Job reference */}
      <button onClick={onViewJob} className="mx-4 mt-3 w-[calc(100%-2rem)] min-h-touch px-3 py-2.5 bg-surface rounded-card border border-line flex items-center gap-3 text-left flex-shrink-0">
        <IconTile size={40}><Glyph e={convo.emoji} size={20}/></IconTile>
        <div className="flex-1 min-w-0">
          <div className="text-ui font-bold text-ink truncate">{convo.title}</div>
          <div className="text-small text-brand font-bold truncate">{convo.status}</div>
        </div>
        {onViewJob && <ChevronRight size={18} className="text-brand"/>}
      </button>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {convo.messages.length === 0 && (
          <div className="text-center text-small text-subtle py-6">Say hello. Messages here are linked to this job.</div>
        )}
        {convo.messages.map(m => {
          if (m.from === 'system') {
            return (
              <div key={m.id} className="flex justify-center">
                <span className="text-small bg-surface border border-divider text-muted px-3 py-1 rounded-full">{m.text}</span>
              </div>
            )
          }
          const mine = m.from === 'me'
          return (
            <div key={m.id} className={`flex items-end gap-2 anim-slide-up ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && <Avatar name={convo.otherName} size={26}/>}
              <div className="max-w-[74%]">
                <div className={`rounded-card text-body overflow-hidden ${mine ? 'bg-brand text-white rounded-br-sm' : 'bg-surface text-ink rounded-bl-sm border border-divider'}`}>
                  {m.image && <img src={m.image} alt="" className="w-48 h-36 object-cover"/>}
                  {m.text && <div className="px-4 py-2.5">{m.text}</div>}
                </div>
                <div className={`text-tab text-subtle mt-1 ${mine ? 'text-right' : ''}`}>{m.time}{mine && ' · Sent'}</div>
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex items-end gap-2">
            <Avatar name={convo.otherName} size={26}/>
            <div className="bg-surface border border-divider rounded-card rounded-bl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 bg-subtle rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <div className="bg-surface border-t border-divider flex-shrink-0">
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
          {quickReplies.map(q => (
            <button key={q} onClick={() => onSend(q)} className="flex-shrink-0 px-3 py-1.5 bg-divider text-label text-small font-bold rounded-full active:bg-mint">
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 pb-7 pt-3">
          <button onClick={() => fileRef.current?.click()} aria-label="Attach photo" className="w-10 h-10 bg-divider rounded-full flex items-center justify-center flex-shrink-0">
            <CameraIcon size={18} className="text-muted"/>
          </button>
          <input
            ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) onSend('', URL.createObjectURL(f))
              e.target.value = ''
            }}
          />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit() }}
            placeholder="Type a message…"
            className="flex-1 min-w-0 bg-divider rounded-full px-4 py-2.5 text-body text-ink placeholder-subtle outline-none focus:ring-2 focus:ring-mint"
          />
          <button
            onClick={submit}
            disabled={!input.trim()}
            aria-label="Send"
            className="w-10 h-10 bg-brand rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M14.5 1.5l-13 5 5 2 2 5.5 6-12.5z"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export function ConversationList({ convos, onOpen, emptyText }: {
  convos: Conversation[]
  onOpen: (id: string) => void
  emptyText: string
}) {
  return (
    <div className="flex flex-col h-full bg-canvas">
      <ScreenHeader title="Messages" subtitle="Each chat belongs to a job"/>
      <div className="flex-1 overflow-y-auto">
        {convos.length === 0 ? (
          <EmptyState emoji={<Glyph e="💬"/>} title="No conversations yet" desc={emptyText}/>
        ) : (
          <div className="bg-surface">
            {convos.map(c => {
              const last = c.messages[c.messages.length - 1]
              return (
                <button key={c.id} onClick={() => onOpen(c.id)} className="w-full flex items-center gap-3 px-5 py-4 border-b border-divider text-left active:bg-canvas">
                  <div className="relative">
                    <Avatar name={c.otherName} size={48}/>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface rounded-full flex items-center justify-center text-body shadow"><Glyph e={c.emoji}/></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-body text-ink truncate">{c.otherName}</span>
                      <span className="text-tab text-subtle flex-shrink-0">{last?.time}</span>
                    </div>
                    <div className="text-small text-brand font-bold truncate">{c.title} · {c.status}</div>
                    <div className={`text-small truncate mt-0.5 ${c.unread ? 'text-ink font-bold' : 'text-muted'}`}>
                      {last ? (last.from === 'me' ? 'You: ' : '') + (last.text || 'Photo') : 'Start the conversation'}
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="min-w-5 h-5 px-1.5 bg-brand text-white text-tab font-bold rounded-full flex items-center justify-center">{c.unread}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
