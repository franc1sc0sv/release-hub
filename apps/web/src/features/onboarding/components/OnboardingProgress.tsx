import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type OnboardingStep = 'connectGithub' | 'selectRepo'

interface OnboardingProgressProps {
  currentStep: OnboardingStep
}

const STEP_ORDER: readonly OnboardingStep[] = ['connectGithub', 'selectRepo']

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const { t } = useTranslation('onboarding')
  const currentIndex = STEP_ORDER.indexOf(currentStep)

  return (
    <ol className="glass flex items-center gap-2 rounded-[var(--radius-card)] px-4 py-2.5">
      {STEP_ORDER.map((step, index) => {
        const isComplete = index < currentIndex
        const isActive = index === currentIndex

        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-medium transition-colors',
                isComplete && 'bg-brand-indigo-bright text-white',
                isActive && !isComplete && 'bg-nebula-gradient text-white shadow-glow-sm',
                !isActive && !isComplete && 'bg-muted text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {isComplete ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-sm font-medium',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {t(`progress.${step}`)}
            </span>
            {index < STEP_ORDER.length - 1 && (
              <span className="mx-1 h-px w-8 bg-border" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
