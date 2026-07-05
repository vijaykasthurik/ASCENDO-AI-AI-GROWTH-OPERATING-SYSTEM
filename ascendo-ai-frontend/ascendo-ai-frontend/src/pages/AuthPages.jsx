import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AnimatedInput from '../components/AnimatedInput'
import Logo from '../components/Logo'
import { PageTransition } from '../components/Motion'
import { useAuth } from '../lib/AuthContext'
import { forgotPassword, listProjects, resetPassword, setProjectId, verifyOtp } from '../lib/api'

// Mirrors the backend's password policy (app/core/security.py) so users get
// instant feedback instead of a round-trip 422.
function getPasswordChecks(password) {
  return [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Upper & lowercase letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'A number', ok: /\d/.test(password) },
    { label: 'A special character', ok: /[^\w\s]/.test(password) },
  ]
}

function PasswordChecklist({ password }) {
  const checks = getPasswordChecks(password)
  return (
    <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
      {checks.map((c) => (
        <li key={c.label} className={`flex items-center gap-1.5 text-[11px] font-medium transition ${c.ok ? 'text-success' : 'text-textMuted'}`}>
          <Check size={12} className={c.ok ? 'opacity-100' : 'opacity-25'} />
          {c.label}
        </li>
      ))}
    </ul>
  )
}

function BrandPanel() {
  return (
    <aside className="dark-grid relative hidden min-h-screen overflow-hidden p-12 text-white lg:flex lg:flex-col">
      <Logo light />
      <div className="relative z-10 my-auto max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-peach"><Sparkles size={14} /> Cognitive Board Orchestration</motion.div>
        <h2 className="font-display text-5xl font-extrabold leading-tight">Turn your business data into your next best move.</h2>
        <p className="mt-5 leading-relaxed text-white/50">Autonomous Cognitive specialists analyze your business together, then deliver one focused growth plan.</p>
        <div className="mt-10 flex items-center gap-3"><div className="flex -space-x-2">{['AM','SK','JL'].map((x,i)=><span key={x} className="grid h-9 w-9 place-items-center rounded-full border-2 border-espresso bg-peach text-[10px] font-bold text-espresso">{x}</span>)}</div><p className="text-xs text-white/45"><b className="block text-white">1,200+ growth plans</b>created this month</p></div>
      </div>
      {[['12%', '18%', 70], ['70%', '68%', 0], ['38%', '30%', 110]].map(([l,t,d],i)=><motion.span key={i} animate={{ y: [0,-20,0], x:[0,12,0] }} transition={{duration:5+i,repeat:Infinity,delay:i}} className="absolute h-48 w-48 rounded-full bg-primary/15 blur-3xl" style={{left:l,top:t,marginTop:d}}/>)}
      <p className="relative z-10 text-xs text-white/30">© 2026 Ascendo AI</p>
    </aside>
  )
}

function AuthShell({ children }) {
  return (
    <PageTransition className="grid min-h-screen bg-[#F8F4F0] lg:grid-cols-[1.02fr_.98fr] overflow-hidden relative">
      <BrandPanel />
      <main className="relative grid place-items-center px-5 py-14 overflow-hidden w-full">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-[80px]" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-amber/10 blur-[85px]" />
        
        <Link to="/" className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-bold text-textMuted hover:text-primary transition duration-300">
          <ArrowLeft size={16}/> Home
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white/80 p-8 shadow-warm backdrop-blur-xl relative z-10"
        >
          {children}
        </motion.div>
      </main>
    </PageTransition>
  )
}

function SubmitButton({ state, children }) {
  return <motion.button whileTap={{scale:.98}} disabled={state === 'loading'} className="btn-primary mt-8 h-13 w-full py-4">{state === 'loading' ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"/> : state === 'success' ? <><Check size={19}/> All set</> : <>{children}<ArrowRight size={17}/></>}</motion.button>
}

export function Signup() {
  const [form, setForm] = useState({name:'',email:'',password:'',confirmPassword:''});
  const [state,setState]=useState('idle');
  const [pwdError, setPwdError] = useState(false);
  const [error, setError] = useState('');
  const navigate=useNavigate()
  const { register } = useAuth()
  const passwordChecks = getPasswordChecks(form.password)
  const isPasswordValid = passwordChecks.every((c) => c.ok)
  const submit=async (e)=>{
    e.preventDefault();
    if(form.password !== form.confirmPassword) {
      setPwdError(true);
      setTimeout(() => setPwdError(false), 2000);
      return;
    }
    if(!isPasswordValid) {
      setError('Please meet all the password requirements below.')
      return;
    }
    setState('loading');
    setError('')
    try {
      await register({ email: form.email, password: form.password, full_name: form.name })
      setState('success')
      setTimeout(()=>navigate('/onboarding', { state: { showPricing: true } }),650)
    } catch (err) {
      setError(err.message || 'Could not create your account.')
      setState('idle')
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow">Create your workspace</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">Let’s grow something.</h1>
      <p className="mt-3 text-sm text-textMuted">Your first business analysis is on us.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <AnimatedInput label="Your name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <AnimatedInput label="Work email" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <div>
          <AnimatedInput label="Password" type="password" required minLength={8} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
          {form.password && <PasswordChecklist password={form.password} />}
        </div>
        <AnimatedInput label="Confirm Password" type="password" required value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})}/>
        {pwdError && <p className="text-xs font-semibold text-danger">Passwords do not match.</p>}
        {error && <p className="text-xs font-semibold text-danger">{error}</p>}
        <SubmitButton state={state}>Create free account</SubmitButton>
      </form>
      <p className="mt-7 text-center text-sm text-textMuted">Already have an account? <Link className="font-bold text-primary" to="/login">Log in</Link></p>
    </AuthShell>
  )
}

