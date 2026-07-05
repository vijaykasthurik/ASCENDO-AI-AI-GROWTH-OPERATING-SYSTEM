import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Check, Clock, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { fadeUp, stagger } from '../components/Motion'
import { deleteProject, getProjectId, listProjects, setProjectId } from '../lib/api'

const STATUS_META = {
  uploaded: { label: 'Uploaded', tone: 'gray', icon: Clock },
  planning: { label: 'Planning', tone: 'amber', icon: Loader2 },
  running_agents: { label: 'Running Agents', tone: 'amber', icon: Loader2 },
  orchestrating: { label: 'Orchestrating', tone: 'amber', icon: Loader2 },
  finalizing: { label: 'Finalizing', tone: 'amber', icon: Loader2 },
  generating_engines: { label: 'Generating Engines', tone: 'amber', icon: Loader2 },
  completed: { label: 'Completed', tone: 'success', icon: Check },
  failed: { label: 'Failed', tone: 'danger', icon: AlertTriangle },
}

const TONE_CLASSES = {
  gray: 'bg-black/5 text-textMuted',
  amber: 'bg-warn/10 text-warn',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
}

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return value
  }
}

export default function Activity() {
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()
  const activeProjectId = getProjectId()

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch((err) => setError(err.message || 'Could not load your activity.'))
  }, [])

  const handleView = (project) => {
    setProjectId(project.id)
    navigate(project.status === 'completed' ? '/dashboard' : '/processing')
  }

  const handleDelete = async (project) => {
    setDeletingId(project.id)
    try {
      await deleteProject(project.id)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
      if (activeProjectId === project.id) setProjectId('')
    } catch (err) {
      setError(err.message || 'Could not delete this analysis.')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <AppShell title="Recent Activity" subtitle="Every analysis you've run — jump back in or clean up old runs.">
      <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-4xl">
        {error && <p className="mb-5 rounded-xl bg-danger/10 p-4 text-xs font-semibold text-danger">{error}</p>}

        {!projects ? (
          <div className="grid place-items-center py-24">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-peach border-t-primary" />
          </div>
        ) : projects.length === 0 ? (
          <motion.div variants={fadeUp} className="card flex flex-col items-center gap-4 p-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-peach/50 text-primary"><Sparkles size={22} /></span>
            <div>
              <h3 className="font-display text-xl font-extrabold text-espresso">No analyses yet</h3>
              <p className="mt-1 text-sm text-textMuted">Run your first business analysis to see it show up here.</p>
            </div>
            <Link to="/onboarding" className="btn-primary mt-2">Start a new analysis</Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {projects.map((project) => {
                const meta = STATUS_META[project.status] || STATUS_META.uploaded
                const StatusIcon = meta.icon
                const isActive = project.id === activeProjectId
                const isConfirming = confirmId === project.id
                const isDeleting = deletingId === project.id
                return (
                  <motion.article
                    key={project.id}
                    variants={fadeUp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${isActive ? 'ring-2 ring-primary/20' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <b className="truncate text-sm text-espresso">{project.name}</b>
                        {isActive && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Active</span>}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${TONE_CLASSES[meta.tone]}`}>
                          <StatusIcon size={11} className={meta.tone === 'amber' ? 'animate-spin' : ''} />
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-1.5 truncate text-xs text-textMuted">{project.current_step || '—'}</p>
                      <p className="mt-1 text-[11px] text-textMuted/70">Created {formatDate(project.created_at)}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => handleView(project)} className="btn-secondary px-4 py-2 text-xs">
                        View
                      </button>
                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(project)}
                            disabled={isDeleting}
                            className="rounded-lg bg-danger px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                          >
                            {isDeleting ? 'Deleting…' : 'Confirm'}
                          </button>
                          <button onClick={() => setConfirmId(null)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-bold text-textMuted">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(project.id)}
                          aria-label="Delete analysis"
                          title="Delete analysis"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-black/[0.06] text-textMuted transition hover:border-danger/30 hover:text-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </motion.article>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
