import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { X, Menu, ArrowRight } from 'lucide-react'
import Logo from './Logo'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isLightPage = pathname !== '/'
  const darkText = scrolled || open || isLightPage

  return (
    <nav 
      aria-label="Main navigation" 
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] px-4 ${
        scrolled ? 'top-3' : 'top-0'
      }`}
    >
      <div 
        className={`mx-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled 
            ? 'max-w-[1380px] rounded-full border border-black/[0.08] bg-[#fffaf6]/85 px-6 py-2.5 shadow-warm backdrop-blur-xl text-espresso' 
            : open
              ? 'max-w-full rounded-none border-b border-black/[.06] bg-[#fffaf6] py-4 px-6 shadow-sm text-espresso'
              : isLightPage
                ? 'max-w-[1440px] rounded-none border-b border-black/[0.04] bg-[#fffaf6]/60 py-5 px-4 text-espresso backdrop-blur-md'
                : 'max-w-[1440px] rounded-none border-b border-transparent bg-transparent py-5 px-4 text-white'
        }`}
      >
        <Logo light={!darkText} />
        <div className={`hidden items-center gap-8 text-sm font-semibold lg:flex ${darkText ? 'text-espresso/80' : 'text-white/80'}`}>
          <Link to="/#framework" className="relative py-1 transition-colors duration-300 hover:text-primary group">
            Framework
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/#agents" className="relative py-1 transition-colors duration-300 hover:text-primary group">
            AI council
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/#how" className="relative py-1 transition-colors duration-300 hover:text-primary group">
            How it works
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/contact-us" className="relative py-1 transition-colors duration-300 hover:text-primary group">
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>
        <div className="hidden items-center gap-6 lg:flex">
          <Link to="/login" className={`text-sm font-bold transition duration-300 hover:text-primary ${darkText ? 'text-espresso' : 'text-white'}`}>Log in</Link>
          <Link to="/signup" className="btn-primary">Build my growth plan <ArrowRight size={16} /></Link>
        </div>
        <button aria-expanded={open} aria-label="Toggle navigation" className={`grid h-10 w-10 place-items-center rounded-xl lg:hidden ${darkText ? 'text-espresso' : 'text-white'}`} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {open && (
        <div className="fixed inset-x-0 top-[72px] bottom-0 z-40 bg-[#fffaf6] p-6 lg:hidden flex flex-col justify-between">
          <div className="space-y-6 text-xl font-extrabold text-espresso">
            <Link to="/#framework" onClick={() => setOpen(false)} className="block py-2 border-b border-black/[0.04]">Framework</Link>
            <Link to="/#agents" onClick={() => setOpen(false)} className="block py-2 border-b border-black/[0.04]">AI council</Link>
            <Link to="/#how" onClick={() => setOpen(false)} className="block py-2 border-b border-black/[0.04]">How it works</Link>
            <Link to="/contact-us" onClick={() => setOpen(false)} className="block py-2 border-b border-black/[0.04]">Contact</Link>
          </div>
          <div className="space-y-4">
            <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary w-full justify-center py-4">Log in</Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary w-full justify-center py-4">Build my growth plan <ArrowRight size={16} /></Link>
          </div>
        </div>
      )}
    </nav>
  )
}
