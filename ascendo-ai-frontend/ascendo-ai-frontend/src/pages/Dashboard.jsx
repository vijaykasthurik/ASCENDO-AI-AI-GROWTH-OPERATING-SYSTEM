import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, FileText, Lightbulb, Sparkles, Bot, Check, Loader2, Terminal, X, Eye } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { fadeUp, stagger } from '../components/Motion'
import ScoreGauge from '../components/ScoreGauge'
import { getDashboard, getAgents, getProjectId, getProject } from '../lib/api'

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

const SCORE_META = [
  { key: 'business_health_score', label: 'Business Health', reason: 'Composite score across accuracy, feasibility, and confidence.', tab: 'analytics' },
  { key: 'growth_score', label: 'Growth Score', reason: 'How much upside your agent council sees in this business.', tab: 'strategy' },
  { key: 'revenue_opportunity', label: 'Revenue Opportunity', reason: 'Business value identified across all agent findings.', tab: 'strategy' },
  { key: 'lead_score', label: 'Lead Score', reason: 'Confidence in your current lead generation motion.', tab: 'leadgen' },
  { key: 'customer_health', label: 'Customer Health', reason: 'Accuracy and consistency of customer-facing signals.', tab: 'customer_success' },
  { key: 'market_readiness', label: 'Market Readiness', reason: 'Technical and operational readiness to execute.', tab: 'strategy' },
]

