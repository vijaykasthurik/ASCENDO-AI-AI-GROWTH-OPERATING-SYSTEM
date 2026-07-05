import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

export default function CountUp({ value, duration = 1.2, format = (v) => Math.round(v) }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => format(v))

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: 'easeOut' })
    return controls.stop
  }, [value])

  return <motion.span>{rounded}</motion.span>
}
