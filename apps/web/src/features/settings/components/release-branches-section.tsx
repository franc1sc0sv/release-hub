import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { GitBranch, Loader2, X } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { BranchCombobox } from '@/features/releases/components/BranchCombobox'
import { BranchUpdateMethodValue } from '@/features/releases/constants/release-enums'
import type { BranchUpdateMethod } from '@/generated/graphql'
import { useReleaseBranches } from '../hooks/use-release-branches'

interface ReleaseBranchesSectionProps {
  projectId: string
}

const METHOD_OPTIONS: readonly BranchUpdateMethod[] = [
  BranchUpdateMethodValue.REBASE,
  BranchUpdateMethodValue.MERGE,
]

function isBranchUpdateMethod(value: unknown): value is BranchUpdateMethod {
  return METHOD_OPTIONS.some((method) => method === value)
}

export function ReleaseBranchesSection({ projectId }: ReleaseBranchesSectionProps) {
  const { t } = useTranslation('settings')
  const { branchUpdateMethod, defaultParentBranch, loading, saving, saveReleaseBranches } =
    useReleaseBranches(projectId)

  const [method, setMethod] = useState<BranchUpdateMethod>(BranchUpdateMethodValue.REBASE)
  const [parentBranch, setParentBranch] = useState('')

  useEffect(() => {
    if (!branchUpdateMethod) return
    setMethod(branchUpdateMethod)
    setParentBranch(defaultParentBranch ?? '')
  }, [branchUpdateMethod, defaultParentBranch])

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    try {
      await saveReleaseBranches(method, parentBranch)
      toast.success(t('releaseBranches.saveSuccess'))
    } catch {
      toast.error(t('releaseBranches.saveError'))
    }
  }

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <GitBranch className="size-4 text-muted-foreground" aria-hidden />
          {t('releaseBranches.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Can I={Action.UPDATE} a={Subject.PROJECT} passThrough>
          {(allowed) => (
            <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-6">
              <p className="text-sm text-muted-foreground">{t('releaseBranches.description')}</p>

              <div className="space-y-2">
                <Label htmlFor="default-parent-branch">
                  {t('releaseBranches.parentBranch.label')}
                </Label>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 max-w-sm flex-1">
                    <BranchCombobox
                      id="default-parent-branch"
                      projectId={projectId}
                      value={parentBranch}
                      onChange={setParentBranch}
                      placeholder={t('releaseBranches.parentBranch.placeholder')}
                      disabled={!allowed || saving || loading}
                    />
                  </div>
                  {parentBranch && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('releaseBranches.parentBranch.clear')}
                      disabled={!allowed || saving}
                      onClick={() => setParentBranch('')}
                    >
                      <X className="size-3.5" aria-hidden />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('releaseBranches.parentBranch.hint')}
                </p>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-foreground">
                  {t('releaseBranches.method.label')}
                </legend>
                <RadioGroup
                  value={method}
                  onValueChange={(value) => {
                    if (isBranchUpdateMethod(value)) setMethod(value)
                  }}
                  disabled={!allowed || saving || loading}
                  className="gap-3"
                >
                  {METHOD_OPTIONS.map((option) => (
                    <div key={option} className="flex items-start gap-3">
                      <RadioGroupItem
                        id={`branch-update-method-${option}`}
                        value={option}
                        className="mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor={`branch-update-method-${option}`}>
                          {t(`releaseBranches.method.${option}.label`)}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t(`releaseBranches.method.${option}.help`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>

              {allowed && (
                <Button type="submit" disabled={saving || loading}>
                  {saving && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                  {t('releaseBranches.save')}
                </Button>
              )}
            </form>
          )}
        </Can>
      </CardContent>
    </GlassCard>
  )
}
