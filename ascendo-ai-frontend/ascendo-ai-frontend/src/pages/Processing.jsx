import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, Sparkles, Terminal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { PageTransition } from '../components/Motion'
import { getProject, getProjectId } from '../lib/api'

const POLL_MS = 1500

const STAGES = [
  { key: 'planning', statuses: ['uploaded', 'planning'], name: 'Team Planning', log: 'Assembling specialist agent team for this engagement…' },
  { key: 'running_agents', statuses: ['running_agents'], name: 'Agent Insights', log: 'Each agent is analyzing your inputs from its domain lens…' },
  { key: 'orchestrating', statuses: ['orchestrating'], name: 'Insights Orchestration', log: 'Cross-referencing agent findings on the shared blackboard…' },
  { key: 'finalizing', statuses: ['finalizing'], name: 'Report Synthesis', log: 'Synthesizing findings into a coherent growth narrative…' },
  { key: 'generating_engines', statuses: ['generating_engines'], name: 'Engine Generation', log: 'Generating Strategy, Marketing, Sales, and Growth engines…' },
]

function buildStages(status) {
  const activeIndex = STAGES.findIndex((s) => s.statuses.includes(status))
  const complete = status === 'completed'
  return STAGES.map((s, i) => ({
    ...s,
    done: complete ? true : activeIndex > i,
    active: !complete && activeIndex === i,
  }))
}

export default function Processing() {
  const navigate = useNavigate()
  const projectId = getProjectId()

  const [stages, setStages] = useState(buildStages('uploaded'))
  const [status, setStatus] = useState('running')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState([])
  const loggedRef = useRef(new Set())

  useEffect(() => {
    if (!projectId) {
      navigate('/onboarding')
      return
    }

    let cancelled = false
    let timer

    const poll = async () => {
      try {
        const project = await getProject(projectId)
        if (cancelled) return

        const nextStages = buildStages(project.status)
        setStages(nextStages)

        nextStages.forEach((stage) => {
          if (stage.done && !loggedRef.current.has(stage.key)) {
            loggedRef.current.add(stage.key)
            setLogs((prev) => [...prev, { key: stage.key, text: `✓ ${stage.name} complete — ${stage.log}` }])
          } else if (stage.active && !loggedRef.current.has(`${stage.key}-start`)) {
            loggedRef.current.add(`${stage.key}-start`)
            setLogs((prev) => [...prev, { key: `${stage.key}-start`, text: `▸ ${stage.name}: ${stage.log}` }])
          }
        })

        if (project.status === 'completed') {
          setStatus('complete')
          setTimeout(() => !cancelled && navigate('/dashboard'), 1200)
        } else if (project.status === 'failed') {
          setStatus('failed')
          setError(project.error || 'Analysis failed unexpectedly.')
        } else {
          timer = setTimeout(poll, POLL_MS)
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, POLL_MS)
      }
    }

    poll()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [projectId, navigate])

  const doneCount = stages.filter((s) => s.done).length
  const total = stages.length
  const progress = status === 'complete' ? 100 : Math.min((doneCount / total) * 100, 100)

  return (
    <PageTransition className="min-h-screen bg-bg relative overflow-hidden">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[110px] pointer-events-none" />
      <div className="absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-amber/10 blur-[100px] pointer-events-none" />

      <header className="container-page flex items-center justify-between py-6 relative z-10">
        <Logo />
        <span className="rounded-full border border-black/[0.06] bg-white px-3 py-2 text-xs text-textMuted">
          Project · {projectId.slice(-8)}
        </span>
      </header>

      <main className="container-page grid gap-10 pb-16 pt-6 relative z-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="eyebrow">Your AI council is in session</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-espresso md:text-5xl">
              {status === 'complete' ? 'Your growth plan is ready.' : status === 'failed' ? 'Analysis hit a snag.' : 'Turning signals into strategy.'}
            </h1>
            <p className="mt-4 max-w-xl text-textMuted">
              Live status from the analysis engine — each stage below advances as the backend actually completes it.
            </p>
          </motion.div>

          <div className="mt-10 rounded-[28px] border border-black/[0.06] bg-white/70 p-7 shadow-warm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-textMuted">Pipeline progress</p>
              <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
              <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} className={`h-full rounded-full bg-gradient-to-r ${status === 'failed' ? 'from-danger to-danger' : 'from-primary to-amber'}`} />
            </div>

            {status === 'failed' && (
              <p className="mt-4 rounded-xl bg-danger/10 p-4 text-xs font-semibold text-danger">{error}</p>
            )}

            <div className="mt-7 space-y-3">
              {stages.map((stage, i) => (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition duration-300 ${
                    stage.active
                      ? 'border-primary bg-primary/[0.06] shadow-glow'
                      : stage.done
                        ? 'border-success/30 bg-success/[.06]'
                        : 'border-black/[0.06] bg-black/[0.015]'
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stage.done ? 'bg-success text-white' : stage.active ? 'bg-primary text-white' : 'bg-black/[0.04] text-textMuted'}`}>
                    {stage.done ? <Check size={18} /> : stage.active ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="block text-sm text-espresso">{stage.name}</b>
                    <small className={`text-[11px] ${stage.done ? 'text-success' : stage.active ? 'text-primary' : 'text-textMuted'}`}>
                      {stage.done ? 'Complete' : stage.active ? 'In progress…' : 'Waiting'}
                    </small>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs text-textMuted">
            {status === 'complete' ? 'Opening your dashboard…' : status === 'failed' ? 'You can try running the analysis again from the onboarding form.' : 'Keep this tab open · usually under a minute'}
          </p>
        </div>

        <div className="rounded-[28px] border border-black/[0.06] bg-white/70 p-6 shadow-warm backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-black/[0.06] pb-4 text-textMuted">
            <Terminal size={15} />
            <span className="text-xs font-bold uppercase tracking-[.2em]">Live console</span>
          </div>
          <div className="mt-4 space-y-2 font-mono text-[11px] leading-relaxed text-textMuted">
            <AnimatePresence initial={false}>
              {logs.map((line) => (
                <motion.p
                  key={line.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={line.text.startsWith('✓') ? 'text-success' : 'text-primary'}
                >
                  {line.text}
                </motion.p>
              ))}
            </AnimatePresence>
            {status !== 'complete' && status !== 'failed' && (
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="inline-block text-textMuted"
              >
                ▍
              </motion.span>
            )}
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
