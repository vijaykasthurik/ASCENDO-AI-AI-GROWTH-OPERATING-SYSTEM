import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Megaphone, Users, TrendingUp, BarChart3, MessageSquare,
  RefreshCw, Download, Copy, ArrowUpRight, Check, Sparkles, CircleDollarSign,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getAllEngines, generateEngine, getProjectId } from '../lib/api'

const ACCENTS = {
  strategy: '#2DD4BF',
  marketing: '#F2622E',
  leadgen: '#F5A623',
  sales: '#FF6B5A',
  analytics: '#0F9C8C',
  customer_success: '#D9A441',
}

const ENGINE_TABS = [
  { id: 'strategy', name: 'Strategy', icon: Target, title: 'Strategy Engine', subtitle: 'Market research, positioning, and pricing strategy.' },
  { id: 'marketing', name: 'Marketing', icon: Megaphone, title: 'Marketing Engine', subtitle: 'Channel strategy, content pillars, and campaign ideas.' },
  { id: 'leadgen', name: 'Lead Gen', icon: Users, title: 'Lead Gen Engine', subtitle: 'Acquisition sources, WhatsApp campaigns, and lead magnets.' },
  { id: 'sales', name: 'Sales', icon: TrendingUp, title: 'Sales Engine', subtitle: 'Funnel stages, objection handling, and closing tactics.' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, title: 'Analytics Engine', subtitle: 'Forecasts, competitive insights, and roadmap.' },
  { id: 'customer_success', name: 'Customer CS', icon: MessageSquare, title: 'Customer Success Engine', subtitle: 'Onboarding, support, retention, and churn risk.' },
]

function priorityTone(p) {
  const v = (p || '').toLowerCase()
  if (v.includes('high')) return 'orange'
  if (v.includes('medium')) return 'amber'
  if (v.includes('low')) return 'gray'
  return 'teal'
}

function unwrapEngine(raw) {
  if (!raw) return null
  return raw.output_json || raw
}

function CopyButton({ text, accent = '#2DD4BF' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-[#EFE7E1] bg-[#FBF8F5]/60 px-2.5 py-1.5 text-[11px] font-semibold text-[#806F67] transition-all active:scale-95"
      style={copied ? { color: accent, borderColor: `${accent}4D` } : undefined}
      title="Copy Section Content"
    >
      {copied ? <Check size={11} style={{ color: accent }} /> : <Copy size={11} />}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  )
}

function EngineHeader({ title, subtitle, icon: Icon, accent, onDownload }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFE7E1]/50 pb-5">
      <div className="flex items-start gap-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border"
          style={{ backgroundColor: `${accent}1A`, color: accent, borderColor: `${accent}33`, boxShadow: `0 0 15px ${accent}22` }}
        >
          <Icon size={22} />
        </span>
        <div>
          <h2 className="font-display text-xl font-extrabold text-[#1A1210] md:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-[#806F67]">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onDownload}
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest transition"
        style={{ borderColor: `${accent}40`, color: accent, backgroundColor: `${accent}0D` }}
      >
        <Download size={13} /> Download
      </button>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children, rawCopyText, accent = '#2DD4BF' }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="relative flex h-full flex-col rounded-2xl border border-[#EFE7E1] bg-[#FFFFFF] p-6 shadow-warm transition-all duration-300 hover:shadow-[0_18px_50px_rgba(43,15,10,.14)]"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={16} style={{ color: accent }} />}
          <h3 className="font-display text-sm font-extrabold uppercase tracking-widest" style={{ color: accent }}>{title}</h3>
        </div>
        {rawCopyText && <CopyButton text={rawCopyText} accent={accent} />}
      </div>
      <div className="flex-1 text-sm leading-relaxed text-[#1A1210]">{children}</div>
    </motion.article>
  )
}

