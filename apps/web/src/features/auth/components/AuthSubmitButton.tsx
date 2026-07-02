import type { ComponentProps } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AuthSubmitButtonProps = ComponentProps<typeof Button>

export function AuthSubmitButton({ className, children, ...props }: AuthSubmitButtonProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="w-full"
    >
      <Button
        className={cn(
          'w-full border-0 bg-[linear-gradient(135deg,var(--brand-indigo-bright),var(--brand-magenta))] font-medium text-white',
          'shadow-glow-indigo transition-shadow duration-300 hover:shadow-glow-lg',
          'disabled:opacity-60',
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}
