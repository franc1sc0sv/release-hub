import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/nebula/GradientButton'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { SummaryProfilesQuery } from '@/generated/graphql'
import { useSummaryProfiles } from '../hooks/use-summary-profiles'
import { SummaryExampleKindValue } from '../constants/summary-profile-enums'
import {
  SummaryProfileExampleRow,
  type ExampleFormState,
} from './summary-profile-example-row'

type SummaryProfileListItem = SummaryProfilesQuery['summaryProfiles'][number]

const MAX_RULES = 20
const MAX_EXAMPLES = 10
const MAX_NAME_LENGTH = 80
const MAX_DESCRIPTION_LENGTH = 280
const MAX_OUTPUT_TEMPLATE_LENGTH = 8000
const MAX_RULE_LENGTH = 500
const MAX_EXAMPLE_CONTENT_LENGTH = 4000
const MAX_EXAMPLE_EXPLANATION_LENGTH = 500

interface RuleFormState {
  id: string
  content: string
}

interface FormState {
  name: string
  description: string
  outputTemplate: string
  rules: RuleFormState[]
  examples: ExampleFormState[]
}

interface FormErrors {
  name?: string
  description?: string
  outputTemplate?: string
  rules?: string
  ruleItems: Record<number, string>
  examples?: string
  exampleItems: Record<number, { content?: string; explanation?: string }>
}

function createId(): string {
  return crypto.randomUUID()
}

function emptyForm(): FormState {
  return {
    name: '',
    description: '',
    outputTemplate: '',
    rules: [],
    examples: [],
  }
}

function formFromProfile(profile: SummaryProfileListItem): FormState {
  return {
    name: profile.name,
    description: profile.description ?? '',
    outputTemplate: profile.outputTemplate ?? '',
    rules: profile.rules.map((rule) => ({ id: rule.id, content: rule.content })),
    examples: profile.examples.map((example) => ({
      id: example.id,
      kind: example.kind,
      content: example.content,
      explanation: example.explanation,
    })),
  }
}

function isEmptyErrors(errors: FormErrors): boolean {
  return (
    !errors.name &&
    !errors.description &&
    !errors.outputTemplate &&
    !errors.rules &&
    !errors.examples &&
    Object.keys(errors.ruleItems).length === 0 &&
    Object.keys(errors.exampleItems).length === 0
  )
}

interface SummaryProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  profile: SummaryProfileListItem | null
}

