import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  Activity, ArrowRight, Bot, BrainCircuit, Check, ChevronDown, CircleDollarSign,
  Compass, Database, Gauge, Layers, Linkedin, LockKeyhole, Megaphone, Menu, Network, Play, Rocket,
  Route, ShieldCheck, Sparkles, Target, Twitter, TrendingUp, Users, Workflow, X, Zap,
} from 'lucide-react'
import {
  AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform,
} from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { Reveal, cardEntrance, fadeUp, heroItem, heroReveal } from '../components/Motion'

const HeroScene = lazy(() => import('../components/HeroScene'))
const GlobeScene = lazy(() => import('../components/GlobeScene'))
import AnimatedHeadline from '../components/AnimatedHeadline'
import LandingNav from '../components/LandingNav'

const ease = [0.22, 1, 0.36, 1]

const capabilities = [
  { icon: Activity, title: 'Live business diagnosis', text: 'See the whole business, not another isolated metric.' },
  { icon: BrainCircuit, title: 'Role-specific AI agents', text: 'Six specialists reason together around your goal.' },
  { icon: Route, title: 'Prioritized action plans', text: 'Know what to do now, next, and later.' },
  { icon: Workflow, title: 'Continuous growth loop', text: 'Every action makes the next decision sharper.' },
]

const framework = [
  { n: '01', title: 'Discover', text: 'Uncover the signals hiding across your business.', icon: Compass, accent: 'Signals' },
  { n: '02', title: 'Design', text: 'Turn insight into a clear, prioritized growth plan.', icon: Target, accent: 'Direction' },
  { n: '03', title: 'Deliver', text: 'Put every recommendation into coordinated action.', icon: Zap, accent: 'Momentum' },
  { n: '04', title: 'Develop', text: 'Learn from each cycle and sharpen what works.', icon: TrendingUp, accent: 'Learning' },
  { n: '05', title: 'Dominate', text: 'Compound your advantage with an always-on AI team.', icon: Rocket, accent: 'Advantage' },
]

const agents = [
  { title: 'Strategy Engine', role: 'Strategic conductor', text: 'Aligns every finding to the business goal that matters most.', icon: BrainCircuit, stat: '1 clear plan' },
  { title: 'Marketing Engine', role: 'Demand architect', text: 'Finds your best channels, messages, and audience opportunities.', icon: Megaphone, stat: '+34% reach' },
  { title: 'Lead Gen Engine', role: 'Pipeline builder', text: 'Identifies and captures high-intent target prospects autonomously.', icon: Users, stat: '+2.4x leads' },
  { title: 'Sales Engine', role: 'Revenue optimizer', text: 'Pinpoints conversion leaks and the next-best revenue action.', icon: TrendingUp, stat: '3× faster' },
  { title: 'Analytics Engine', role: 'Signal finder', text: 'Turns scattered data into evidence the team can trust.', icon: Database, stat: '6 signals' },
  { title: 'Customer Success Engine', role: 'Retention specialist', text: 'Proactively optimizes customer health, retention loops, and expansion pathways.', icon: ShieldCheck, stat: '98% health' },
]

// Single source of truth for the council card angles - shared by both the
// connector lines and the cards themselves so they can never mathematically
// drift apart (previously duplicated in two places with an SVG-attribute
// calc() bug that made the lines point nowhere near the cards).
const COUNCIL_ANGLES = [
  215 * Math.PI / 180, // Top Left
  180 * Math.PI / 180, // Mid Left
  145 * Math.PI / 180, // Bottom Left
  -35 * Math.PI / 180, // Top Right
  0 * Math.PI / 180,   // Mid Right
  35 * Math.PI / 180,  // Bottom Right
]

function ConnectorLine({ angleRad, radius, index }) {
  const angleDeg = (angleRad * 180) / Math.PI
  const width = useTransform(radius, (r) => r)
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay: 0.15 + index * 0.08, ease }}
      className="absolute left-1/2 top-1/2 h-px origin-left"
      style={{
        width,
        rotate: angleDeg,
        backgroundImage:
          'repeating-linear-gradient(90deg, rgba(255,255,255,.22) 0, rgba(255,255,255,.22) 4px, transparent 4px, transparent 9px)',
      }}
    >
      <motion.span
        className="absolute top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-primary"
        style={{ boxShadow: '0 0 8px #F2622E' }}
        animate={{ left: ['0%', '100%'] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.9 + index * 0.25 }}
      />
    </motion.div>
  )
}

