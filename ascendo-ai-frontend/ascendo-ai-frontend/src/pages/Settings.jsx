import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Building2, Check, CreditCard, LockKeyhole, Sparkles, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AnimatedInput from '../components/AnimatedInput'
import AppShell from '../components/AppShell'
import PricingModal from '../components/PricingModal'
import { useAuth } from '../lib/AuthContext'
import { createPortalSession, getBillingStatus } from '../lib/api'

const PLAN_LABELS = { none: 'No active plan', starter: 'Starter', growth: 'Growth', scale: 'Scale' }
const STATUS_TONE = {
  active: 'bg-success/10 text-success',
  trialing: 'bg-success/10 text-success',
  past_due: 'bg-danger/10 text-danger',
  canceled: 'bg-black/5 text-textMuted',
  none: 'bg-black/5 text-textMuted',
}

function BillingTab() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [billing, setBilling] = useState(null)
  const [error, setError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const banner = searchParams.get('billing')

  useEffect(() => {
    getBillingStatus().then(setBilling).catch((err) => setError(err.message || 'Could not load billing status.'))
  }, [])

  useEffect(() => {
    if (banner) {
      const timer = setTimeout(() => setSearchParams({}, { replace: true }), 6000)
      return () => clearTimeout(timer)
    }
  }, [banner, setSearchParams])

  const manageSubscription = async () => {
    setPortalLoading(true)
    try {
      const { portal_url } = await createPortalSession()
      window.location.href = portal_url
    } catch (err) {
      setError(err.message || 'Could not open the billing portal.')
      setPortalLoading(false)
    }
  }

  if (error) return <p className="mt-8 text-sm font-semibold text-danger">{error}</p>
  if (!billing) return <p className="mt-8 text-sm text-textMuted">Loading billing details…</p>

  const plan = billing.plan || 'none'
  const status = billing.subscription_status || 'none'
  const usageLabel =
    plan === 'starter'
      ? `${billing.projects_this_month} of 1 analyses used this month`
      : plan === 'none'
        ? `${billing.lifetime_projects} of 1 free analysis used`
        : `${billing.projects_this_month} analyses this month · unlimited`

  return (
    <div className="mt-8 space-y-6">
      {banner && (
        <div className={`rounded-xl p-4 text-sm font-semibold ${banner === 'success' ? 'bg-success/10 text-success' : 'bg-warn/10 text-warn'}`}>
          {banner === 'success' ? 'Subscription confirmed — thanks for upgrading!' : 'Checkout was cancelled — your plan is unchanged.'}
        </div>
      )}

      <div className="rounded-2xl border border-black/[0.06] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-textMuted">Current plan</p>
            <p className="mt-1 font-display text-xl font-extrabold text-espresso">{PLAN_LABELS[plan] || plan}</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${STATUS_TONE[status] || STATUS_TONE.none}`}>
            {status.replace('_', ' ')}
          </span>
        </div>
        <p className="mt-3 text-xs text-textMuted">{usageLabel}</p>
        {billing.current_period_end && (
          <p className="mt-1 text-xs text-textMuted">
            Renews {new Date(billing.current_period_end).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setShowPricing(true)} className="btn-primary px-4 py-2.5 text-xs">
            <Sparkles size={14} /> {plan === 'none' ? 'Choose a plan' : 'Change plan'}
          </button>
          {plan !== 'none' && (
            <button type="button" onClick={manageSubscription} disabled={portalLoading} className="btn-secondary px-4 py-2.5 text-xs disabled:opacity-50">
              {portalLoading ? 'Opening…' : 'Manage subscription'}
            </button>
          )}
        </div>
      </div>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}

export default function Settings(){
  const { user } = useAuth()
  const [tab,setTab]=useState('Account');const [saved,setSaved]=useState(false);const [password,setPassword]=useState('');const strength=useMemo(()=>Math.min(100,password.length*10+(/[A-Z]/.test(password)?15:0)+(/[0-9]/.test(password)?15:0)),[password])
  const save=e=>{e.preventDefault();setSaved(true);setTimeout(()=>setSaved(false),2200)}
  const tabs=[['Account',User],['Business',Building2],['Billing',CreditCard],['Security',LockKeyhole],['Preferences',Bell]]
  return <AppShell title="Settings" subtitle="Manage your account, business, and preferences."><div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-[220px_1fr]"><aside className="card h-fit p-2">{tabs.map(([name,Icon])=><button key={name} onClick={()=>setTab(name)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${tab===name?'bg-espresso text-white':'text-textMuted hover:bg-bg hover:text-textDark'}`}><Icon size={17}/>{name}</button>)}</aside><motion.form key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} onSubmit={save} className="card p-6 md:p-8"><h2 className="font-display text-2xl font-extrabold">{tab}</h2><p className="mt-1 text-sm text-textMuted">{tab==='Account'?'Keep your profile information up to date.':tab==='Business'?'The business context used by your AI council.':tab==='Billing'?'Manage your subscription and usage.':tab==='Security'?'Update your password and account security.':'Choose how Ascendo keeps you informed.'}</p>{tab==='Account'&&<div className="mt-8 space-y-5"><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-peach font-display text-xl font-extrabold text-espresso">{(user?.full_name||'?').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]?.toUpperCase()).join('')||'?'}</span><div><button type="button" className="text-sm font-bold text-primary">Change photo</button><p className="text-xs text-textMuted">JPG or PNG, max 2 MB</p></div></div><AnimatedInput label="Full name" value={user?.full_name||''} onChange={()=>{}}/><AnimatedInput label="Email address" type="email" value={user?.email||''} onChange={()=>{}}/></div>}{tab==='Business'&&<div className="mt-8 grid gap-5 sm:grid-cols-2"><AnimatedInput label="Business name" value="Northstar Studio" onChange={()=>{}}/><AnimatedInput label="Industry" value="Professional services" onChange={()=>{}}/><AnimatedInput label="Team size" value="12" onChange={()=>{}}/><AnimatedInput label="Annual revenue" value="$620,000" onChange={()=>{}}/><label className="sm:col-span-2"><span className="text-xs font-bold text-primary">Business description</span><textarea defaultValue="A product strategy and design studio helping B2B companies launch new digital products." rows="4" className="mt-2 w-full rounded-xl border border-black/10 p-4 text-sm outline-none focus:border-primary"/></label></div>}{tab==='Billing'&&<BillingTab/>}{tab==='Security'&&<div className="mt-8 space-y-5"><AnimatedInput label="Current password" type="password" value="" onChange={()=>{}}/><AnimatedInput label="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><div className="flex gap-1">{[25,50,75,100].map(x=><span key={x} className={`h-1.5 flex-1 rounded-full ${strength>=x?(strength<50?'bg-danger':strength<75?'bg-warn':'bg-success'):'bg-black/10'}`}/>)}</div><AnimatedInput label="Confirm new password" type="password" value="" onChange={()=>{}}/></div>}{tab==='Preferences'&&<div className="mt-8 space-y-3">{[['Weekly growth digest','A concise summary every Monday morning.'],['Risk alerts','Get notified when an agent finds a high-priority risk.'],['Analysis complete','Know the moment your AI council finishes.']].map(([a,b],i)=><label key={a} className="flex items-center gap-4 rounded-xl border border-black/[.07] p-4"><span className="flex-1"><b className="block text-sm">{a}</b><small className="text-textMuted">{b}</small></span><input type="checkbox" defaultChecked={i<2} className="h-5 w-5 accent-primary"/></label>)}</div>}{tab!=='Billing'&&<div className="mt-9 flex justify-end border-t border-black/[.06] pt-6"><button className="btn-primary">Save changes</button></div>}</motion.form></div><AnimatePresence>{saved&&<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-espresso px-5 py-4 text-sm font-bold text-white shadow-2xl"><span className="grid h-6 w-6 place-items-center rounded-full bg-success"><Check size={14}/></span>Changes saved</motion.div>}</AnimatePresence></AppShell>
}