export function SummaryProfileDialog({
  open,
  onOpenChange,
  projectId,
  profile,
}: SummaryProfileDialogProps) {
  const { t } = useTranslation('summaryProfiles')
  const { createProfile, updateProfile, creating, updating } = useSummaryProfiles(projectId)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [errors, setErrors] = useState<FormErrors>({ ruleItems: {}, exampleItems: {} })

  const isEditing = profile !== null
  const submitting = creating || updating

  useEffect(() => {
    if (!open) return
    setForm(profile ? formFromProfile(profile) : emptyForm())
    setErrors({ ruleItems: {}, exampleItems: {} })
  }, [open, profile])

  function validate(): FormErrors {
    const next: FormErrors = { ruleItems: {}, exampleItems: {} }

    if (!form.name.trim()) {
      next.name = t('dialog.validation.nameRequired')
    } else if (form.name.length > MAX_NAME_LENGTH) {
      next.name = t('dialog.validation.nameTooLong', { max: MAX_NAME_LENGTH })
    }

    if (form.description.length > MAX_DESCRIPTION_LENGTH) {
      next.description = t('dialog.validation.descriptionTooLong', {
        max: MAX_DESCRIPTION_LENGTH,
      })
    }

    if (form.outputTemplate.length > MAX_OUTPUT_TEMPLATE_LENGTH) {
      next.outputTemplate = t('dialog.validation.outputTemplateTooLong', {
        max: MAX_OUTPUT_TEMPLATE_LENGTH,
      })
    }

    if (form.rules.length > MAX_RULES) {
      next.rules = t('dialog.validation.tooManyRules', { max: MAX_RULES })
    }
    form.rules.forEach((rule, index) => {
      if (!rule.content.trim()) {
        next.ruleItems[index] = t('dialog.validation.ruleRequired')
      } else if (rule.content.length > MAX_RULE_LENGTH) {
        next.ruleItems[index] = t('dialog.validation.ruleTooLong', { max: MAX_RULE_LENGTH })
      }
    })

    if (form.examples.length > MAX_EXAMPLES) {
      next.examples = t('dialog.validation.tooManyExamples', { max: MAX_EXAMPLES })
    }
    form.examples.forEach((example, index) => {
      const itemErrors: { content?: string; explanation?: string } = {}
      if (!example.content.trim()) {
        itemErrors.content = t('dialog.validation.exampleContentRequired')
      } else if (example.content.length > MAX_EXAMPLE_CONTENT_LENGTH) {
        itemErrors.content = t('dialog.validation.exampleContentTooLong', {
          max: MAX_EXAMPLE_CONTENT_LENGTH,
        })
      }
      if (!example.explanation.trim()) {
        itemErrors.explanation = t('dialog.validation.exampleExplanationRequired')
      } else if (example.explanation.length > MAX_EXAMPLE_EXPLANATION_LENGTH) {
        itemErrors.explanation = t('dialog.validation.exampleExplanationTooLong', {
          max: MAX_EXAMPLE_EXPLANATION_LENGTH,
        })
      }
      if (itemErrors.content || itemErrors.explanation) {
        next.exampleItems[index] = itemErrors
      }
    })

    return next
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    const next = validate()
    if (!isEmptyErrors(next)) {
      setErrors(next)
      return
    }
    setErrors({ ruleItems: {}, exampleItems: {} })

    const rules = form.rules.map((rule) => ({ content: rule.content.trim() }))
    const examples = form.examples.map((example) => ({
      kind: example.kind,
      content: example.content,
      explanation: example.explanation.trim(),
    }))

    try {
      if (profile) {
        await updateProfile({
          profileId: profile.id,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          outputTemplate: form.outputTemplate || undefined,
          rules,
          examples,
        })
        toast.success(t('toast.updated', { name: form.name.trim() }))
      } else {
        await createProfile({
          projectId,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          outputTemplate: form.outputTemplate || undefined,
          rules,
          examples,
        })
        toast.success(t('toast.created', { name: form.name.trim() }))
      }
      onOpenChange(false)
    } catch {
      toast.error(isEditing ? t('toast.updateError') : t('toast.createError'))
    }
  }

  function addRule(): void {
    setForm((prev) => ({
      ...prev,
      rules: [...prev.rules, { id: createId(), content: '' }],
    }))
  }

  function updateRule(index: number, content: string): void {
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) => (i === index ? { ...rule, content } : rule)),
    }))
  }

  function removeRule(index: number): void {
    setForm((prev) => ({ ...prev, rules: prev.rules.filter((_, i) => i !== index) }))
  }

  function addExample(): void {
    setForm((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        { id: createId(), kind: SummaryExampleKindValue.GOOD, content: '', explanation: '' },
      ],
    }))
  }

  function updateExample(index: number, value: ExampleFormState): void {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.map((example, i) => (i === index ? value : example)),
    }))
  }

  function removeExample(index: number): void {
    setForm((prev) => ({ ...prev, examples: prev.examples.filter((_, i) => i !== index) }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl glass rounded-[var(--radius-card)] border-border/60">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">
            {isEditing ? t('dialog.editTitle') : t('dialog.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-5 pb-1">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">{t('dialog.fields.name')}</Label>
                <Input
                  id="profile-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t('dialog.namePlaceholder')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'profile-name-error' : undefined}
                  disabled={submitting}
                />
                {errors.name && (
                  <p id="profile-name-error" role="alert" className="text-sm text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-description">{t('dialog.fields.description')}</Label>
                <Textarea
                  id="profile-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={t('dialog.descriptionPlaceholder')}
                  aria-invalid={!!errors.description}
                  aria-describedby={
                    errors.description ? 'profile-description-error' : undefined
                  }
                  disabled={submitting}
                  rows={2}
                />
                {errors.description && (
                  <p
                    id="profile-description-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{t('dialog.fields.outputTemplate')}</Label>
                <RichTextEditor
                  value={form.outputTemplate}
                  onChange={(outputTemplate) =>
                    setForm((prev) => ({ ...prev, outputTemplate }))
                  }
                  editable={!submitting}
                  placeholder={t('dialog.outputTemplatePlaceholder')}
                />
                {errors.outputTemplate && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.outputTemplate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('dialog.fields.rules')}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addRule}
                    disabled={submitting || form.rules.length >= MAX_RULES}
                  >
                    <Plus className="size-3.5" />
                    {t('dialog.rules.add')}
                  </Button>
                </div>
                {errors.rules && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.rules}
                  </p>
                )}
                {form.rules.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('dialog.rules.empty')}</p>
                )}
                <div className="space-y-2">
                  {form.rules.map((rule, index) => (
                    <div key={rule.id} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <Input
                          value={rule.content}
                          onChange={(e) => updateRule(index, e.target.value)}
                          placeholder={t('dialog.rules.placeholder')}
                          disabled={submitting}
                          aria-label={t('dialog.rules.ariaLabel', { index: index + 1 })}
                          aria-invalid={!!errors.ruleItems[index]}
                        />
                        {errors.ruleItems[index] && (
                          <p role="alert" className="text-sm text-destructive">
                            {errors.ruleItems[index]}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeRule(index)}
                        disabled={submitting}
                        aria-label={t('dialog.rules.removeAria', { index: index + 1 })}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('dialog.fields.examples')}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addExample}
                    disabled={submitting || form.examples.length >= MAX_EXAMPLES}
                  >
                    <Plus className="size-3.5" />
                    {t('dialog.examples.add')}
                  </Button>
                </div>
                {errors.examples && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.examples}
                  </p>
                )}
                {form.examples.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('dialog.examples.empty')}</p>
                )}
                <div className="space-y-3">
                  {form.examples.map((example, index) => (
                    <SummaryProfileExampleRow
                      key={example.id}
                      index={index}
                      value={example}
                      errors={errors.exampleItems[index]}
                      disabled={submitting}
                      onChange={updateExample}
                      onRemove={removeExample}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <GradientButton type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('dialog.submitting')}
                </>
              ) : isEditing ? (
                t('dialog.saveChanges')
              ) : (
                t('dialog.submit')
              )}
            </GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
