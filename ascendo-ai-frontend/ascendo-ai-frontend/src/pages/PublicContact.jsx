import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Globe, Linkedin, Mail, MapPin, Send, Twitter } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AnimatedInput from '../components/AnimatedInput'
import Logo from '../components/Logo'
import { PageTransition } from '../components/Motion'
import LandingNav from '../components/LandingNav'

export default function PublicContact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
    setSent(true)
  }

  return (
    <PageTransition className="min-h-screen bg-[#fbf7f3] relative overflow-hidden">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[110px] pointer-events-none" />
      <div className="absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-amber/10 blur-[100px] pointer-events-none" />

      <LandingNav />

      <main className="container-page pt-28 pb-20 relative z-10">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Get in touch</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-espresso sm:text-4xl md:text-5xl">
              Let's talk about your growth.
            </h1>
            <p className="mt-3 text-textMuted">
              Questions about Ascendo, a partnership, or just want a demo? Send us a message — our team replies within one business day.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6 sm:p-8 md:p-9">
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
                  <AnimatedInput label="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <AnimatedInput label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <AnimatedInput multiline rows={6} label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  <button type="submit" className="btn-primary w-full sm:w-auto sm:min-w-40">
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
        </div>
      </main>
    </PageTransition>
  )
}