function BulletList({ items }) {
  if (!items?.length) return <p className="text-xs text-[#806F67]">Nothing to show yet.</p>
  return (
    <ul className="space-y-3.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]" />
          <span className="text-[#1A1210] leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Pill({ text, tone }) {
  const styles = {
    teal: 'bg-[#2DD4BF]/10 text-[#2DD4BF] border-[#2DD4BF]/20',
    orange: 'bg-[#F2622E]/10 text-[#F2622E] border-[#F2622E]/20',
    amber: 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20',
    gray: 'bg-[#EFE7E1] text-[#806F67] border-transparent',
  }
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${styles[tone] || styles.gray}`}>
      {text}
    </span>
  )
}

function Timeline({ steps }) {
  if (!steps?.length) return <p className="text-xs text-[#806F67]">Nothing to show yet.</p>
  return (
    <div className="relative ml-2.5 space-y-6 border-l border-[#EFE7E1] py-1 pl-6">
      {steps.map((step, idx) => (
        <div key={idx} className="relative">
          <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border border-[#2DD4BF] bg-[#FFFFFF] shadow-[0_0_6px_rgba(45,212,191,0.4)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2DD4BF]">{step.name}</span>
          {step.count && <b className="mt-0.5 block text-xs text-[#1A1210]">{step.count}</b>}
          <p className="mt-1 text-xs leading-relaxed text-[#806F67]">{step.desc}</p>
        </div>
      ))}
    </div>
  )
}

function TableSimple({ cols, rows }) {
  if (!rows?.length) return <p className="text-xs text-[#806F67]">Nothing to show yet.</p>
  return (
    <div className="overflow-x-auto rounded-xl border border-[#EFE7E1] bg-[#FBF8F5]/40">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-[#EFE7E1] bg-[#FBF8F5]">
            {cols.map((col, idx) => (
              <th key={idx} className="px-4 py-3 font-extrabold uppercase tracking-wider text-[#806F67]">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EFE7E1]/50">
          {rows.map((row, idx) => (
            <tr key={idx} className="transition hover:bg-[#FFFFFF]/40">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 font-medium text-[#1A1210]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EntityCard({ title, tag, tagTone, subtitle, children }) {
  return (
    <div className="rounded-xl border border-[#EFE7E1]/50 bg-[#FBF8F5] p-3.5">
      <div className="flex items-center justify-between gap-2">
        <b className="text-sm text-[#1A1210]">{title}</b>
        {tag && <Pill text={tag} tone={tagTone} />}
      </div>
      {subtitle && <p className="mt-0.5 text-[11px] text-[#806F67]">{subtitle}</p>}
      {children}
    </div>
  )
}

function CompetitorList({ items }) {
  if (!items?.length) return <p className="text-xs text-[#806F67]">Nothing to show yet.</p>
  return (
    <div className="space-y-3">
      {items.map((c, i) => (
        <div key={i} className="rounded-xl border border-[#EFE7E1]/50 bg-[#FBF8F5] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <b className="text-sm text-[#1A1210]">{c.name}</b>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#806F67]">{c.market_position}</span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div><span className="text-[9px] font-extrabold uppercase tracking-widest text-[#2DD4BF]">Strengths</span><ul className="mt-1 space-y-1">{c.strengths?.map((s, j) => <li key={j} className="text-[11px] text-[#1A1210]/80">• {s}</li>)}</ul></div>
            <div><span className="text-[9px] font-extrabold uppercase tracking-widest text-[#F2622E]">Weaknesses</span><ul className="mt-1 space-y-1">{c.weaknesses?.map((s, j) => <li key={j} className="text-[11px] text-[#1A1210]/80">• {s}</li>)}</ul></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatBubble({ user, bot }) {
  return (
    <div className="my-2 space-y-3.5">
      <div className="flex flex-col items-end">
        <span className="mb-1 mr-2 text-[9px] font-bold text-[#806F67]">User</span>
        <div className="max-w-[85%] rounded-xl border border-[#EFE7E1] bg-[#EFE7E1] p-3 text-xs text-[#1A1210]">{user}</div>
      </div>
      <div className="flex flex-col items-start">
        <span className="ml-2 mb-1 text-[9px] font-bold text-[#2DD4BF]">AI Replier</span>
        <div className="max-w-[85%] rounded-xl border border-l-4 border-[#2DD4BF]/60 border-l-[#2DD4BF] bg-[#FBF8F5] p-3 text-xs text-[#1A1210]">{bot}</div>
      </div>
    </div>
  )
}

function EngineSections({ tab, engine, accent }) {
  if (tab === 'strategy') {
    return (
      <>
        <SectionCard title="Market Research Summary" icon={Target} rawCopyText={engine.market_research_summary} accent={accent}>
          <div className="prose-warm text-sm text-[#1A1210]/90"><ReactMarkdown>{engine.market_research_summary}</ReactMarkdown></div>
        </SectionCard>
        <SectionCard title="Key Market Trends" icon={TrendingUp} accent={accent}>
          <BulletList items={engine.key_market_trends} />
        </SectionCard>
        <SectionCard title="Target Segments" icon={Users} accent={accent}>
          <div className="grid gap-3.5">
            {engine.target_segments?.map((seg, i) => (
              <EntityCard key={i} title={seg.segment} subtitle={seg.why_fit}>
                <p className="mt-1 text-[11px] text-[#806F67]">{seg.description}</p>
              </EntityCard>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Competitor Landscape" icon={Target} accent={accent}>
          <CompetitorList items={engine.competitor_landscape} />
        </SectionCard>
        <SectionCard title="Positioning & Value Proposition" icon={Sparkles} accent={accent}>
          <p className="mb-4 border-l-2 border-[#2DD4BF] pl-3 text-sm italic leading-relaxed text-[#2DD4BF]">"{engine.brand_positioning_statement}"</p>
          <p className="text-xs leading-relaxed text-[#1A1210]/90">{engine.unique_value_proposition}</p>
          <div className="mt-3"><BulletList items={engine.differentiation_points} /></div>
        </SectionCard>
        <SectionCard title="Pricing Strategy" icon={CircleDollarSign} accent={accent}>
          <p className="mb-3 text-xs text-[#1A1210]/90">{engine.pricing_model_recommendation}</p>
          <div className="space-y-2">
            {engine.pricing_tiers?.map((pr, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-[#EFE7E1]/30 bg-[#FBF8F5]/60 p-3">
                <span className="text-xs text-[#1A1210]">{pr.tier_name}</span>
                <div className="text-right"><b className="text-xs" style={{ color: accent }}>{pr.price}</b><p className="text-[9px] text-[#806F67]">{pr.rationale}</p></div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#806F67]">{engine.pricing_rationale}</p>
        </SectionCard>
        <SectionCard title="Sales & Marketing Approach" icon={Megaphone} accent={accent}>
          <p className="text-xs leading-relaxed text-[#1A1210]/90"><b>Sales:</b> {engine.sales_strategy}</p>
          <p className="mt-3 text-xs leading-relaxed text-[#1A1210]/90"><b>Marketing:</b> {engine.marketing_strategy}</p>
        </SectionCard>
      </>
    )
  }

  if (tab === 'marketing') {
    return (
      <>
        <SectionCard title="Brand Messaging" icon={Megaphone} accent={accent}>
          <p className="text-xs leading-relaxed text-[#1A1210]/90">{engine.brand_messaging_summary}</p>
        </SectionCard>
        <SectionCard title="Channel Matrix" icon={Target} accent={accent}>
          <div className="grid gap-4 sm:grid-cols-2">
            {engine.channels?.map((ch, i) => (
              <div key={i} className="rounded-xl border border-[#EFE7E1]/50 bg-[#FBF8F5] p-4">
                <div className="mb-2 flex items-center justify-between border-b border-[#EFE7E1] pb-2">
                  <b className="text-xs text-[#1A1210]">{ch.channel_name}</b>
                  <Pill text={ch.priority} tone={priorityTone(ch.priority)} />
                </div>
                <p className="text-[11px] text-[#806F67]">{ch.rationale}</p>
                <ul className="mt-2 space-y-1.5">
                  {ch.suggested_tactics?.map((b, bIdx) => <li key={bIdx} className="flex items-start gap-1 text-[11px] leading-normal text-[#806F67]"><span>•</span><span>{b}</span></li>)}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Content Pillars" icon={Sparkles} accent={accent}>
          <BulletList items={engine.content_pillars} />
        </SectionCard>
        <SectionCard title="Campaign Ideas" icon={Target} accent={accent}>
          <TableSimple
            cols={['Campaign', 'Objective', 'Channel', 'Timeline']}
            rows={engine.campaign_ideas?.map((c) => [c.campaign_name, c.objective, c.channel, c.estimated_timeline]) || []}
          />
        </SectionCard>
        <SectionCard title="Budget & Brand Voice" icon={CircleDollarSign} accent={accent}>
          <p className="text-xs leading-relaxed text-[#1A1210]/90"><b>Budget:</b> {engine.budget_allocation_guidance}</p>
          <p className="mt-3 text-xs leading-relaxed text-[#1A1210]/90"><b>Voice:</b> {engine.brand_voice_guidelines}</p>
        </SectionCard>
      </>
    )
  }

  if (tab === 'leadgen') {
    return (
      <>
        <SectionCard title="Lead Sources" icon={Users} accent={accent}>
          <div className="grid gap-3.5">
            {engine.lead_sources?.map((s, i) => (
              <EntityCard key={i} title={s.source_name} tag={s.expected_lead_quality} tagTone={priorityTone(s.expected_lead_quality)}>
                <p className="mt-1 text-[11px] text-[#806F67]">{s.description}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#806F67]">Effort: {s.effort_level}</p>
              </EntityCard>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Digital Marketing Strategy" icon={Megaphone} accent={accent}>
          <p className="text-xs leading-relaxed text-[#1A1210]/90">{engine.digital_marketing_strategy}</p>
        </SectionCard>
        <SectionCard title="WhatsApp Campaign Ideas" icon={MessageSquare} accent={accent}>
          <div className="space-y-3">
            {engine.whatsapp_campaign_ideas?.map((w, i) => (
              <div key={i} className="relative mx-auto my-1 max-w-sm overflow-hidden rounded-xl border border-[#EFE7E1] bg-[#FBF8F5]/60 p-4">
                <div className="mb-2 flex items-center justify-between border-b border-[#EFE7E1] pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2DD4BF]">{w.campaign_name}</span>
                  <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                </div>
                <p className="text-[10px] text-[#806F67]">Target: {w.target_audience}</p>
                <div className="relative mt-2 rounded-xl border-l-4 border-[#22C55E] bg-[#EFE7E1]/40 p-3 text-xs leading-relaxed text-[#1A1210]">{w.message_template}</div>
                <p className="mt-2 text-[10px] font-bold text-[#2DD4BF]">CTA: {w.cta}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Physical & Field Marketing" icon={Target} accent={accent}>
          <BulletList items={engine.physical_marketing_ideas} />
        </SectionCard>
        <SectionCard title="Lead Magnets" icon={Sparkles} accent={accent}>
          <div className="grid gap-3.5">
            {engine.lead_magnets?.map((m, i) => (
              <EntityCard key={i} title={m.name} subtitle={m.target_segment}><p className="mt-1 text-[11px] text-[#806F67]">{m.description}</p></EntityCard>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Lead Scoring & Conversion" icon={TrendingUp} accent={accent}>
          <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-[#806F67]">Scoring criteria</span>
          <BulletList items={engine.lead_scoring_criteria} />
          <span className="mb-1 mt-4 block text-[10px] font-extrabold uppercase tracking-widest text-[#806F67]">Conversion tactics</span>
          <BulletList items={engine.conversion_tactics} />
        </SectionCard>
      </>
    )
  }

  if (tab === 'sales') {
    return (
      <>
        <SectionCard title="Sales Funnel" icon={TrendingUp} accent={accent}>
          <Timeline
            steps={engine.sales_funnel_stages?.map((s) => ({
              name: s.stage_name,
              count: s.exit_criteria ? `Exit criteria: ${s.exit_criteria}` : '',
              desc: [s.description, ...(s.key_activities || [])].filter(Boolean).join(' · '),
            }))}
          />
        </SectionCard>
        <SectionCard title="Sales Playbook" icon={Target} accent={accent}>
          <p className="text-xs leading-relaxed text-[#1A1210]/90">{engine.sales_playbook_summary}</p>
        </SectionCard>
        <SectionCard title="Objection Handling" icon={MessageSquare} accent={accent}>
          <div className="space-y-3">
            {engine.objection_handling?.map((o, i) => (
              <div key={i} className="rounded-xl border border-[#EFE7E1]/50 bg-[#FBF8F5] p-3.5">
                <b className="text-xs text-[#1A1210]">"{o.objection}"</b>
                <p className="mt-1 text-[11px] text-[#806F67]">{o.recommended_response}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Qualification & Enablement" icon={Users} accent={accent}>
          <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-[#806F67]">Deal qualification criteria</span>
          <BulletList items={engine.deal_qualification_criteria} />
          <span className="mb-1 mt-4 block text-[10px] font-extrabold uppercase tracking-widest text-[#806F67]">Enablement recommendations</span>
          <BulletList items={engine.sales_enablement_recommendations} />
        </SectionCard>
        <SectionCard title="Closing Tactics" icon={Sparkles} accent={accent}>
          <BulletList items={engine.closing_tactics} />
        </SectionCard>
      </>
    )
  }

  if (tab === 'analytics') {
    return (
      <>
        <SectionCard title="Forecasts" icon={BarChart3} accent={accent}>
          <TableSimple
            cols={['Period', 'Metric', 'Low', 'Mid', 'High']}
            rows={engine.forecasts?.map((f) => [f.period, f.metric, f.low_estimate, f.mid_estimate, f.high_estimate]) || []}
          />
          <p className="mt-3 text-[11px] text-[#806F67]">{engine.forecast_methodology_note}</p>
        </SectionCard>
        <SectionCard title="Roadmap" icon={Target} accent={accent}>
          <Timeline steps={engine.roadmap?.map((r) => ({ name: r.title, count: `${r.timeframe} · ${r.priority}`, desc: r.description }))} />
        </SectionCard>
        <SectionCard title="Competitive Insights" icon={Users} accent={accent}>
          <CompetitorList items={engine.competitive_insights} />
        </SectionCard>
        <SectionCard title="Advantages & Threats" icon={Sparkles} accent={accent}>
          <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-[#806F67]">Advantages</span>
          <BulletList items={engine.competitive_advantages} />
          <span className="mb-1 mt-4 block text-[10px] font-extrabold uppercase tracking-widest text-[#806F67]">Threats</span>
          <BulletList items={engine.competitive_threats} />
        </SectionCard>
        <SectionCard title="Portfolio Assessment" icon={Target} accent={accent}>
          <div className="space-y-3">
            {engine.portfolio_assessment?.map((p, i) => (
              <EntityCard key={i} title={p.name} tag={p.status} tagTone={priorityTone(p.status)}>
                <p className="mt-1 text-[11px] text-[#806F67]">{p.recommendation}</p>
              </EntityCard>
            ))}
          </div>
        </SectionCard>
      </>
    )
  }

  if (tab === 'customer_success') {
    return (
      <>
        <SectionCard title="CRM Setup Recommendation" icon={Target} accent={accent}>
          <p className="text-xs leading-relaxed text-[#1A1210]/90">{engine.crm_setup_recommendation}</p>
        </SectionCard>
        <SectionCard title="Customer Onboarding Plan" icon={Users} accent={accent}>
          <Timeline steps={engine.customer_onboarding_plan?.map((s) => ({ name: s.step, count: '', desc: s.description }))} />
        </SectionCard>
        <SectionCard title="Support Channels" icon={MessageSquare} accent={accent}>
          <div className="grid gap-3.5">
            {engine.support_channels_recommendation?.map((s, i) => (
              <EntityCard key={i} title={s.channel}><p className="mt-1 text-[11px] text-[#806F67]">{s.rationale}</p></EntityCard>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="FAQ Suggestions" icon={Sparkles} accent={accent}>
          <div className="space-y-3">
            {engine.faq_suggestions?.map((f, i) => (
              <div key={i} className="rounded-xl border border-[#EFE7E1]/50 bg-[#FBF8F5] p-3.5">
                <b className="text-xs text-[#1A1210]">{f.question}</b>
                <p className="mt-1 text-[11px] text-[#806F67]">{f.answer}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Chatbot Persona & Sample Conversation" icon={MessageSquare} accent={accent}>
          <p className="mb-3 text-xs leading-relaxed text-[#1A1210]/90">{engine.chatbot_persona}</p>
          {engine.chatbot_sample_conversations?.map((c, i) => <ChatBubble key={i} user={c.user_message} bot={c.bot_response} />)}
        </SectionCard>
        <SectionCard title="Retention & Churn Risk" icon={TrendingUp} accent={accent}>
          <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-[#806F67]">Retention strategies</span>
          <BulletList items={engine.retention_strategies} />
          <span className="mb-1 mt-4 block text-[10px] font-extrabold uppercase tracking-widest text-[#806F67]">Churn risk signals</span>
          <BulletList items={engine.churn_risk_signals} />
        </SectionCard>
      </>
    )
  }

  return null
}

export default function Engines() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(location.search).get('tab') || 'strategy')
  const [engines, setEngines] = useState({})
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const projectId = getProjectId()

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab')
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam === 'lead_gen' ? 'leadgen' : tabParam)
  }, [location.search])

  useEffect(() => {
    if (!projectId) {
      navigate('/onboarding')
      return
    }
    getAllEngines(projectId)
      .then((data) => {
        const unwrapped = {}
        for (const key of Object.keys(data)) unwrapped[key] = unwrapEngine(data[key])
        setEngines(unwrapped)
      })
      .catch((err) => setError(err.message || 'Could not load engines.'))
      .finally(() => setLoading(false))
  }, [projectId, navigate])

  const meta = ENGINE_TABS.find((t) => t.id === activeTab) || ENGINE_TABS[0]
  const engine = engines[activeTab]
  const accent = ACCENTS[activeTab]

  const handleRegenerate = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const raw = await generateEngine(activeTab, projectId)
      setEngines((prev) => ({ ...prev, [activeTab]: unwrapEngine(raw) }))
    } catch (err) {
      setError(err.message || 'Could not generate this engine.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!engine) return
    const { downloadPdf } = await import('../lib/download')
    downloadPdf(meta.title, engine.full_markdown || '')
  }

  const tabContentVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  }
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

  return (
    <AppShell title="AI Specialist Engines" subtitle="Individual autonomous analysis modules configured for your workspace.">
      <div className="mx-auto max-w-[1440px] text-textDark">
        <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border-b border-[#EFE7E1] bg-[#FBF8F5]/40 p-1.5">
          {ENGINE_TABS.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            const tabAccent = ACCENTS[tab.id]
            const dot = engines[tab.id] ? 'bg-[#2DD4BF]' : 'bg-gray-400'
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold tracking-wide transition-all sm:text-sm ${
                  isSelected ? 'bg-[#FFFFFF]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'text-[#806F67] hover:bg-[#FBF8F5]/60 hover:text-[#1A1210]'
                }`}
                style={isSelected ? { color: tabAccent } : undefined}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {isSelected && (
                  <motion.div layoutId="activeTabUnderline" className="absolute inset-x-4 bottom-0 h-0.5" style={{ backgroundColor: tabAccent, boxShadow: `0 0 8px ${tabAccent}` }} />
                )}
              </button>
            )
          })}
        </div>

        <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-[#EFE7E1]/50 bg-[#FBF8F5]/30 px-5 py-3.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs font-medium text-[#806F67]">
            {engine ? (
              <>
                <ArrowUpRight size={13} className="text-[#2DD4BF]" />
                <span>Latest run available</span>
              </>
            ) : (
              <span>Not generated yet</span>
            )}
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#EFE7E1] bg-[#FBF8F5]/50 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-[#1A1210] transition hover:border-[#2DD4BF]/30 hover:text-[#2DD4BF] disabled:opacity-50"
          >
            <RefreshCw size={12} className={isGenerating ? 'animate-spin text-[#2DD4BF]' : ''} />
            <span>{isGenerating ? 'Analyzing...' : engine ? 'Regenerate' : 'Generate'}</span>
          </button>
        </div>

        {error && <p className="mb-6 rounded-xl bg-danger/10 p-4 text-xs font-semibold text-danger">{error}</p>}

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <EngineHeader title={meta.title} subtitle={meta.subtitle} icon={meta.icon} accent={accent} onDownload={handleDownload} />

            {loading ? (
              <div className="rounded-2xl border border-[#EFE7E1] bg-[#FFFFFF] p-16 text-center shadow-warm">
                <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-peach border-t-primary" />
              </div>
            ) : !engine ? (
              <div className="relative overflow-hidden rounded-2xl border border-[#EFE7E1] bg-[#FFFFFF] p-8 text-center shadow-warm">
                <div className="mx-auto max-w-md py-10">
                  <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-gray-500/10 bg-gray-500/10 text-gray-400">
                    <RefreshCw size={20} className={isGenerating ? 'animate-spin text-[#2DD4BF]' : ''} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#1A1210]">Engine Needs Setup</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#806F67]">
                    This engine hasn't been generated yet for this project.
                  </p>
                  <button onClick={handleRegenerate} disabled={isGenerating} className="btn-primary mt-6 px-5 py-2.5 text-xs font-bold uppercase tracking-wider">
                    Generate now
                  </button>
                </div>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-6 lg:grid-cols-2">
                <motion.div variants={itemVariants} className="contents">
                  <EngineSections tab={activeTab} engine={engine} accent={accent} />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
