import type { ComponentProps } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type GradientButtonProps = ComponentProps<typeof Button>

export function GradientButton({ className, children, ...props }: GradientButtonProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="inline-block"
    >
      <Button
        className={cn('px-6 font-medium', className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}
