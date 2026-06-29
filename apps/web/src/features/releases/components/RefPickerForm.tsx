import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GradientButton } from '@/components/nebula/GradientButton'

interface RefPickerValues {
  baseRef: string
  compareRef: string
  name: string
}

interface RefPickerFormProps {
  onDetect: (values: RefPickerValues) => void
  detecting: boolean
}

export function RefPickerForm({ onDetect, detecting }: RefPickerFormProps) {
  const { t } = useTranslation('releases')

  const [baseRef, setBaseRef] = useState('')
  const [compareRef, setCompareRef] = useState('')
  const [name, setName] = useState('')

  const canSubmit = baseRef.trim() !== '' && compareRef.trim() !== '' && !detecting

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onDetect({ baseRef: baseRef.trim(), compareRef: compareRef.trim(), name: name.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="base-ref">{t('fields.baseRef')}</Label>
          <Input
            id="base-ref"
            placeholder={t('fields.baseRefPlaceholder')}
            value={baseRef}
            onChange={(e) => setBaseRef(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compare-ref">{t('fields.compareRef')}</Label>
          <Input
            id="compare-ref"
            placeholder={t('fields.compareRefPlaceholder')}
            value={compareRef}
            onChange={(e) => setCompareRef(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="release-name">{t('fields.name')}</Label>
          <Input
            id="release-name"
            placeholder={t('fields.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <GradientButton type="submit" disabled={!canSubmit}>
          <Search className="mr-2 size-4" />
          {detecting ? t('builder.detecting') : t('builder.detect')}
        </GradientButton>
      </div>
    </form>
  )
}
