import { motion } from 'framer-motion'
import { Bot, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { fadeUp, stagger } from '../components/Motion'
import { getAgents, getProjectId } from '../lib/api'

export default function Council() {
  const [agents, setAgents] = useState(null)
  const [tab, setTab] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const projectId = getProjectId()
    if (!projectId) {
      navigate('/onboarding')
      return
    }
    getAgents(projectId)
      .then((agentData) => {
        setAgents(agentData)
        if (agentData.agent_outputs?.length) setTab(agentData.agent_outputs[0].agent_name)
      })
      .catch((err) => setError(err.message || 'Could not load Agent Workflow findings.'))
  }, [navigate])

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

  if (!agents) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-peach border-t-primary" />
          <p className="mt-4 text-sm font-bold text-textMuted">Loading Agent Workflow…</p>
        </div>
      </div>
    )
  }

  const activeAgent = agents?.agent_outputs?.find((a) => a.agent_name === tab)

  return (
    <AppShell title="Agent Workflow" subtitle="See how each autonomous specialist reads and analyzes your business.">
      <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-[1440px]">
        {agents?.agent_outputs?.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Sidebar list of agents */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted px-2">Agents</p>
              <div className="space-y-1.5">
                {agents.agent_outputs.map((a) => {
                  const isSelected = tab === a.agent_name
                  return (
                    <motion.button
                      key={a.agent_name}
                      onClick={() => setTab(a.agent_name)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
                        isSelected 
                          ? 'border-primary bg-white shadow-md ring-2 ring-primary/5' 
                          : 'border-black/[0.04] bg-white/40 hover:border-primary/20 hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`grid h-8 w-8 place-items-center rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-peach/30 text-primary'}`}>
                          <Bot size={16} />
                        </span>
                        <span className="text-[9px] font-bold text-success bg-success/15 px-1.5 py-0.5 rounded-full">
                          {Math.round(a.confidence_score || 0)}%
                        </span>
                      </div>
                      <h4 className="mt-3 font-display text-sm font-extrabold text-espresso truncate">{a.agent_name}</h4>
                      <p className="mt-1 text-[10px] text-textMuted line-clamp-2 leading-relaxed">{a.responsibility}</p>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Selected agent detailed markdown report */}
            <motion.article 
              key={tab} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="card overflow-hidden animate-in fade-in duration-200"
            >
              <div className="border-b border-black/[.06] p-6 md:p-8 bg-espresso/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-espresso text-white">
                    <Sparkles size={19} />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-espresso">{activeAgent?.agent_name}</h3>
                    <p className="text-xs text-textMuted mt-0.5">Role: {activeAgent?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-textMuted">Execution Time</span>
                    <span className="text-sm font-bold text-espresso">{activeAgent?.execution_time_seconds ? `${activeAgent.execution_time_seconds.toFixed(2)}s` : 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-textMuted">Confidence</span>
                    <span className="text-sm font-bold text-success">{Math.round(activeAgent?.confidence_score || 0)}%</span>
                  </div>
                </div>
              </div>
              <div className="prose-warm bg-white/40 p-6 md:p-8">
                <ReactMarkdown>{activeAgent?.output_markdown || 'No findings yet.'}</ReactMarkdown>
              </div>
            </motion.article>
          </div>
        ) : (
          <div className="card p-10 text-center">
            <Bot size={40} className="mx-auto text-textMuted animate-bounce" />
            <h3 className="mt-4 font-display text-lg font-bold text-espresso">No findings yet</h3>
            <p className="mt-2 text-sm text-textMuted">The Agent Workflow hasn't run yet or there are no outputs found.</p>
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
