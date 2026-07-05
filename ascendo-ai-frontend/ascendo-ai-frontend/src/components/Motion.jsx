import { motion } from 'framer-motion'

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: .55, ease: [0.22, 1, 0.36, 1] } },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: .09 } },
}

// Cinematic hero entrance: whole block rises out of a soft blur with a
// springy settle, then its children stagger in on top of that motion.
export const heroReveal = {
  hidden: { opacity: 0, y: 50, scale: 0.97, filter: 'blur(12px)' },
  show: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 60, damping: 16, mass: 1, staggerChildren: 0.14, delayChildren: 0.05 },
  },
}

export const heroItem = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

// Sequential feature-card entrance: opacity/scale/lift/tilt settling one
// after another, driven by an index-based delay passed via `custom`.
export const cardEntrance = {
  hidden: { opacity: 0, scale: 0.9, y: 30, rotate: 2 },
  show: (i = 0) => ({
    opacity: 1, scale: 1, y: 0, rotate: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function PageTransition({ children, className = '' }) {
  return (
    <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: .3 }}>
      {children}
    </motion.div>
  )
}

export function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-70px' }} transition={{ duration: .65, delay }}>
      {children}
    </motion.div>
  )
}
