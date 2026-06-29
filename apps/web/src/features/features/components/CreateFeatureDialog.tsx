import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GradientButton } from '@/components/nebula/GradientButton'
import { useProject } from '@/context/project.context'
import { PROJECT_TAGS } from '@/features/settings/graphql/settings.operations'
import { CREATE_FEATURE } from '../graphql/features.mutations'
import { LIST_FEATURES } from '../graphql/features.queries'

interface CreateFeatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormState {
  name: string
  description: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
}

interface FormErrors {
  name?: string
  description?: string
}

export function CreateFeatureDialog({ open, onOpenChange }: CreateFeatureDialogProps) {
  const { t } = useTranslation('features')
  const { activeProject } = useProject()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagPickerOpen, setTagPickerOpen] = useState(false)

  const { data: tagsData } = useQuery(PROJECT_TAGS, {
    variables: { projectId: activeProject?.id ?? '' },
    skip: !activeProject?.id,
    fetchPolicy: 'cache-and-network',
  })

  const projectTags = tagsData?.projectTags ?? []

  const [createFeature, { loading }] = useMutation(CREATE_FEATURE, {
    refetchQueries: [
      {
        query: LIST_FEATURES,
        variables: { projectId: activeProject?.id ?? '' },
      },
    ],
    onCompleted: (data) => {
      toast.success(t('toast.created', { name: data.createFeature.name }))
      setForm(EMPTY_FORM)
      setErrors({})
      setSelectedTags([])
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('toast.createError'))
    },
  })

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = t('fields.name')
    if (!form.description.trim()) next.description = t('fields.description')
    return next
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeProject) return
    const next = validate()
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    setErrors({})
    createFeature({
      variables: {
        input: {
          projectId: activeProject.id,
          name: form.name.trim(),
          description: form.description.trim(),
          tags: selectedTags,
        },
      },
    })
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(EMPTY_FORM)
      setErrors({})
      setSelectedTags([])
    }
    onOpenChange(next)
  }

  function toggleTag(tagName: string) {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    )
  }

  function removeTag(tagName: string) {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md glass rounded-[var(--radius-card)] border-border/60">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">
            {t('dialog.title')}
          </DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="feature-name">{t('fields.name')}</Label>
            <Input
              id="feature-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('dialog.namePlaceholder')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'feature-name-error' : undefined}
              disabled={loading}
            />
            {errors.name && (
              <p id="feature-name-error" role="alert" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="feature-description">{t('fields.description')}</Label>
            <Textarea
              id="feature-description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder={t('dialog.descriptionPlaceholder')}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? 'feature-description-error' : undefined
              }
              disabled={loading}
              rows={3}
            />
            {errors.description && (
              <p
                id="feature-description-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.description}
              </p>
            )}
          </div>

          {projectTags.length > 0 && (
            <div className="space-y-1.5">
              <Label>{t('fields.tags')}</Label>

              {selectedTags.length > 0 && (
                <div
                  className="flex flex-wrap gap-1.5"
                  role="group"
                  aria-label={t('fields.tags')}
                >
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      className="flex items-center gap-1 rounded-full border border-white/15 bg-white/8 px-2.5 py-0.5 text-xs font-medium text-foreground/80"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={t('tags.removeAria', { tag })}
                        className="flex size-3.5 items-center justify-center rounded-full text-foreground/50 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <Popover open={tagPickerOpen} onOpenChange={setTagPickerOpen}>
                <PopoverTrigger
                  aria-label={t('dialog.tagPickerAria')}
                  disabled={loading}
                  className="flex h-9 w-full items-center rounded-[var(--radius-button)] border border-white/20 bg-white/5 px-3 text-sm text-muted-foreground transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {t('dialog.tagPickerPlaceholder')}
                </PopoverTrigger>
                <PopoverContent
                  className="w-64 p-0 rounded-[var(--radius-card)] border-white/15 bg-background/95 backdrop-blur-sm"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder={t('dialog.tagSearch')} />
                    <CommandList>
                      <CommandEmpty>{t('dialog.noTags')}</CommandEmpty>
                      <CommandGroup>
                        {projectTags.map((tag) => {
                          const selected = selectedTags.includes(tag.name)
                          return (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => {
                                toggleTag(tag.name)
                              }}
                              aria-selected={selected}
                              className="flex items-center gap-2"
                            >
                              <span
                                className={`flex size-4 items-center justify-center rounded-full border transition-colors ${
                                  selected
                                    ? 'border-indigo-400 bg-indigo-400/20'
                                    : 'border-white/20'
                                }`}
                              >
                                {selected && (
                                  <span className="size-2 rounded-full bg-indigo-400" />
                                )}
                              </span>
                              {tag.name}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <DialogFooter>
            <GradientButton type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('dialog.submitting')}
                </>
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
