import { Link } from 'react-router-dom'
import logoImg from '../logo-mark.svg'

export default function Logo({ light = false, compact = false }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 font-display text-xl font-extrabold ${light ? 'text-white' : 'text-espresso'}`}>
      <img src={logoImg} alt="" aria-hidden="true" className="h-9 w-9 rounded-xl object-contain shadow-[0_6px_18px_rgba(242,98,46,.18)]" />
      {!compact && <span>Ascendo <span className="text-primary">AI</span></span>}
    </Link>
  )
}