const flowSteps = [
  {
    phase: '01',
    name: 'USER',
    role: 'INPUT',
    desc: 'Enters details & uploads files',
    icon: Users,
    points: ['Describe business model', 'Upload CSV/financial docs', 'Select growth focus']
  },
  {
    phase: '02',
    name: 'MASTER LLM',
    role: 'PLAN',
    desc: 'Assigns sequence & roles',
    icon: BrainCircuit,
    points: ['Picks 5-12 active agents', 'Assigns specialist roles', 'Sets logical order']
  },
  {
    phase: '03',
    name: 'AGENT CHAIN',
    role: 'EXECUTE',
    desc: 'Deep multi-perspective debate',
    icon: Layers,
    points: ['Individual analysis', 'Peer review & debate', 'Blackboard collaboration']
  },
  {
    phase: '04',
    name: 'LANGGRAPH',
    role: 'ANALYZE',
    desc: 'Consolidates findings',
    icon: Network,
    points: ['Resolve conflicts & scores', 'De-duplicate findings', 'Refine action items']
  },
  {
    phase: '05',
    name: 'FINAL RESULT',
    role: 'DELIVER',
    desc: 'Compounding growth plan',
    icon: Target,
    points: ['Growth strategy report', 'Prioritized action plans', 'Live tracking dashboard']
  }
]