function ListCard({ type, items }) {
  const risk = type === 'risks'
  return (
    <motion.article variants={fadeUp} whileHover={{ y: -4 }} className="card p-6">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${risk ? 'bg-danger/10 text-danger' : 'bg-peach/50 text-primary'}`}>
          {risk ? <AlertTriangle size={19} /> : <Lightbulb size={19} />}
        </span>
        <div>
          <h3 className="font-display font-extrabold text-espresso">{risk ? 'Needs attention' : 'Recommended next moves'}</h3>
          <p className="text-xs font-medium text-[#6B5F59]">{risk ? 'Items worth a closer look' : 'Highest-impact next moves'}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {items.length === 0 && <p className="text-xs font-medium text-[#6B5F59]">Nothing to show yet.</p>}
        {items.map((text, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-bg/65 p-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <p className="text-xs font-medium leading-relaxed text-[#4A403B]">{text}</p>
          </div>
        ))}
      </div>
    </motion.article>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [agents, setAgents] = useState(null)
  const [tab, setTab] = useState('')
  const [error, setError] = useState('')
  const [project, setProject] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('running') // 'running' | 'complete' | 'failed'
  const [processingError, setProcessingError] = useState('')
  const [stages, setStages] = useState([])
  const [logs, setLogs] = useState([])
  const [agentOutputs, setAgentOutputs] = useState([])
  const [selectedAgentReport, setSelectedAgentReport] = useState(null)
  const loggedRef = useRef(new Set())
  const lastStepRef = useRef('')
  const navigate = useNavigate()

  useEffect(() => {
    const projectId = getProjectId()
    if (!projectId) {
      navigate('/onboarding')
      return
    }

    let cancelled = false
    let timer

    const poll = async () => {
      try {
        const [proj, agentData] = await Promise.all([
          getProject(projectId),
          getAgents(projectId).catch(() => ({ agent_outputs: [] }))
        ])

        if (cancelled) return
        setProject(proj)
        setAgentOutputs(agentData?.agent_outputs || [])

        if (proj.status !== 'completed' && proj.status !== 'failed') {
          setIsProcessing(true)
          const nextStages = buildStages(proj.status)
          setStages(nextStages)

          // Add console logs for stage changes
          nextStages.forEach((stage) => {
            if (stage.done && !loggedRef.current.has(stage.key)) {
              loggedRef.current.add(stage.key)
              setLogs((prev) => [...prev, { key: stage.key, text: `✓ ${stage.name} complete — ${stage.log}` }])
            } else if (stage.active && !loggedRef.current.has(`${stage.key}-start`)) {
              loggedRef.current.add(`${stage.key}-start`)
              setLogs((prev) => [...prev, { key: `${stage.key}-start`, text: `▸ ${stage.name}: ${stage.log}` }])
            }
          })

          // Add console logs for individual steps (agent execution flow)
          if (proj.current_step && proj.current_step !== lastStepRef.current) {
            const stepKey = `step-${Date.now()}-${Math.random()}`
            setLogs((prev) => [
              ...prev,
              {
                key: stepKey,
                text: proj.current_step.startsWith('Completed agent:')
                  ? `✓ ${proj.current_step}`
                  : `▸ ${proj.current_step}`
              }
            ])
            lastStepRef.current = proj.current_step
          }

          timer = setTimeout(poll, POLL_MS)
        } else if (proj.status === 'completed') {
          if (isProcessing || !data) {
            setProcessingStatus('complete')
            // Smooth transition to dashboard view
            setTimeout(async () => {
              if (cancelled) return
              try {
                const [dashboard, agentDataFinal] = await Promise.all([
                  getDashboard(projectId),
                  getAgents(projectId)
                ])
                setData(dashboard)
                setAgents(agentDataFinal)
                if (agentDataFinal.agent_outputs?.length) setTab(agentDataFinal.agent_outputs[0].agent_name)
                setIsProcessing(false)
              } catch (err) {
                setError(err.message || 'Could not load your dashboard.')
              }
            }, 1200)
          } else if (!data) {
            // Initial load of completed project
            const [dashboard, agentDataFinal] = await Promise.all([
              getDashboard(projectId),
              getAgents(projectId)
            ])
            setData(dashboard)
            setAgents(agentDataFinal)
            if (agentDataFinal.agent_outputs?.length) setTab(agentDataFinal.agent_outputs[0].agent_name)
          }
        } else if (proj.status === 'failed') {
          setIsProcessing(true)
          setProcessingStatus('failed')
          setProcessingError(proj.error || 'Analysis failed unexpectedly.')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load your dashboard.')
        }
      }
    }

    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [navigate, isProcessing, data])

  const getAgentStatus = (agentName) => {
    if (!project) return 'waiting'
    const status = project.status
    const currentStep = project.current_step || ''

    if (status === 'completed') return 'complete'
    if (status !== 'running_agents') {
      const activeIndex = STAGES.findIndex((s) => s.statuses.includes(status))
      const agentInsightsIndex = STAGES.findIndex((s) => s.key === 'running_agents')
      return activeIndex > agentInsightsIndex ? 'complete' : 'waiting'
    }

    if (currentStep === `Completed agent: ${agentName}`) return 'complete'
    if (currentStep === `Running agent: ${agentName}`) return 'running'

    const agentSpecs = project.agent_specs || []
    const activeAgentIndex = agentSpecs.findIndex(a =>
      currentStep === `Running agent: ${a.name}` || currentStep === `Completed agent: ${a.name}`
    )
    const thisAgentIndex = agentSpecs.findIndex(a => a.name === agentName)

    if (activeAgentIndex === -1) return 'waiting'
    if (thisAgentIndex < activeAgentIndex) return 'complete'
    if (thisAgentIndex === activeAgentIndex) {
      return currentStep.startsWith('Completed') ? 'complete' : 'running'
    }
    return 'waiting'
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-6">
        <div className="max-w-md text-center">
          <p className="text-sm font-bold text-danger">{error}</p>
          <Link to="/onboarding" className="btn-primary mt-6 inline-flex">Start a new analysis</Link>
        </div>
      </div>
    )
  }

  // --- PROCESSING STATE (IN-WORKSPACE PROGRESS CARD & CONSOLE) ---
  if (isProcessing) {
    const doneCount = stages.filter((s) => s.done).length
    const total = stages.length
    const progress = processingStatus === 'complete' ? 100 : Math.min((doneCount / total) * 100, 100)

    return (
      <AppShell
        title={processingStatus === 'complete' ? 'Growth Plan Ready' : 'Analysis in Progress'}
        subtitle="Your AI council is translating signals into strategy."
      >
        <div className="mx-auto max-w-[1440px] grid gap-6 pb-16 lg:grid-cols-[1.3fr_1fr]">
          {/* Progress Card */}
          <div className="rounded-[28px] border border-black/[0.06] bg-white/70 p-7 shadow-warm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-textMuted">Pipeline progress</p>
              <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full rounded-full bg-gradient-to-r ${processingStatus === 'failed' ? 'from-danger to-danger' : 'from-primary to-amber'}`}
              />
            </div>

            {processingStatus === 'failed' && (
              <p className="mt-4 rounded-xl bg-danger/10 p-4 text-xs font-semibold text-danger">{processingError}</p>
            )}

            <div className="mt-7 space-y-3">
              {stages.map((stage, i) => (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`rounded-2xl border p-4 transition duration-300 ${
                    stage.active
                      ? 'border-primary bg-primary/[0.06] shadow-glow'
                      : stage.done
                        ? 'border-success/30 bg-success/[.06]'
                        : 'border-black/[0.06] bg-black/[0.015]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stage.done ? 'bg-success text-white' : stage.active ? 'bg-primary text-white' : 'bg-black/[0.04] text-textMuted'}`}>
                      {stage.done ? <Check size={18} /> : stage.active ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block text-sm text-espresso">{stage.name}</b>
                      <small className={`text-[11px] ${stage.done ? 'text-success' : stage.active ? 'text-primary' : 'text-textMuted'}`}>
                        {stage.done ? 'Complete' : stage.active ? 'In progress…' : 'Waiting'}
                      </small>
                    </div>
                  </div>

                  {/* Sub-list of specialized agents under Agent Insights stage */}
                  {stage.key === 'running_agents' && project?.agent_specs?.length > 0 && (
                    <div className="mt-4 pl-14 pr-4 space-y-2 border-t border-black/[0.04] pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Council Members</p>
                      {project.agent_specs.map((agent) => {
                        const agentStatus = getAgentStatus(agent.name)
                        const completedOutput = agentOutputs.find(o => o.agent_name === agent.name)
                        
                        return (
                          <div 
                            key={agent.name} 
                            onClick={() => completedOutput && setSelectedAgentReport(completedOutput)}
                            className={`flex items-center justify-between py-1.5 border-b border-black/[0.02] last:border-0 rounded-lg px-2 transition ${
                              completedOutput ? 'cursor-pointer hover:bg-black/[0.04]' : ''
                            }`}
                          >
                            <span className="text-xs font-semibold text-espresso flex items-center gap-1.5">
                              {agent.name}
                              {completedOutput && <Eye size={13} className="text-primary opacity-60" />}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              agentStatus === 'complete'
                                ? 'bg-success/15 text-success'
                                : agentStatus === 'running'
                                  ? 'bg-primary/15 text-primary animate-pulse shadow-sm'
                                  : 'bg-black/5 text-textMuted'
                            }`}>
                              {agentStatus === 'complete' ? '✓ Complete' : agentStatus === 'running' ? '⚡ Running' : 'Waiting'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <p className="mt-6 text-xs text-textMuted">
              {processingStatus === 'complete' ? 'Finalizing your growth environment…' : processingStatus === 'failed' ? 'You can restart from Onboarding.' : 'Keep this page open · usually under a minute'}
            </p>
          </div>

          {/* Live Console Card */}
          <div className="rounded-[28px] border border-black/[0.06] bg-white/70 p-6 shadow-warm backdrop-blur-xl h-fit">
            <div className="flex items-center gap-2 border-b border-black/[0.06] pb-4 text-textMuted">
              <Terminal size={15} />
              <span className="text-xs font-bold uppercase tracking-[.2em]">Live console</span>
            </div>
            <div className="mt-4 space-y-2 font-mono text-[11px] leading-relaxed text-textMuted max-h-[450px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {logs.map((line) => (
                  <motion.p
                    key={line.key}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={line.text.startsWith('✓') ? 'text-success font-semibold' : 'text-primary'}
                  >
                    {line.text}
                  </motion.p>
                ))}
              </AnimatePresence>
              {processingStatus !== 'complete' && processingStatus !== 'failed' && (
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
        </div>

        {/* Glassmorphic Modal for Agent Report (Live Viewing during processing) */}
        <AnimatePresence>
          {selectedAgentReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAgentReport(null)}
                className="absolute inset-0 bg-espresso/45 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="relative z-10 flex h-[min(700px,calc(100vh-80px))] w-[min(800px,calc(100vw-32px))] flex-col overflow-hidden rounded-[28px] border border-white/40 bg-white/80 shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between border-b border-black/[0.06] bg-white/40 p-6">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-espresso text-white shadow-warm">
                      <Bot size={22} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-espresso">{selectedAgentReport.agent_name}</h3>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {selectedAgentReport.role} · {Math.round(selectedAgentReport.confidence_score || 0)}% confidence
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAgentReport(null)} className="rounded-xl p-2 text-textMuted transition hover:bg-black/5 hover:text-espresso">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  <div className="prose-warm max-w-none">
                    <ReactMarkdown>{selectedAgentReport.output_markdown || selectedAgentReport.markdown_output || 'No findings reported.'}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AppShell>
    )
  }

  // --- INITIAL LOADING STATE ---
  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-peach border-t-primary" />
          <p className="mt-4 text-sm font-bold text-textMuted">Loading your growth system…</p>
        </div>
      </div>
    )
  }

  const activeAgent = agents?.agent_outputs?.find((a) => a.agent_name === tab)

  // --- COMPLETED DASHBOARD VIEW ---
  return (
    <AppShell title="Business overview" subtitle="Here’s what your AI council found this week.">
      <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-[1440px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SCORE_META.map((meta) => (
            <Link key={meta.key} to={`/engines?tab=${meta.tab}`} className="block">
              <ScoreGauge value={Math.round(data[meta.key] ?? 0)} label={meta.label} reason={meta.reason} />
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {/* Overview (was "Executive summary") */}
          <motion.article variants={fadeUp} className="card p-6 md:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-espresso text-white">
                <FileText size={19} />
              </span>
              <div>
                <h3 className="font-display font-extrabold text-espresso">Overview</h3>
                <p className="text-xs font-medium text-[#6B5F59]">High-level synthesis of your growth plan</p>
                <div className="prose-warm mt-4 max-w-4xl text-xs leading-relaxed">
                  <ReactMarkdown>{data.executive_summary || 'No summary available yet.'}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.article>

          <ListCard type="risks" items={data.risk_alerts || []} />
        </div>

        {/* Recommended next moves (was "AI recommendations") */}
        <div className="mt-4">
          <motion.article variants={fadeUp} className="card p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-peach/50 text-primary">
                <Lightbulb size={19} />
              </span>
              <div>
                <h3 className="font-display font-extrabold text-espresso">Recommended next moves</h3>
                <p className="text-xs font-medium text-[#6B5F59]">Highest-impact actions for this cycle</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(!data.ai_recommendations || data.ai_recommendations.length === 0) && (
                <p className="text-xs font-medium text-[#6B5F59] col-span-full">Nothing to show yet.</p>
              )}
              {data.ai_recommendations?.map((text, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-bg/65 p-4 shadow-sm border border-black/[0.02]">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <p className="text-xs font-medium leading-relaxed text-[#4A403B]">{text}</p>
                </div>
              ))}
            </div>
          </motion.article>
        </div>
      </motion.div>
    </AppShell>
  )
}
