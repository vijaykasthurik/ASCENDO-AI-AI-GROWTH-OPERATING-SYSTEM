import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const phrases = [
  'AI',
  'Automation',
  'Agents',
  'Insights',
  'Data',
  'Growth',
  'Intelligence',
  'Innovation'
]

const leadWords = 'Run your business on'.split(' ')

const wordContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}
const wordVariant = {
  hidden: { opacity: 0, y: 26, scale: 0.94, filter: 'blur(10px)' },
  show: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function AnimatedHeadline() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const phrase = phrases[currentPhraseIndex]
    let timer

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1))
      }, 40)
    } else {
      timer = setTimeout(() => {
        setDisplayText((prev) => phrase.slice(0, prev.length + 1))
      }, 70)
    }

    if (!isDeleting && displayText === phrase) {
      timer = setTimeout(() => {
        setIsDeleting(true)
      }, 1800)
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false)
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }

    return () => clearTimeout(timer)
  }, [displayText, isDeleting, currentPhraseIndex])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-[-.04em] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] text-left">
      <motion.span
        initial={reducedMotion ? 'show' : 'hidden'}
        animate="show"
        variants={wordContainer}
        className="block text-white opacity-95"
      >
        {leadWords.map((word, i) => (
          <motion.span key={word + i} variants={wordVariant} className="inline-block mr-[.28em] will-change-transform last:mr-0">
            {word}
          </motion.span>
        ))}
      </motion.span>
      <motion.span
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, delay: leadWords.length * 0.09 + 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="headline-shimmer relative block mt-2 min-h-[1.2em] text-transparent select-none"
      >
        {displayText}
        <span className={`inline-block ml-1 text-primary font-light transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
          |
        </span>
      </motion.span>
    </h1>
  )
}
