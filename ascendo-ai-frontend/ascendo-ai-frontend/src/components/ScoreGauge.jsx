import { motion } from 'framer-motion'
import { useId } from 'react'
import CountUp from './CountUp'

function tierFor(value) {
  if (value >= 75) return { name: 'Strong', dot: 'bg-success', text: 'text-success', stops: ['#F5A623', '#22C55E'] }
  if (value >= 50) return { name: 'Fair', dot: 'bg-amber', text: 'text-amber', stops: ['#F5A623', '#F26430'] }
  return { name: 'Needs focus', dot: 'bg-danger', text: 'text-danger', stops: ['#F26430', '#EF4444'] }
}

export default function ScoreGauge({ value, label, reason }) {
  const gradientId = useId()
  const radius = 42
  const circumference = Math.PI * radius
  const offset = circumference * (1 - value / 100)
  const tier = tierFor(value)

  return (
    <motion.article whileHover={{ y: -5 }} className="card min-h-[226px] p-5">
      <div className="relative mx-auto h-[118px] w-[150px] overflow-hidden">
        <svg viewBox="0 0 100 60" className="h-full w-full">
          <path d="M 8 52 A 42 42 0 0 1 92 52" fill="none" stroke="#F2E9E5" strokeWidth="9" strokeLinecap="round" />
          <motion.path d="M 8 52 A 42 42 0 0 1 92 52" fill="none" stroke={`url(#${gradientId})`} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: 'easeOut' }} />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop stopColor={tier.stops[0]} />
              <stop offset="1" stopColor={tier.stops[1]} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-x-0 bottom-1 text-center">
          <strong className="font-display text-3xl font-extrabold text-textDark"><CountUp value={value} /></strong><span className="text-sm font-medium text-textMuted">/100</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${tier.dot}`} />
        <h3 className="text-center font-display font-bold text-textDark">{label}</h3>
      </div>
      <p className={`mt-1 text-center text-[10px] font-bold uppercase tracking-wider ${tier.text}`}>{tier.name}</p>
      <p className="mt-2 text-center text-xs font-medium leading-relaxed text-[#5A4F49]">{reason}</p>
    </motion.article>
  )
}
