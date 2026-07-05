import { AnimatePresence, motion } from 'framer-motion'
import { Check, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { createCheckoutSession } from '../lib/api'

const plans = [
  {
    key: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/mo',
    tag: null,
    features: ['1 business analysis / month', 'Core growth engines', 'Strategic report export', 'Email support'],
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '$149',
    period: '/mo',
    tag: 'Most popular',
    features: ['Unlimited analyses', 'All 6 AI engines', 'Copilot chat access', 'Priority support', 'Version history'],
  },
  {
    key: 'scale',
    name: 'Scale',
    price: '$399',
    period: '/mo',
    tag: null,
    features: ['Everything in Growth', 'Multi-workspace access', 'Dedicated success manager', 'Custom integrations'],
  },
]

export default function PricingModal({ open, onClose }) {
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')

  const choose = async (planKey) => {
    if (loadingPlan) return
    setLoadingPlan(planKey)
    setError('')
    try {
      const { checkout_url } = await createCheckoutSession(planKey)
      window.location.href = checkout_url
    } catch (err) {
      setError(err.message || 'Could not start checkout. Please try again.')
      setLoadingPlan('')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative z-10 flex min-h-full items-center justify-center p-3 py-8 sm:p-4 sm:py-10">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="relative w-full max-w-4xl rounded-[24px] border border-white/40 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl sm:rounded-[28px] sm:bg-white/80 sm:p-7 md:p-10"
            >
              <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-textMuted transition hover:bg-black/5 hover:text-espresso sm:right-5 sm:top-5">
                <X size={20} />
              </button>

              <div className="pr-8 text-center sm:pr-0">
                <p className="eyebrow">Upgrade your workspace</p>
                <h2 className="mt-2 font-display text-xl font-extrabold text-espresso sm:text-2xl md:text-3xl">Choose the plan that fits your growth</h2>
                <p className="mt-2 text-sm text-textMuted">You can keep exploring on the free run — upgrade any time.</p>
                {error && <p className="mt-3 text-xs font-semibold text-danger">{error}</p>}
              </div>

              <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.key}
                    className={`relative rounded-2xl border p-5 transition duration-300 sm:p-6 ${
                      plan.tag ? 'border-primary/50 bg-primary/[0.06] shadow-glow md:-translate-y-2' : 'border-black/[0.06] bg-white'
                    }`}
                  >
                    {plan.tag && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-glow">
                        {plan.tag}
                      </span>
                    )}
                    <h3 className="font-display text-lg font-extrabold text-espresso">{plan.name}</h3>
                    <p className="mt-3">
                      <span className="font-display text-3xl font-extrabold text-espresso">{plan.price}</span>
                      <span className="text-sm text-textMuted">{plan.period}</span>
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-textMuted">
                          <Check size={14} className="mt-0.5 shrink-0 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => choose(plan.key)}
                      disabled={Boolean(loadingPlan)}
                      className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        plan.tag ? 'bg-primary text-white shadow-glow hover:-translate-y-0.5' : 'border border-black/[0.08] bg-white text-espresso hover:border-primary/40'
                      }`}
                    >
                      {loadingPlan === plan.key ? (
                        <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Redirecting…</span>
                      ) : plan.tag ? (
                        <span className="inline-flex items-center gap-1.5"><Sparkles size={14} /> Choose Growth</span>
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" onClick={onClose} className="mx-auto mt-6 block text-xs font-bold text-textMuted transition hover:text-espresso sm:mt-7">
                Continue with free run →
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