export function Login() {
  const [form,setForm]=useState({email:'',password:''});
  const [state,setState]=useState('idle');
  const [error,setError]=useState('');
  const navigate=useNavigate()
  const { login } = useAuth()
  const submit=async (e)=>{
    e.preventDefault();
    setState('loading');
    setError('')
    try {
      await login({ email: form.email, password: form.password })
      setState('success')
      const projects = await listProjects().catch(() => [])
      const latest = projects[0]
      let dest = '/onboarding'
      if (latest) {
        setProjectId(latest.id)
        dest = latest.status === 'completed' ? '/dashboard' : '/processing'
      }
      setTimeout(()=>navigate(dest),600)
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
      setState('idle')
      setTimeout(()=>setError(''),3000)
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold">Good to see you.</h1>
      <p className="mt-3 text-sm text-textMuted">Your AI council is ready when you are.</p>
      <motion.form animate={error?{x:[0,-8,8,-5,5,0]}:{}} onSubmit={submit} className="mt-8 space-y-4">
        <AnimatedInput label="Email address" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <AnimatedInput label="Password" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        <div className="pt-1 text-right">
          <Link className="text-xs font-bold text-primary" to="/forgot">Forgot password?</Link>
        </div>
        {error&&<p className="text-sm font-semibold text-danger">{error}</p>}
        <SubmitButton state={state}>Log in</SubmitButton>
      </motion.form>
      <p className="mt-7 text-center text-sm text-textMuted">New to Ascendo? <Link className="font-bold text-primary" to="/signup">Create an account</Link></p>
    </AuthShell>
  )
}

function MinimalCard({icon:Icon,title,text,children}) {
  return (
    <PageTransition className="grid min-h-screen place-items-center bg-[#F8F4F0] px-5 py-16 overflow-hidden relative">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-[80px]" />
      <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-amber/10 blur-[85px]" />
      
      <Link to="/" className="absolute left-6 top-6"><Logo /></Link>
      <motion.div 
        initial={{opacity:0,y:20}} 
        animate={{opacity:1,y:0}} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white/80 p-8 shadow-warm backdrop-blur-xl relative z-10"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-peach/50 text-primary"><Icon/></span>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-espresso">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-textMuted">{text}</p>
        {children}
      </motion.div>
    </PageTransition>
  )
}

export function Forgot() {
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const sendCode = async (e) => {
    e.preventDefault()
    setState('loading'); setError('')
    try {
      await forgotPassword(email)
      setState('idle')
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Could not send a verification code.')
      setState('idle')
    }
  }

  const confirmCode = async (e) => {
    e.preventDefault()
    setState('loading'); setError('')
    try {
      const { reset_token } = await verifyOtp(email, otp)
      navigate('/reset', { state: { resetToken: reset_token, email } })
    } catch (err) {
      setError(err.message || 'Invalid or expired code.')
      setState('idle')
    }
  }

  if (step === 'otp') {
    return (
      <MinimalCard icon={Mail} title="Enter your code" text={`We sent a 6-digit verification code to ${email}. It expires in 10 minutes.`}>
        <form onSubmit={confirmCode} className="mt-6 space-y-3">
          <AnimatedInput
            label="Verification code"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          {error && <p className="text-xs font-semibold text-danger">{error}</p>}
          <SubmitButton state={state}>Verify code</SubmitButton>
        </form>
        <button onClick={() => { setStep('email'); setError('') }} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-bold text-textMuted">
          <ArrowLeft size={15} /> Use a different email
        </button>
      </MinimalCard>
    )
  }

  return (
    <MinimalCard icon={Mail} title="Reset your password" text="Enter the email linked to your workspace and we’ll send you a verification code.">
      <form onSubmit={sendCode} className="mt-6">
        <AnimatedInput label="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="mt-3 text-xs font-semibold text-danger">{error}</p>}
        <SubmitButton state={state}>Send verification code</SubmitButton>
      </form>
      <Link to="/login" className="mt-7 flex items-center justify-center gap-2 text-sm font-bold text-textMuted"><ArrowLeft size={15}/> Back to login</Link>
    </MinimalCard>
  )
}

export function Reset() {
  const location = useLocation()
  const navigate = useNavigate()
  const resetToken = location.state?.resetToken

  const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [done,setDone]=useState(false)
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!resetToken) navigate('/forgot', { replace: true })
  }, [resetToken, navigate])

  const passwordChecks = getPasswordChecks(password)
  const isPasswordValid = passwordChecks.every((c) => c.ok)

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (!isPasswordValid) { setError('Please meet all the password requirements below.'); return }
    setState('loading'); setError('')
    try {
      await resetPassword(resetToken, password)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Could not reset your password.')
      setState('idle')
    }
  }

  if (!resetToken) return null

  return (
    <MinimalCard icon={LockKeyhole} title={done?'Password updated':'Choose a new password'} text={done?'Your account is secure and your new password is ready to use.':'Your new password must meet all the requirements below.'}>
      {done ? (
        <Link to="/login" className="btn-primary mt-7 w-full">Continue to login <ArrowRight size={17}/></Link>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <AnimatedInput label="New password" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/>
            {password && <PasswordChecklist password={password} />}
          </div>
          <AnimatedInput label="Confirm password" type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/>
          {error && <p className="text-xs font-semibold text-danger">{error}</p>}
          <SubmitButton state={state}>Update password</SubmitButton>
        </form>
      )}
    </MinimalCard>
  )
}
