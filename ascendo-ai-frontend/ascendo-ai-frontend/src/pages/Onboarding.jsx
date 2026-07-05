import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AnimatedInput from '../components/AnimatedInput'
import FileUpload from '../components/FileUpload'
import Logo from '../components/Logo'
import { PageTransition } from '../components/Motion'
import PricingModal from '../components/PricingModal'
import { uploadOnboarding, startAnalysis, setProjectId } from '../lib/api'

export function OnboardInput() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPricing, setShowPricing] = useState(Boolean(location.state?.showPricing))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  useEffect(() => {
    if (location.state?.showPricing) navigate(location.pathname, { replace: true, state: {} })
  }, [])
  const [files, setFiles] = useState([])
  const [form, setForm] = useState({
    name: '',
    decision: '',
    description: '',
    website: '',
  })

  const canRun = form.name.trim()

  const run = async () => {
    if (!canRun || loading) return
    setLoading(true)
    setError('')
    setLimitReached(false)
    try {
      const body = new FormData()
      body.append('name', form.name)
      body.append('decision_query', form.decision)
      body.append('business_description', form.description)
      body.append('website_url', form.website)
      files.forEach((file) => body.append('files', file))

      const { project_id } = await uploadOnboarding(body)
      setProjectId(project_id)
      await startAnalysis(project_id)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Could not start your analysis. Please try again.')
      setLimitReached(err.status === 402)
      setLoading(false)
    }
  }

  return (
    <PageTransition className="min-h-screen bg-bg relative overflow-hidden">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[110px] pointer-events-none" />
      <div className="absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-amber/10 blur-[100px] pointer-events-none" />

      <header className="container-page flex items-center justify-between border-b border-black/[0.05] py-5 relative z-10">
        <Logo />
        <span className="rounded-full border border-black/[0.06] bg-white px-3.5 py-1.5 text-xs font-bold text-textMuted">
          Workspace setup
        </span>
      </header>

      <main className="container-page py-10 md:py-16 relative z-10">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow">Let's get started</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold md:text-5xl text-espresso">
              What decision are you trying to make?
            </h1>
            <p className="mt-3 text-textMuted">
              Tell us about your business. Your agent council structures what matters and builds your growth plan.
            </p>
          </motion.div>

          <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 rounded-[28px] border border-black/[0.06] bg-white/70 p-6 backdrop-blur-xl shadow-warm md:p-9"
          >
            <div className="space-y-5">
              <AnimatedInput
                label="Business name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <AnimatedInput
                label="What decision are you trying to make?"
                value={form.decision}
                onChange={(e) => setForm({ ...form, decision: e.target.value })}
              />
              <AnimatedInput
                multiline
                rows={6}
                label="Tell us about your business"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <AnimatedInput
                label="Website URL"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />

              <div>
                <span className="mb-3 block text-sm font-bold text-espresso">Supporting documents (optional)</span>
                <FileUpload onChange={setFiles} />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/[0.06] pt-6">
              {error && (
                <p className="text-xs font-semibold text-danger">
                  {error}
                  {limitReached && (
                    <button type="button" onClick={() => setShowPricing(true)} className="ml-2 font-bold text-primary underline">
                      View plans
                    </button>
                  )}
                </p>
              )}
              <button onClick={run} disabled={!canRun || loading} className="btn-primary ml-auto min-w-48 disabled:cursor-not-allowed disabled:opacity-40">
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Sparkles size={17} /> Run analysis
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </PageTransition>
  )
}
