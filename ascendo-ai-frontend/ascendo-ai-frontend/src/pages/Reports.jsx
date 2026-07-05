import { motion } from 'framer-motion'
import { Download, FileText, ShieldAlert, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getReport, getProjectId } from '../lib/api'

const SWOT_META = [
  { key: 'strengths', label: 'Strengths', icon: ShieldCheck, tone: 'text-success bg-success/10' },
  { key: 'weaknesses', label: 'Weaknesses', icon: ShieldAlert, tone: 'text-danger bg-danger/10' },
  { key: 'opportunities', label: 'Opportunities', icon: TrendingUp, tone: 'text-primary bg-primary/10' },
  { key: 'threats', label: 'Threats', icon: TrendingDown, tone: 'text-warn bg-warn/10' },
]

export default function Reports() {
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const projectId = getProjectId()
    if (!projectId) {
      navigate('/onboarding')
      return
    }
    getReport(projectId)
      .then(setReport)
      .catch((err) => setError(err.message || 'Could not load your report.'))
  }, [navigate])

  const handleDownload = async () => {
    if (!report) return
    const { downloadPdf } = await import('../lib/download')
    downloadPdf('Strategic Growth Report', report.full_markdown)
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

  return (
    <AppShell title="Strategic Reports" subtitle="Your latest AI-generated growth report">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 md:p-9">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-5">
            <div>
              <p className="eyebrow">Latest analysis</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-espresso">Strategic Growth Report</h2>
            </div>
            <button onClick={handleDownload} disabled={!report} className="btn-primary px-4 disabled:opacity-40">
              <Download size={16} /> Download
            </button>
          </div>

          {!report ? (
            <p className="mt-6 text-textMuted">Loading report…</p>
          ) : (
            <>
              {report.kpis?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {report.kpis.map((kpi, i) => (
                    <span key={i} className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-peach/20 px-3 py-1.5 text-xs font-bold text-espresso">
                      <FileText size={12} className="text-primary" /> {kpi}
                    </span>
                  ))}
                </div>
              )}

              {report.swot && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {SWOT_META.map(({ key, label, icon: Icon, tone }) => (
                    <div key={key} className="rounded-2xl border border-black/[0.06] p-4">
                      <div className="flex items-center gap-2">
                        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}><Icon size={15} /></span>
                        <b className="text-sm text-espresso">{label}</b>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        {(report.swot[key] || []).map((item, i) => (
                          <li key={i} className="text-xs leading-relaxed text-textMuted">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <div className="prose-warm mt-8">
                <ReactMarkdown>{report.full_markdown}</ReactMarkdown>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AppShell>
  )
}
