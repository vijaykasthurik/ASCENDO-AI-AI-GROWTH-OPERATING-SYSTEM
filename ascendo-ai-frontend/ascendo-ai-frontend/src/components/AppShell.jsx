import { Menu, Play, Plus, X, Sparkles, User, ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import ReactMarkdown from 'react-markdown'
import { askCopilot, getProjectId } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import logoImg from '../logo-mark.svg'

function greetingNameFor(user) {
  if (user?.full_name) return user.full_name.split(' ')[0]
  if (user?.email) return user.email.split('@')[0]
  return ''
}

export default function AppShell({ title, subtitle, children, dark = false }) {
  const { user } = useAuth()
  const [menu, setMenu] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    const name = greetingNameFor(user)
    const greeting = name ? `Hi ${name}` : 'Hi there'
    return [{ role: 'bot', text: `${greeting} — I've loaded your workspace analytics. Ask me anything about your growth score, risks, or financial optimization.` }]
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [bubbleMessage, setBubbleMessage] = useState('Need help analyzing the $48K revenue opportunity?')
  const navigate = useNavigate()

  useEffect(() => {
    const bubblePrompts = [
      'Need help analyzing the $48K revenue opportunity?',
      'Ask me how to improve lead response times.',
      'I can draft a customer retention strategy for you.',
      'Ask me to summarize your risk alerts.'
    ]
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % bubblePrompts.length
      setBubbleMessage(bubblePrompts[index])
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const send = async (text = input) => {
    if (!text.trim() || typing) return
    const projectId = getProjectId()
    if (!projectId) { navigate('/onboarding'); return }
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setTyping(true)
    try {
      const res = await askCopilot(projectId, text)
      setMessages((m) => [...m, { role: 'bot', text: res.answer }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: err.message || 'Something went wrong answering that.' }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className={`min-h-screen relative ${dark ? 'bg-darkBg text-textLight' : 'bg-bg text-espresso'}`}>
      <Sidebar dark={dark} open={menu} onClose={() => setMenu(false)} />

      <main className="lg:pl-[245px]">
        <header className={`sticky top-0 z-20 flex min-h-[72px] items-center gap-2 border-b px-3 backdrop-blur-xl sm:min-h-[84px] sm:gap-4 sm:px-5 md:px-8 ${dark ? 'border-line/50 bg-darkBg/90 text-textLight' : 'border-black/[.05] bg-[#F8F4F0]/90 text-espresso'}`}>
          <button onClick={() => setMenu(true)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl lg:hidden ${dark ? 'bg-surface border border-line text-textLight' : 'bg-white'}`}><Menu size={20} /></button>
          <div className="mr-auto min-w-0">
            <h1 className="truncate font-display text-base font-extrabold sm:text-xl md:text-2xl">{title}</h1>
            <p className={`hidden truncate text-sm sm:block ${dark ? 'text-muted' : 'text-textMuted'}`}>{subtitle}</p>
          </div>
          <button onClick={() => navigate('/onboarding')} className={`hidden shrink-0 px-4 sm:inline-flex ${dark ? 'items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] text-sm font-bold text-textLight transition hover:-translate-y-0.5 hover:border-teal/40' : 'btn-secondary'}`}>
            <Play size={16} fill="currentColor" /><span className="hidden md:inline">Run analysis</span>
          </button>
          <button onClick={() => navigate('/onboarding')} className="btn-primary shrink-0 px-3 sm:px-4"><Plus size={16} /><span className="hidden md:inline">New analysis</span></button>
        </header>

        <div className="p-4 sm:p-5 md:p-8">{children}</div>
      </main>

      {/* Floating AI Copilot Bubble & Pulse Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {bubbleMessage && !copilotOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pointer-events-auto relative max-w-[230px] rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-3.5 shadow-2xl text-[11px] font-semibold text-espresso flex items-start gap-2.5"
            >
              <Sparkles size={14} className="text-primary shrink-0 mt-0.5 animate-pulse" />
              <div className="pr-4">
                <p className="leading-snug">{bubbleMessage}</p>
                <button onClick={() => setCopilotOpen(true)} className="mt-1.5 font-bold text-primary block hover:underline">Chat now</button>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setBubbleMessage('')
                }}
                className="absolute top-2.5 right-2.5 text-espresso/40 hover:text-espresso shrink-0 transition p-0.5 rounded-full hover:bg-black/5"
                title="Dismiss message"
              >
                <X size={11} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setCopilotOpen(!copilotOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -6, 0],
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 10px 25px rgba(242,100,48,0.2), 0 0 0 0px rgba(242,100,48,0.4)',
              '0 15px 35px rgba(242,100,48,0.4), 0 0 0 8px rgba(242,100,48,0)',
              '0 10px 25px rgba(242,100,48,0.2), 0 0 0 0px rgba(242,100,48,0)'
            ]
          }}
          transition={{
            y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
            scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
            boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          }}
          className="pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-primary p-2.5 text-white"
        >
          {copilotOpen ? <X size={22} /> : <img src={logoImg} alt="" className="h-full w-full rounded-full object-contain" />}
        </motion.button>
      </div>

      {/* Glassmorphic Copilot popup, bottom-right */}
      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(600px,calc(100vh-140px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-[26px] border border-white/40 bg-white/70 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-white/40 p-4">
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-espresso shadow-warm">
                  <img src={logoImg} alt="Ascendo" className="h-full w-full object-contain" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success" />
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-espresso">Ascendo Copilot</h3>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Analysis connected</p>
                </div>
              </div>
              <button onClick={() => setCopilotOpen(false)} className="rounded-lg p-1.5 text-textMuted transition hover:bg-black/5 hover:text-espresso">
                <X size={18} />
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${m.role === 'bot' ? 'bg-espresso text-white' : 'bg-peach/60 text-primary'}`}>
                    {m.role === 'bot' ? <Sparkles size={14} /> : <User size={14} />}
                  </span>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${m.role === 'bot' ? 'bg-white/80 text-espresso' : 'bg-primary text-white shadow-glow'}`}>
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-espresso text-white">
                    <Sparkles size={14} />
                  </span>
                  <span className="flex gap-1 rounded-2xl bg-white/80 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.i
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }}
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-black/[0.06] bg-white/40 p-3">
              <div className="flex items-end gap-2 rounded-xl border border-black/[0.08] bg-white/80 p-2 shadow-inner">
                <textarea
                  rows="1"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Ask Copilot about metrics or risks..."
                  className="max-h-24 flex-1 resize-none bg-transparent px-3 py-1.5 text-xs text-espresso placeholder:text-textMuted outline-none"
                />
                <button onClick={() => send()} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-white shadow-glow transition hover:bg-primary/95">
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
