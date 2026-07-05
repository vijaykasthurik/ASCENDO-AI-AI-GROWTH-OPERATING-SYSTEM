import { lazy, Suspense, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Preloader from './components/Preloader'
import { useAuth } from './lib/AuthContext'

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Activity = lazy(() => import('./pages/Activity'))
const Council = lazy(() => import('./pages/Council'))
const Engines = lazy(() => import('./pages/Engines'))
const CopilotPage = lazy(() => import('./pages/CopilotPage'))
const Processing = lazy(() => import('./pages/Processing'))
const Settings = lazy(() => import('./pages/Settings'))
const Reports = lazy(() => import('./pages/Reports'))
const Contact = lazy(() => import('./pages/Contact'))
const PublicContact = lazy(() => import('./pages/PublicContact'))
const Signup = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Signup })))
const Login = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Login })))
const Forgot = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Forgot })))
const Reset = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Reset })))
const OnboardInput = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.OnboardInput })))

export default function App() {
  const location = useLocation()
  const [isPreloading, setIsPreloading] = useState(true)

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1)
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 120)
      }
    }
  }, [location.pathname, location.hash])

  return (
    <>
      <AnimatePresence>
        {isPreloading && (
          <Preloader onComplete={() => setIsPreloading(false)} />
        )}
      </AnimatePresence>
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-bg"><span className="h-10 w-10 animate-spin rounded-full border-4 border-peach border-t-primary" /></div>}>
        <Routes location={location}>
          <Route path="/" element={<Landing/>}/>
          <Route path="/contact-us" element={<PublicContact/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/forgot" element={<Forgot/>}/>
          <Route path="/reset" element={<Reset/>}/>
          <Route path="/onboarding" element={<RequireAuth><OnboardInput/></RequireAuth>}/>
          <Route path="/processing" element={<RequireAuth><Processing/></RequireAuth>}/>
          <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>}/>
          <Route path="/activity" element={<RequireAuth><Activity/></RequireAuth>}/>
          <Route path="/council" element={<RequireAuth><Council/></RequireAuth>}/>
          <Route path="/engines" element={<RequireAuth><Engines/></RequireAuth>}/>
          <Route path="/reports" element={<RequireAuth><Reports/></RequireAuth>}/>
          <Route path="/copilot" element={<RequireAuth><CopilotPage/></RequireAuth>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/settings" element={<RequireAuth><Settings/></RequireAuth>}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </Suspense>
    </>
  )
}
