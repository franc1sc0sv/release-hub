import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardStepperProps {
  currentStep: number
  totalSteps: number
  stepKeys: string[]
}

export function WizardStepper({ currentStep, totalSteps, stepKeys }: WizardStepperProps) {
  const { t } = useTranslation('releases')

  return (
    <nav aria-label={t('wizard.stepper.label')} className="flex items-center gap-0">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isDone = step < currentStep
        const isActive = step === currentStep

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200',
                  isDone && 'bg-indigo-500 text-white',
                  isActive && 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow-indigo',
                  !isDone && !isActive && 'bg-muted text-muted-foreground',
                )}
              >
                {isDone ? <Check className="size-3.5" aria-hidden /> : step}
              </div>
              <span
                className={cn(
                  'hidden text-xs sm:block',
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {t(stepKeys[i])}
              </span>
            </div>

            {step < totalSteps && (
              <div
                className={cn(
                  'mx-2 mb-5 h-px w-12 transition-colors duration-300 sm:w-16',
                  step < currentStep ? 'bg-indigo-500' : 'bg-border',
                )}
                aria-hidden
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
