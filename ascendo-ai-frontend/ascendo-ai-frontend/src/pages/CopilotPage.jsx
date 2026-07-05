import { motion } from 'framer-motion'
import { ArrowUp, Bot, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { askCopilot, getProjectId } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

const prompts=['What should I focus on this week?','What is our biggest revenue opportunity?','Draft a lead reactivation plan']

function greetingNameFor(user) {
  if (user?.full_name) return user.full_name.split(' ')[0]
  if (user?.email) return user.email.split('@')[0]
  return ''
}

export default function CopilotPage(){
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages,setMessages]=useState(()=>{
    const name = greetingNameFor(user)
    const greeting = name ? `Hi ${name}` : 'Hi there'
    return [{role:'bot',text:`${greeting} — I’ve read your latest business analysis. Ask me anything about your scores, risks, or next moves.`}]
  });const [input,setInput]=useState('');const [typing,setTyping]=useState(false)
  const send=async(text=input)=>{
    if(!text.trim()||typing)return
    const projectId = getProjectId()
    if(!projectId){ navigate('/onboarding'); return }
    setMessages(m=>[...m,{role:'user',text}]);setInput('');setTyping(true)
    try {
      const res=await askCopilot(projectId, text)
      setMessages(m=>[...m,{role:'bot',text:res.answer}])
    } catch (err) {
      setMessages(m=>[...m,{role:'bot',text:err.message || 'Something went wrong answering that.'}])
    } finally {
      setTyping(false)
    }
  }
  return <AppShell title="Ascendo Copilot" subtitle="Ask questions grounded in your business analysis."><div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_280px]"><section className="card flex min-h-[calc(100vh-170px)] flex-col overflow-hidden"><div className="border-b border-black/[.06] p-5"><div className="flex items-center gap-3"><span className="relative grid h-11 w-11 place-items-center rounded-xl bg-espresso text-white"><Bot size={20}/><i className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-success"/></span><div><b className="block">Business Copilot</b><small className="text-success">Online · analysis connected</small></div></div></div><div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-7">{messages.map((m,i)=><motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} key={i} className={`flex gap-3 ${m.role==='user'?'flex-row-reverse':''}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${m.role==='bot'?'bg-espresso text-white':'bg-peach text-primary'}`}>{m.role==='bot'?<Sparkles size={15}/>:<User size={15}/>}</span><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role==='bot'?'bg-bg text-textDark':'bg-primary text-white'}`}><ReactMarkdown>{m.text}</ReactMarkdown></div></motion.div>)}{typing&&<div className="flex gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-espresso text-white"><Sparkles size={15}/></span><span className="flex gap-1 rounded-2xl bg-bg px-4 py-4">{[0,1,2].map(i=><motion.i key={i} animate={{y:[0,-5,0]}} transition={{repeat:Infinity,duration:.7,delay:i*.12}} className="h-2 w-2 rounded-full bg-primary"/>)}</span></div>}</div><div className="border-t border-black/[.06] p-4"><div className="mb-3 flex gap-2 overflow-x-auto">{prompts.map(x=><button onClick={()=>send(x)} key={x} className="whitespace-nowrap rounded-full border border-black/10 px-3 py-2 text-[11px] font-bold text-textMuted hover:border-primary/30 hover:text-primary">{x}</button>)}</div><div className="flex items-end gap-2 rounded-2xl bg-bg p-2"><textarea rows="1" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask Ascendo about your business…" className="max-h-28 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"/><button onClick={()=>send()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-glow"><ArrowUp size={18}/></button></div><p className="mt-2 text-center text-[10px] text-textMuted">Responses use your latest analysis. Always review before acting.</p></div></section><aside className="space-y-4"><div className="card p-5"><p className="eyebrow">Connected context</p><h3 className="mt-2 font-display font-extrabold">June analysis</h3><p className="mt-2 text-xs leading-relaxed text-textMuted">6 scores · 12 findings · 4 recommendations</p><div className="mt-4 h-1.5 rounded-full bg-peach"><div className="h-full w-full rounded-full bg-primary"/></div></div><div className="rounded-2xl bg-espresso p-5 text-white"><Sparkles className="text-primary" size={20}/><h3 className="mt-4 font-display font-extrabold">Try asking</h3><p className="mt-2 text-xs leading-relaxed text-white/45">“Turn my recommendations into a Monday morning action list.”</p></div></aside></div></AppShell>
}
