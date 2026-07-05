import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import logoImg from '../logo-mark.svg'

export default function Preloader({ onComplete }) {
  const fullText = 'Ascendo AI'
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(fullText)
      const finishTimer = setTimeout(onComplete, 350)
      return () => clearTimeout(finishTimer)
    }
    let i = 0
    let finishTimer
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText((prev) => prev + fullText.charAt(i))
        i++
      } else {
        clearInterval(typeInterval)
        finishTimer = setTimeout(onComplete, 450)
      }
    }, 75)

    return () => {
      clearInterval(typeInterval)
      clearTimeout(finishTimer)
    }
  }, [onComplete, reducedMotion])

  useEffect(() => {
    if (reducedMotion) return undefined
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 450)
    return () => clearInterval(cursorInterval)
  }, [reducedMotion])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="hero-grid fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-espresso text-white"
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="relative h-16 w-16 shadow-glow rounded-2xl overflow-hidden bg-white/10 p-1 flex items-center justify-center"
        >
          <motion.img
            src={logoImg}
            className="h-full w-full object-contain"
            alt=""
            aria-hidden="true"
            animate={reducedMotion ? {} : { scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="font-display text-4xl font-extrabold tracking-tight flex items-center select-none">
          <span>
            {displayText.slice(0, 8)}
            {displayText.length > 8 && (
              <span className="text-primary">{displayText.slice(8)}</span>
            )}
          </span>
          <span className={`ml-0.5 text-primary font-light ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
            |
          </span>
        </div>
      </div>
    </motion.div>
  )
}
