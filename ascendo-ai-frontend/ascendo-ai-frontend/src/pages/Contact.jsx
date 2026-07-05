import { motion } from 'framer-motion'
import { CheckCircle2, Globe, Linkedin, Mail, MapPin, Send, Twitter } from 'lucide-react'
import { useState } from 'react'
import AppShell from '../components/AppShell'
import AnimatedInput from '../components/AnimatedInput'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
    setSent(true)
  }

  return (
    <AppShell title="Contact" subtitle="Reach the Ascendo team">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-9">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-success/15 text-success">
                <CheckCircle2 size={30} />
              </span>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-espresso">Message sent</h2>
              <p className="mt-2 max-w-sm text-sm text-textMuted">Thanks for reaching out — our team will get back to you within one business day.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }} className="btn-secondary mt-6">
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <p className="eyebrow">Get in touch</p>
              <h2 className="font-display text-2xl font-extrabold text-espresso">Send us a message</h2>
              <AnimatedInput label="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <AnimatedInput label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <AnimatedInput multiline rows={6} label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button type="submit" className="btn-primary min-w-40">
                <Send size={16} /> Send message
              </button>
            </form>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="card p-6">
            <p className="eyebrow">Company</p>
            <h3 className="mt-1 font-display text-lg font-extrabold text-espresso">Ascendo AI</h3>
            <div className="mt-4 space-y-3 text-sm text-textMuted">
              <p className="flex items-center gap-2.5"><Mail size={15} className="text-primary shrink-0" /> hello@ascendo.ai</p>
              <p className="flex items-center gap-2.5"><Globe size={15} className="text-primary shrink-0" /> ascendo.ai</p>
              <p className="flex items-center gap-2.5"><MapPin size={15} className="text-primary shrink-0" /> Remote-first · Worldwide</p>
            </div>
          </div>
          <div className="card p-6">
            <p className="eyebrow">Follow us</p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="grid h-10 w-10 place-items-center rounded-xl border border-black/[0.06] bg-white text-textMuted transition hover:border-primary/30 hover:text-primary"><Twitter size={16} /></a>
              <a href="#" className="grid h-10 w-10 place-items-center rounded-xl border border-black/[0.06] bg-white text-textMuted transition hover:border-primary/30 hover:text-primary"><Linkedin size={16} /></a>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
