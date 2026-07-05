import { Bot, Clock, FileText, LayoutDashboard, LogOut, Mail, Settings, Target, X, Users } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../lib/AuthContext'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/activity', icon: Clock, label: 'Activity' },
  { to: '/council', icon: Users, label: 'Agent Workflow' },
  { to: '/engines', icon: Target, label: 'Engines' },
  { to: '/reports', icon: FileText, label: 'Strategic Reports' },
  { to: '/copilot', icon: Bot, label: 'Copilot' },
  { to: '/contact', icon: Mail, label: 'Contact' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ open, onClose, dark = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const initials = (user?.full_name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'
  const handleLogout = () => {
    logout()
    onClose?.()
    navigate('/login')
  }
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-label="Close menu" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[245px] flex-col p-4 text-white transition-transform lg:translate-x-0 ${dark ? 'bg-darkBg border-r border-line' : 'bg-espresso'} ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2 py-3"><Logo light /><button onClick={onClose} className="lg:hidden"><X /></button></div>
        <p className="px-3 pb-2 pt-8 text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Workspace</p>
        <nav className="space-y-1">
          {items.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to
            return (
            <Link key={label} to={to} onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/60 hover:bg-white/[.06] hover:text-white'}`}>
              <Icon size={18} />{label}
            </Link>
          )})}
        </nav>
        <div className={`mt-auto rounded-2xl p-3 ${dark ? 'bg-white/[.04] border border-line' : 'bg-white/[.06]'}`}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-peach font-bold text-espresso">{initials}</span>
            <span className="min-w-0 flex-1"><b className="block truncate text-sm">{user?.full_name || 'Guest'}</b><small className="truncate block text-white/40">{user?.email || ''}</small></span>
            <button onClick={handleLogout} aria-label="Log out" title="Log out" className="text-white/35 transition hover:text-white">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
