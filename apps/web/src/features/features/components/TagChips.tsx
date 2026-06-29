import { useState, useRef, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { SET_FEATURE_TAGS } from '../graphql/features.mutations'
import { LIST_FEATURES } from '../graphql/features.queries'
import { GET_FEATURE } from '../graphql/features.queries'

interface TagChipsProps {
  featureId: string
  projectId: string
  tags: string[]
}

function TagChipsEditable({ featureId, projectId, tags }: TagChipsProps) {
  const { t } = useTranslation('features')
  const [optimisticTags, setOptimisticTags] = useState<string[]>(tags)
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [setFeatureTags] = useMutation(SET_FEATURE_TAGS, {
    refetchQueries: [
      { query: LIST_FEATURES, variables: { projectId } },
      { query: GET_FEATURE, variables: { id: featureId } },
    ],
    awaitRefetchQueries: false,
  })

  async function applyTags(nextTags: string[]) {
    const previousTags = optimisticTags
    setOptimisticTags(nextTags)

    try {
      await setFeatureTags({ variables: { input: { featureId, tags: nextTags } } })
      toast.success(t('toast.tagsChanged'))
    } catch {
      setOptimisticTags(previousTags)
      toast.error(t('toast.tagsError'))
    }
  }

  function removeTag(tag: string) {
    applyTags(optimisticTags.filter((t) => t !== tag))
  }

  function addTag(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed || optimisticTags.includes(trimmed)) return
    applyTags([...optimisticTags, trimmed])
    setInputValue('')
    setInputVisible(false)
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Escape') {
      setInputVisible(false)
      setInputValue('')
    }
  }

  function showInput() {
    setInputVisible(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label={t('fields.tags')}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {optimisticTags.map((tag) => (
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

      {inputVisible ? (
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={() => {
            addTag(inputValue)
          }}
          placeholder={t('tags.placeholder')}
          aria-label={t('tags.add')}
          className="h-6 w-24 rounded-[var(--radius-button)] border border-white/20 bg-white/10 px-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ) : (
        <button
          type="button"
          onClick={showInput}
          aria-label={t('tags.add')}
          className="flex size-6 items-center justify-center rounded-[var(--radius-button)] border border-dashed border-white/20 text-muted-foreground/60 transition-colors hover:border-white/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Plus className="size-3" />
        </button>
      )}
    </div>
  )
}

export function TagChips(props: TagChipsProps) {
  return (
    <Can I={Action.UPDATE} a={Subject.FEATURE} passThrough>
      {(allowed) =>
        allowed ? (
          <TagChipsEditable {...props} />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {props.tags.map((tag) => (
              <Badge
                key={tag}
                className="rounded-full border border-white/15 bg-white/8 px-2.5 py-0.5 text-xs font-medium text-foreground/80"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )
      }
    </Can>
  )
}
