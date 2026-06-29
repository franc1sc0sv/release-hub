import type { Variants, Transition } from 'motion/react'

export const easeSoft: Transition['ease'] = [0.22, 1, 0.36, 1]

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easeSoft } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeSoft } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeSoft } },
}

export const springTap = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 25 },
} as const

export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
  },
}
