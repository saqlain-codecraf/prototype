import { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar, EmptyState, StatusBar } from './ui'
import { ChevronLeft, PhoneIcon, CameraIcon, ChevronRight } from './Icons'
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
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <StatusBar/>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button onClick={onBack} aria-label="Back" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
            <ChevronLeft size={18} className="text-gray-700"/>
          </button>
          <Avatar name={convo.otherName} size={38}/>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-sm truncate">{convo.otherName}</div>
            <div className="text-[11px] text-emerald-600 font-medium truncate">{typing ? 'typing…' : 'Online'}</div>
          </div>
          <a href={`tel:${convo.otherPhone.replace(/\s/g, '')}`} aria-label="Call" className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-50">
            <PhoneIcon size={16} className="text-emerald-600"/>
          </a>
        </div>
        {/* Job reference */}
        <button onClick={onViewJob} className="mx-4 mb-3 w-[calc(100%-2rem)] px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-left">
          <span className="text-lg">{convo.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-gray-900 truncate">{convo.title}</div>
            <div className="text-[11px] text-emerald-700 truncate">{convo.status}</div>
          </div>
          {onViewJob && <ChevronRight size={14} className="text-emerald-600"/>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {convo.messages.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-6">Say hello 👋 Messages are linked to this job.</div>
        )}
        {convo.messages.map(m => {
          if (m.from === 'system') {
            return (
              <div key={m.id} className="flex justify-center">
                <span className="text-[11px] bg-white border border-gray-100 text-gray-500 px-3 py-1 rounded-full">{m.text}</span>
              </div>
            )
          }
          const mine = m.from === 'me'
          return (
            <div key={m.id} className={`flex items-end gap-2 anim-slide-up ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && <Avatar name={convo.otherName} size={26}/>}
              <div className="max-w-[74%]">
                <div className={`rounded-2xl text-sm overflow-hidden ${mine ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'}`}>
                  {m.image && <img src={m.image} alt="" className="w-48 h-36 object-cover"/>}
                  {m.text && <div className="px-4 py-2.5">{m.text}</div>}
                </div>
                <div className={`text-[10px] text-gray-400 mt-1 ${mine ? 'text-right' : ''}`}>{m.time}{mine && ' · Sent'}</div>
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex items-end gap-2">
            <Avatar name={convo.otherName} size={26}/>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <div className="bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
          {quickReplies.map(q => (
            <button key={q} onClick={() => onSend(q)} className="flex-shrink-0 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full active:bg-emerald-100">
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 pb-7 pt-3">
          <button onClick={() => fileRef.current?.click()} aria-label="Attach photo" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CameraIcon size={18} className="text-gray-500"/>
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
            className="flex-1 min-w-0 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <button
            onClick={submit}
            disabled={!input.trim()}
            aria-label="Send"
            className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all"
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
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <StatusBar/>
        <div className="px-5 py-3">
          <div className="font-extrabold text-gray-900 text-xl">Messages</div>
          <div className="text-xs text-gray-400">Each chat belongs to a job</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {convos.length === 0 ? (
          <EmptyState emoji="💬" title="No conversations yet" desc={emptyText}/>
        ) : (
          <div className="bg-white">
            {convos.map(c => {
              const last = c.messages[c.messages.length - 1]
              return (
                <button key={c.id} onClick={() => onOpen(c.id)} className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 text-left active:bg-gray-50">
                  <div className="relative">
                    <Avatar name={c.otherName} size={48}/>
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm shadow">{c.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-gray-900 truncate">{c.otherName}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{last?.time}</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold truncate">{c.title} · {c.status}</div>
                    <div className={`text-xs truncate mt-0.5 ${c.unread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      {last ? (last.from === 'me' ? 'You: ' : '') + (last.text || '📷 Photo') : 'Start the conversation'}
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="min-w-5 h-5 px-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{c.unread}</span>
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