function SectionIntro({ eyebrow, children, copy, dark = false, align = 'center' }) {
  return (
    <Reveal className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-4xl`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`section-title mt-4 ${dark ? 'text-white' : 'text-espresso'}`}>{children}</h2>
      {copy && <p className={`mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg ${dark ? 'text-white/50' : 'text-textMuted'}`}>{copy}</p>}
    </Reveal>
  )
}



function Count({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-60px' })
  const reducedMotion = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!visible) return undefined
    if (reducedMotion) {
      setCount(value)
      return undefined
    }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / 1200, 1)
      setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, value, reducedMotion])

  return <span ref={ref}>{prefix}{count}{suffix}</span>
}

function TiltCard({ children, className = '', strength = 7 }) {
  const reducedMotion = useReducedMotion()
  const onMove = (event) => {
    if (reducedMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - .5) * strength
    const y = ((event.clientY - rect.top) / rect.height - .5) * -strength
    event.currentTarget.style.setProperty('--rx', `${y}deg`)
    event.currentTarget.style.setProperty('--ry', `${x}deg`)
  }
  const reset = (event) => {
    event.currentTarget.style.setProperty('--rx', '0deg')
    event.currentTarget.style.setProperty('--ry', '0deg')
  }
  return <div onMouseMove={onMove} onMouseLeave={reset} className={`tilt-card ${className}`}>{children}</div>
}

function TypedRecommendation() {
  const text = 'Recover dormant high-intent leads with a 14-day reactivation campaign.'
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-80px' })
  const reducedMotion = useReducedMotion()
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!visible) return undefined
    if (reducedMotion) {
      setTyped(text)
      return undefined
    }
    let index = 0
    const timer = setInterval(() => {
      index += 1
      setTyped(text.slice(0, index))
      if (index >= text.length) clearInterval(timer)
    }, 22)
    return () => clearInterval(timer)
  }, [visible, reducedMotion])

  return <p ref={ref} className="mt-3 min-h-[72px] text-sm leading-relaxed text-white/65">{typed}<span aria-hidden className="type-cursor">|</span></p>
}

function useDesktopPointer() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const check = () => setEnabled(window.innerWidth >= 1024 && !window.matchMedia('(pointer: coarse)').matches)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return enabled
}

function MagneticButton({ children, className = '', strength = 16, ...rest }) {
  const reducedMotion = useReducedMotion()
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleMove = (event) => {
    if (reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set(((event.clientX - rect.left) / rect.width - .5) * strength)
    y.set(((event.clientY - rect.top) / rect.height - .5) * strength)
  }
  const reset = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y }}
      whileHover={reducedMotion ? undefined : { scale: 1.045 }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 250, damping: 18, mass: .6 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

function Hero({ navigate, reducedMotion }) {
  const { scrollYProgress } = useScroll()
  const sceneY = useTransform(scrollYProgress, [0, .18], [0, 110])
  const opacity = useTransform(scrollYProgress, [0, .16], [1, .25])
  const parallaxEnabled = useDesktopPointer()

  // Very subtle mouse parallax (4-6px range) - split across a few depth
  // layers so the content, scene, and stat cards drift at different speeds.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const handlePointerMove = (event) => {
    if (!parallaxEnabled || reducedMotion) return
    const { innerWidth, innerHeight } = window
    pointerX.set((event.clientX / innerWidth - .5) * 2)
    pointerY.set((event.clientY / innerHeight - .5) * 2)
  }
  const resetPointer = () => { pointerX.set(0); pointerY.set(0) }

  const contentX = useTransform(pointerX, (v) => v * 5)
  const contentY = useTransform(pointerY, (v) => v * 4)
  const sceneParallaxX = useTransform(pointerX, (v) => v * -6)
  const statFrontX = useTransform(pointerX, (v) => v * 8)
  const statFrontY = useTransform(pointerY, (v) => v * 6)
  const statBackX = useTransform(pointerX, (v) => v * -6)
  const statBackY = useTransform(pointerY, (v) => v * -4)

  return (
    <section
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
      className="hero-grid relative flex min-h-[760px] flex-col overflow-hidden pb-5 pt-24 text-white md:min-h-screen md:pt-28"
    >
      {/* Step 1: background softly fades in with a warm radial glow, then breathes gently forever */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <div className="hero-noise absolute inset-0" />
        <motion.div
          animate={reducedMotion ? {} : { opacity: [0.85, 1, 0.85], scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          style={{ willChange: 'transform, opacity' }}
          className="absolute -left-32 top-24 h-[430px] w-[430px] rounded-full bg-primary/20 blur-[130px]"
        />
        <motion.div
          animate={reducedMotion ? {} : { opacity: [0.8, 1, 0.8], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 8.5, ease: 'easeInOut', delay: 1 }}
          style={{ willChange: 'transform, opacity' }}
          className="absolute -right-24 bottom-10 h-[420px] w-[420px] rounded-full bg-amber/10 blur-[120px]"
        />
      </motion.div>

      <div className="container-page relative z-10 my-auto grid items-center gap-8 lg:grid-cols-[1.02fr_.98fr]">
        {/* Step 2: hero content rises out of a soft blur with a springy settle */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={heroReveal}
          style={{ x: contentX, y: contentY, willChange: 'transform, filter, opacity' }}
          className="relative z-10 pt-6 lg:pt-0"
        >
          <motion.div variants={heroItem}>
            <AnimatedHeadline />
          </motion.div>
          <motion.p variants={heroItem} className="mt-7 max-w-xl text-lg leading-relaxed text-white/56 md:text-xl">
            The AI operating system your business grows on. Strategy, execution, and insight—finally moving as one.
          </motion.p>
          <motion.div variants={heroItem} className="mt-9 flex flex-wrap gap-3">
            <MagneticButton onClick={() => navigate('/signup')} className="btn-primary btn-sweep btn-glow-pulse px-6 py-4">
              Build my growth plan <ArrowRight size={18} />
            </MagneticButton>
            <a href="#preview" className="btn-ghost"><span className="grid h-7 w-7 place-items-center rounded-full bg-white text-espresso"><Play size={12} fill="currentColor" /></span> See it work</a>
          </motion.div>
          <motion.div variants={heroItem} className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/42">
            {['No credit card', 'Analysis in minutes', 'Your data stays yours'].map((item) => <span className="flex items-center gap-2" key={item}><Check size={14} className="text-primary" />{item}</span>)}
          </motion.div>
        </motion.div>

        <motion.div style={{ y: sceneY, opacity, x: sceneParallaxX }} initial={{ opacity: 0, scale: .86, filter: 'blur(12px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ type: 'spring', stiffness: 55, damping: 16, delay: .2 }} className="relative h-[340px] sm:h-[420px] lg:h-[590px]">
          <Suspense fallback={<div className="scene-loader"><span /></div>}><HeroScene reducedMotion={reducedMotion} /></Suspense>
          <motion.div style={{ x: statFrontX, y: statFrontY }} className="glass-stat left-0 top-7 sm:left-3 sm:top-16">
            <motion.div animate={reducedMotion ? {} : { y: [0, -9, 0] }} transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}>
              <span className="text-[10px] font-bold uppercase tracking-[.16em] text-white/40">Growth opportunity</span>
              <strong className="mt-1 block font-display text-2xl"><Count prefix="$" value={48} suffix=",000" /></strong>
              <span className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#65dfb9]"><TrendingUp size={12} /> High confidence</span>
            </motion.div>
          </motion.div>
          <motion.div style={{ x: statBackX, y: statBackY }} className="glass-stat bottom-5 right-0 sm:bottom-12 sm:right-3">
            <motion.div animate={reducedMotion ? {} : { y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5.6, ease: 'easeInOut' }}>
              <span className="flex items-center gap-2 text-xs font-bold"><Sparkles size={14} className="text-primary" /> Agent council active</span>
              <div className="mt-3 flex -space-x-1.5">{[1, 2, 3, 4, 5].map((n) => <span key={n} className="grid h-6 w-6 place-items-center rounded-full border border-[#2B120B] bg-gradient-to-br from-primary to-amber text-[8px] font-bold">{n}</span>)}</div>
              <span className="mt-2 block text-[10px] text-white/42">5 agents · 12 insights</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <motion.a href="#capabilities" aria-label="Explore the page" animate={reducedMotion ? {} : { y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="relative z-10 mx-auto mt-2 hidden text-white/35 md:block"><ChevronDown /></motion.a>
    </section>
  )
}

function FeatureCard({ index, isMobile, children }) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={cardEntrance}
      transition={{ duration: isMobile ? 0.45 : 0.6, delay: index * (isMobile ? 0.09 : 0.15), ease }}
      className="relative"
    >
      <motion.div
        animate={reducedMotion ? {} : { y: [0, isMobile ? -4 : -7, 0] }}
        transition={{ repeat: Infinity, duration: 4.5 + index * 0.45, ease: 'easeInOut', delay: 0.6 + index * 0.1 }}
        style={{ willChange: 'transform' }}
        className="h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function CapabilityStrip() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % capabilities.length)
    }, 1600)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section id="capabilities" className="relative z-20 bg-[#f8f2ed] py-6 md:py-10">
      <div className="container-page">
        <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease }} className="absolute left-[10%] right-[10%] top-8 hidden h-px origin-left bg-gradient-to-r from-transparent via-primary/35 to-transparent xl:block" />
          {capabilities.map(({ icon: Icon, title, text }, index) => {
            const isActive = activeIndex === index
            return (
              <FeatureCard key={title} index={index} isMobile={isMobile}>
                <article
                  className={`group h-full rounded-2xl border p-5 backdrop-blur transition-all duration-500 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-br from-primary to-amber text-white border-transparent shadow-glow -translate-y-1'
                      : 'border-black/[.06] bg-white/70 hover:-translate-y-1 hover:border-primary/25 hover:bg-white text-espresso'
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-display text-xs font-extrabold transition-colors duration-500 ${isActive ? 'text-white/60' : 'text-primary'}`}>
                      0{index + 1}
                    </span>
                    <span className={`grid h-9 w-9 place-items-center rounded-xl transition-all duration-500 ${isActive ? 'bg-white/20 text-white' : 'bg-peach/50 text-primary'}`}>
                      <Icon size={17} />
                    </span>
                  </div>
                  <h3 className={`mt-4 font-display text-sm font-extrabold transition-colors duration-500 ${isActive ? 'text-white' : 'text-espresso'}`}>
                    {title}
                  </h3>
                  <p className={`mt-2 text-xs leading-relaxed transition-colors duration-500 ${isActive ? 'text-white/80' : 'text-textMuted'}`}>
                    {text}
                  </p>
                </article>
              </FeatureCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Framework() {
  const cards = [
    { n: '01', title: 'Discover', text: 'Uncover the signals hiding across your business database, API streams, and operational files.', icon: Compass, accent: 'Signals', color: 'from-[#fff5f0] to-[#ffebd9] border-primary/20 text-primary' },
    { n: '02', title: 'Design', text: 'Turn scattered data signals into a clear, prioritized growth strategy modelled by financial agents.', icon: Target, accent: 'Direction', color: 'from-[#fff9f0] to-[#fff0db] border-amber/25 text-amber' },
    { n: '03', title: 'Deliver', text: 'Put every recommended action into coordinated execution across marketing, sales, and operations.', icon: Zap, accent: 'Momentum', color: 'from-[#f3fbf8] to-[#e1f5ee] border-emerald-500/20 text-emerald-600' },
    { n: '04', title: 'Develop', text: 'Learn from each cycle, compile execution feedback, and compound your business advantage.', icon: TrendingUp, accent: 'Learning', color: 'from-[#f8f6fc] to-[#ebdffd] border-violet-500/20 text-violet-600' },
  ]

  return (
    <section id="framework" className="relative overflow-hidden bg-[#fbf7f3] py-24 md:py-32">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.25]">
        <video
          autoPlay
          loop
          muted
          defaultMuted
          playsInline
          className="w-full h-full object-cover object-[center_65%]"
        >
          <source src="/neural.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbf7f3] via-[#fbf7f3]/50 to-[#fbf7f3]" />
      </div>

      {/* Blurred ambient lights behind the card carousel */}
      <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] sm:h-[600px] sm:w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/[0.05] blur-[90px] pointer-events-none" />

      <div className="container-page relative z-10">
        <SectionIntro eyebrow="Autonomous execution engine" copy="Ascendo turns growth into a repeatable operating rhythm—one intelligent cycle at a time.">
          From scattered signals to <span className="text-primary">compounding growth.</span>
        </SectionIntro>

        {/* Outer Floating Wrapper */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="relative mt-20 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px]"
        >
          
          {/* 3D Scene Container */}
          <div 
            style={{ perspective: 2000, transformStyle: 'preserve-3d' }} 
            className="relative w-[280px] h-[190px] sm:w-[320px] sm:h-[220px] lg:w-[380px] lg:h-[250px]"
          >
            
            {/* Rotating 3D Carousel Ring */}
            <motion.div
              animate={{ rotateY: -360 }}
              transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
              style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
              className="w-full h-full relative"
            >
              {cards.map((card, index) => {
                const angle = index * 90 // 0, 90, 180, 270 degrees
                const Icon = card.icon
                
                return (
                  <div
                    key={card.title}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `rotateY(${angle}deg) translateZ(var(--carousel-radius, 320px))`,
                      position: 'absolute',
                      inset: 0,
                    }}
                    className="w-full h-full [--carousel-radius:230px] sm:[--carousel-radius:280px] lg:[--carousel-radius:335px]"
                  >
                    {/* FRONT OF CARD */}
                    <div 
                      style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
                      className={`absolute inset-0 rounded-[24px] border bg-gradient-to-br ${card.color} p-6 lg:p-8 flex flex-col justify-center text-center shadow-warm`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 shadow-sm border border-black/[0.03] mb-4">
                          <Icon size={24} />
                        </span>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary/80">PHASE {card.n}</span>
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider shadow-sm text-espresso/70 border border-black/[0.03]">
                            {card.accent}
                          </span>
                        </div>
                        <h3 className="font-display text-lg lg:text-xl font-extrabold text-espresso leading-tight">{card.title}</h3>
                        <p className="mt-2 text-[11px] lg:text-xs leading-relaxed text-espresso/80 max-w-[280px]">
                          {card.text}
                        </p>
                      </div>
                    </div>

                    {/* BACK OF CARD (Frosty Glass Decorative Back) */}
                    <div 
                      style={{ 
                        backfaceVisibility: 'hidden', 
                        transformStyle: 'preserve-3d', 
                        transform: 'rotateY(180deg) translateZ(1px)' 
                      }}
                      className="absolute inset-0 rounded-[24px] border border-white/40 bg-white/40 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center shadow-warm"
                    >
                      <Logo className="h-6 w-auto text-primary/30" />
                      <div className="mt-2 h-1 w-8 rounded bg-primary/20" />
                    </div>
                  </div>
                )
              })}
            </motion.div>

            {/* Dynamic 3D shadow element flat on floor */}
            <motion.div
              animate={{ 
                scaleX: [1, 0.75, 1, 0.75, 1],
                opacity: [0.3, 0.2, 0.3, 0.2, 0.3]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="absolute -bottom-16 left-[5%] w-[90%] h-4 rounded-full bg-[#2B120B]/10 blur-md pointer-events-none"
            />

          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Council({ reducedMotion }) {
  const containerRef = useRef(null)
  
  // Track scroll progress within the Council container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Responsive calculations
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Start nested close to the center, and expand outward to the left and right as the user scrolls
  const startRadius = isMobile ? 120 : 180
  const endRadius = isMobile ? 240 : 420
  
  // Map scroll progress to the orbital radius of the cards
  const radius = useTransform(scrollYProgress, [0.08, 0.45], [startRadius, endRadius])

  // Real 3D Elliptical Satellite Orbit Coordinates for the consensus badge (orbits outside the earth)
  const [satPos, setSatPos] = useState({ x: 255, y: 0, zIndex: 25, scale: 1, opacity: 1 })
  useEffect(() => {
    let angle = 0
    const interval = setInterval(() => {
      angle += 0.015
      const rx = isMobile ? 150 : 255
      const ry = isMobile ? 35 : 65
      const x = Math.cos(angle) * rx
      const y = Math.sin(angle) * ry
      const isFront = Math.sin(angle) > -0.15
      setSatPos({
        x,
        y,
        zIndex: isFront ? 25 : 5,
        scale: isFront ? 1.02 : 0.88,
        opacity: isFront ? 1 : 0.6
      })
    }, 16)
    return () => clearInterval(interval)
  }, [isMobile])

  // Sparkline helper
  const getSparklinePath = (seed) => {
    const val1 = 15 + Math.sin(seed) * 8
    const val2 = 5 + Math.cos(seed * 2) * 4
    const val3 = 22 + Math.sin(seed * 3) * 6
    const val4 = 10 + Math.cos(seed * 4) * 8
    return `M0 ${val1} L30 ${val2} L60 ${val3} L90 ${val4}`
  }

  return (
    <section 
      ref={containerRef}
      id="agents" 
      className="council-grid relative overflow-hidden bg-espresso pt-8 pb-16 text-white md:pt-10 md:pb-20"
    >
      {/* Dynamic Glowing Grid Intersections */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0.15, 0.8, 0.15],
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4.2 + i * 0.8, 
              delay: i * 0.6,
              ease: 'easeInOut'
            }}
            style={{
              left: `${12 + (i * 11) + Math.sin(i) * 6}%`,
              top: `${18 + (i * 9) + Math.cos(i) * 6}%`,
            }}
            className="absolute h-2 w-2 rounded-full bg-primary/30 blur-[2px]"
          />
        ))}
      </div>

      {/* Ambient soft glow blobs */}
      <div className="absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/12 via-amber/8 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute right-[12%] top-[15%] h-56 w-56 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute left-[12%] bottom-[15%] h-56 w-56 rounded-full bg-amber/10 blur-[80px] pointer-events-none" />

      <div className="container-page relative z-10">
        <SectionIntro dark eyebrow="Meet your Cognitive Council" copy="Six autonomous specialists bring distinct lenses. One shared intelligence turns their debate into a focused plan your business can execute.">
          Autonomous Specialists. <span className="text-primary">One Unified Council.</span>
        </SectionIntro>
        
        <div className="council-layout mt-8">
          
          {/* Connector lines from the core to each card - CSS-rotated divs driven
              by the exact same angle/radius math as the cards below, so they can
              never drift out of alignment the way the old SVG calc()-based
              coordinates did. */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block">
            {agents.map((_, idx) => (
              <ConnectorLine key={idx} angleRad={COUNCIL_ANGLES[idx]} radius={radius} index={idx} />
            ))}
          </div>

          {/* Central AI core planet */}
          <div className="council-globe relative">
            <Suspense fallback={<div className="scene-loader"><span /></div>}><GlobeScene reducedMotion={reducedMotion} /></Suspense>
            
            {/* Orbiting Satellite Badge (orbits outside the earth/globe) */}
            <div 
              style={{
                transform: `translate(calc(-50% + ${satPos.x}px), calc(-50% + ${satPos.y}px)) scale(${satPos.scale})`,
                zIndex: satPos.zIndex,
                opacity: satPos.opacity,
              }}
              className="absolute top-1/2 left-1/2 pointer-events-auto transition-opacity duration-300"
            >
              <div className="rounded-2xl border border-white/15 bg-[#1e0d08]/85 backdrop-blur-md px-3.5 py-2 text-center shadow-glow border-primary/20 max-w-[170px] min-w-[130px]">
                <span className="block text-[7px] font-extrabold uppercase tracking-widest text-primary mb-0.5">Active Consensus</span>
                <p className="font-display text-[9px] font-extrabold text-white leading-tight">Multi-Agent Operations</p>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto w-max rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/50 backdrop-blur">Shared business context</div>
          </div>

          {/* Left-3 / Right-3 Orbiting/Converging Glass cards */}
          <div className="agent-orbit relative w-full h-full">
            {agents.map(({ title, role, text, icon: Icon, stat }, index) => {
              const angle = COUNCIL_ANGLES[index]

              // Dynamic position offsets - same angle/radius source as ConnectorLine above
              const translateX = useTransform(radius, (r) => Math.cos(angle) * r)
              const translateY = useTransform(radius, (r) => Math.sin(angle) * r)

              return (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, scale: 0.82 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.55, delay: 0.2 + index * 0.09, ease }}
                  style={isMobile ? undefined : { x: translateX, y: translateY, left: '50%', top: '50%' }}
                  // Width: 230px, Height: 200px (Reduced Height) — on mobile, CSS media queries in index.css take over layout (relative, grid)
                  className={`agent-card w-[230px] h-[200px] cursor-pointer ${isMobile ? '' : 'absolute left-1/2 top-1/2 -ml-[115px] -mt-[100px]'}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                      <Icon size={18} />
                    </span>
                    <span className="metric-badge">{stat}</span>
                  </div>
                  <p className="mt-3 text-[9px] font-extrabold uppercase tracking-[.2em] text-primary">{role}</p>
                  <h3 className="mt-1 font-display text-sm font-extrabold tracking-tight text-white leading-snug">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/50 line-clamp-2">{text}</p>
                  
                  {/* Inner live status & sparkline layout */}
                  <div className="mt-auto absolute bottom-3.5 left-5 right-5 flex items-center justify-between border-t border-white/5 pt-2">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[8px] font-bold text-white/40 tracking-wider uppercase">Active</span>
                    </div>
                    {/* SVG Sparkline */}
                    <svg className="h-4 w-16 text-primary/35 overflow-visible" viewBox="0 0 90 30">
                      <path 
                        d={getSparklinePath(index)} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                      />
                    </svg>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  const chart = 'M0 108 C55 102 70 84 116 90 S190 82 238 69 S310 77 356 52 S433 61 486 34 S552 29 600 8'
  return (
    <section id="preview" className="relative overflow-hidden bg-[#f8f4f0] py-24 md:py-32">
      <div className="absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-amber/[.07] blur-[100px]" />
      <div className="container-page relative">
        <SectionIntro eyebrow="Your business, made legible" copy="A live operating view that turns scattered activity into decisions your team can act on.">
          Know what matters. <span className="text-primary">Know what’s next.</span>
        </SectionIntro>
        <motion.div initial={{ opacity: 0, y: 60, rotateX: 5 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: .9, ease }} className="dashboard-shell mt-16">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[.06] px-5 py-4 md:px-7">
            <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-espresso text-xs font-extrabold text-primary">A</div><div><p className="text-[10px] text-textMuted">Good morning, Alex</p><h3 className="font-display text-base font-extrabold">Business overview</h3></div></div>
            <div className="flex items-center gap-3"><span className="hidden items-center gap-1.5 text-[10px] font-bold text-success sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Data live</span><button className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-glow">Run analysis</button></div>
          </div>
          <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-12">
            <div className="relative overflow-hidden rounded-2xl bg-espresso p-5 text-white lg:col-span-5 md:p-6">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-[60px]" />
              <div className="relative flex items-start justify-between"><div><p className="text-xs text-white/40">Revenue opportunity</p><strong className="mt-2 block font-display text-4xl md:text-5xl"><Count prefix="$" value={48} suffix="K" /></strong></div><span className="rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold text-[#65dfb9]">↑ 18%</span></div>
              <div className="relative mt-8 flex h-20 items-end gap-1.5">{[28, 38, 34, 49, 46, 63, 58, 74, 70, 91, 84, 100].map((height, index) => <motion.span key={index} initial={{ height: 0 }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ delay: index * .045, duration: .5 }} className="flex-1 rounded-t bg-gradient-to-t from-primary/45 to-primary" />)}</div>
            </div>
            {[['Business health', 82, '8 pts'], ['Growth score', 76, '8 pts']].map(([label, value, change]) => (
              <div key={label} className="rounded-2xl border border-black/[.055] bg-white p-5 lg:col-span-3">
                <div className="flex justify-between"><p className="text-xs text-textMuted">{label}</p><Activity size={16} className="text-primary" /></div>
                <strong className="mt-4 block font-display text-3xl"><Count value={value} /><small className="text-sm text-textMuted">/100</small></strong>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-peach/40"><motion.div initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease }} className="h-full rounded-full bg-gradient-to-r from-primary to-amber" /></div>
                <p className="mt-4 text-[10px] font-bold text-success">↑ {change} this month</p>
              </div>
            ))}
            <div className="hidden rounded-2xl border border-black/[.055] bg-white p-5 lg:col-span-1 lg:flex lg:flex-col lg:items-center lg:justify-between">
              <ShieldCheck className="text-primary" size={20} /><span className="vertical-label text-[9px] font-bold uppercase tracking-widest text-textMuted">Secure</span>
            </div>
            <div className="rounded-2xl border border-black/[.055] bg-white p-5 lg:col-span-8 md:p-6">
              <div className="flex items-center justify-between"><div><b className="font-display">Growth momentum</b><p className="mt-1 text-[10px] text-textMuted">A healthier trajectory every cycle</p></div><span className="rounded-lg bg-bg px-2.5 py-1.5 text-[10px] font-bold text-textMuted">Last 6 months</span></div>
              <svg className="mt-6 w-full overflow-visible" viewBox="0 0 600 120" role="img" aria-label="Upward growth momentum chart">
                <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#F2622E" stopOpacity=".26" /><stop offset="1" stopColor="#F2622E" stopOpacity="0" /></linearGradient></defs>
                {[30, 60, 90, 120].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#2B120B" strokeOpacity=".06" />)}
                <motion.path initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 }} d={`${chart} L600 120 L0 120Z`} fill="url(#area)" />
                <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.7, ease }} d={chart} fill="none" stroke="#F2622E" strokeLinecap="round" strokeWidth="4" />
              </svg>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-espresso p-5 text-white lg:col-span-4 md:p-6">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/25 blur-[45px]" />
              <div className="relative"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white"><Sparkles size={18} /></span><b className="mt-5 block font-display">AI recommendation</b><TypedRecommendation /><button className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">View action plan <ArrowRight size={13} /></button></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function IntelligenceLoop() {
  const colors = [
    { border: 'border-orange-200 bg-orange-50/40 text-orange-600', iconBg: 'bg-orange-100 text-orange-600', textLight: 'text-orange-950' },
    { border: 'border-amber-200 bg-amber-50/40 text-amber-600', iconBg: 'bg-amber-100 text-amber-600', textLight: 'text-amber-950' },
    { border: 'border-purple-300 bg-purple-50/40 text-purple-600', iconBg: 'bg-purple-100 text-purple-600', textLight: 'text-purple-950' },
    { border: 'border-emerald-200 bg-emerald-50/40 text-emerald-600', iconBg: 'bg-emerald-100 text-emerald-600', textLight: 'text-emerald-950' },
    { border: 'border-blue-200 bg-blue-50/40 text-blue-600', iconBg: 'bg-blue-100 text-blue-600', textLight: 'text-blue-950' }
  ]

  return (
    <section id="how" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="container-page">
        <SectionIntro eyebrow="Architected for precision" copy="How Ascendo choreographs multiple specialized agents through a rigorous planning, debate, and consensus cycle to find truth in your data.">
          One continuous <span className="text-primary">intelligence architecture.</span>
        </SectionIntro>

        <div className="relative mt-16 overflow-visible">
          {/* Main Flow Container */}
          <div className="grid gap-6 lg:grid-cols-5 relative z-10">
            {flowSteps.map((step, index) => {
              const Icon = step.icon
              const style = colors[index % colors.length]
              return (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  className="relative group"
                >
                  {/* Card Container */}
                  <div className={`h-full rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-warm hover:-translate-y-1 bg-white ${style.border}`}>
                    <div className="flex items-center justify-between">
                      <span className={`grid h-11 w-11 place-items-center rounded-xl shadow-sm ${style.iconBg}`}><Icon size={20} strokeWidth={1.75} /></span>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-40">{step.phase}</span>
                    </div>

                    <div className="mt-6">
                      <span className="text-[9px] font-extrabold uppercase tracking-[.18em] text-primary">{step.role}</span>
                      <h3 className={`mt-1 font-display text-lg font-extrabold ${style.textLight}`}>{step.name}</h3>
                      <p className="mt-2 text-xs text-textMuted leading-relaxed">{step.desc}</p>
                    </div>

                    {/* Bullet Points */}
                    <ul className="mt-5 space-y-2 border-t border-black/5 pt-4">
                      {step.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2 text-[11px] text-textDark">
                          <Check size={12} className="text-primary mt-0.5 shrink-0" />
                          <span className="leading-snug">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Horizontal Arrow between cards (desktop only) */}
                  {index < 4 && (
                    <div className="absolute top-[40px] -right-[18px] z-20 hidden lg:flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary overflow-visible">
                        {/* Draw-in effect: the line traces itself in as the section scrolls into view */}
                        <motion.path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          whileInView={{ pathLength: 1, opacity: 1 }}
                          viewport={{ once: true, margin: '-60px' }}
                          transition={{ duration: 0.55, delay: 0.35 + index * 0.12, ease: 'easeOut' }}
                        />
                        {/* Flowing animated dot, starts once the line has drawn in */}
                        <motion.circle
                          cx="5"
                          cy="12"
                          r="3"
                          fill="currentColor"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, cx: [5, 19, 5] }}
                          transition={{
                            opacity: { delay: 0.9 + index * 0.12, duration: 0.2 },
                            cx: { repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 1 + index * 0.3 },
                          }}
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

const ctaHeadlineWords = 'Your next growth move is already in your data.'.split(' ')

const ctaHeadlineStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
}
const ctaWord = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
}

function CtaParticles() {
  const particles = [
    { left: '8%', top: '20%', size: 3, duration: 7, delay: 0 },
    { left: '18%', top: '72%', size: 2, duration: 9, delay: 0.6 },
    { left: '32%', top: '38%', size: 2, duration: 6.5, delay: 1.2 },
    { left: '62%', top: '18%', size: 3, duration: 8, delay: 0.3 },
    { left: '78%', top: '64%', size: 2, duration: 7.5, delay: 1.6 },
    { left: '88%', top: '30%', size: 3, duration: 6, delay: 0.9 },
    { left: '48%', top: '82%', size: 2, duration: 9.5, delay: 0.4 },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-primary/50"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, boxShadow: '0 0 8px rgba(242,98,46,.7)' }}
          animate={{ y: [0, -22, 0], opacity: [0.15, 0.85, 0.15] }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function FinalCta() {
  return (
    <section className="bg-[#fbf7f3] px-4 py-16 md:px-6 md:py-24">
      <Reveal className="cta-grid relative mx-auto max-w-[1400px] overflow-hidden rounded-[30px] bg-espresso px-5 py-16 text-center text-white md:px-16 md:py-28">
        <div className="hero-noise absolute inset-0" />

        {/* Slow-moving aurora glow blobs */}
        <motion.div
          className="absolute -left-20 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[110px]"
          animate={{ x: [0, 60, 0], y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-violet-500/20 blur-[110px]"
          animate={{ x: [0, -50, 0], y: [0, 26, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut', delay: 1.5 }}
        />

        <CtaParticles />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15" />
        <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />

        <div className="relative">
          <motion.span
            animate={{ scale: [1, 1.14, 1], boxShadow: ['0 0 0px rgba(242,98,46,.4)', '0 0 28px rgba(242,98,46,.55)', '0 0 0px rgba(242,98,46,.4)'] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary"
          >
            <Sparkles />
          </motion.span>

          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={ctaHeadlineStagger}
            className="mx-auto mt-7 max-w-4xl font-display text-4xl font-extrabold tracking-[-.045em] md:text-6xl"
          >
            {ctaHeadlineWords.map((word, i) => (
              <motion.span key={i} variants={ctaWord} className="inline-block mr-[.28em] last:mr-0">
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mx-auto mt-5 max-w-xl text-white/50"
          >
            Let your AI council find it—and turn it into a plan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.045, boxShadow: '0 20px 55px rgba(242,98,46,.5)' }} whileTap={{ scale: 0.98 }} className="mt-9 inline-block rounded-xl">
              <Link to="/signup" className="btn-primary px-7 py-4">Start my free analysis <ArrowRight size={18} /></Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.95 } } }}
            className="mt-6 flex flex-wrap justify-center gap-4 text-[10px] text-white/35"
          >
            <motion.span variants={fadeUp} className="flex items-center gap-1.5"><LockKeyhole size={12} /> Private by default</motion.span>
            <motion.span variants={fadeUp} className="flex items-center gap-1.5"><ShieldCheck size={12} /> No credit card</motion.span>
          </motion.div>
        </div>
      </Reveal>
    </section>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  return (
    <div className="overflow-hidden bg-[#fbf7f3] text-espresso">
      <LandingNav />
      <main>
        <Hero navigate={navigate} reducedMotion={reducedMotion} />
        <CapabilityStrip />
        <Framework />
        <Council reducedMotion={reducedMotion} />
        <DashboardPreview />
        <IntelligenceLoop />
        <FinalCta />
      </main>
      <footer className="border-t border-white/[.07] bg-espresso py-6 text-white">
        <div className="container-page flex flex-col items-center justify-between gap-4 md:flex-row">
          <Logo light />
          <p className="order-last text-xs text-white/35 md:order-none">© 2026 Ascendo AI · Built for businesses in motion.</p>
          <div className="flex items-center gap-5 text-xs font-semibold text-white/45">
            <a className="hover:text-primary" href="#">Privacy</a>
            <a className="hover:text-primary" href="#">Terms</a>
            <Link className="hover:text-primary" to="/contact-us">Contact</Link>
            <span className="mx-1 h-3.5 w-px bg-white/15" aria-hidden />
            <a className="text-white/40 transition hover:text-primary" href="#" aria-label="Ascendo AI on LinkedIn"><Linkedin size={15} /></a>
            <a className="text-white/40 transition hover:text-primary" href="#" aria-label="Ascendo AI on X"><Twitter size={15} /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}
