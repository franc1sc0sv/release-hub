import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FlagActivityFilterOption } from '../constants/flag-enums'
import type { FlagActivityFilter } from '@/generated/graphql'

interface FlagActivityFilterControlProps {
  value: FlagActivityFilter | undefined
  onChange: (value: FlagActivityFilter | undefined) => void
}

export function FlagActivityFilterControl({ value, onChange }: FlagActivityFilterControlProps) {
  const { t } = useTranslation('flags')
  const enumLabels = useEnumLabels()

  function handleChange(next: string | null) {
    if (!next || next === FlagActivityFilterOption.ALL) {
      onChange(undefined)
      return
    }
    onChange(next as FlagActivityFilter)
  }

  return (
    <Select value={value ?? FlagActivityFilterOption.ALL} onValueChange={handleChange}>
      <SelectTrigger size="sm" aria-label={t('filters.activity.label')} className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={FlagActivityFilterOption.ALL}>{t('filters.activity.all')}</SelectItem>
        <SelectItem value={FlagActivityFilterOption.ACTIVE}>
          {enumLabels.flagActivityFilter(FlagActivityFilterOption.ACTIVE)}
        </SelectItem>
        <SelectItem value={FlagActivityFilterOption.INACTIVE}>
          {enumLabels.flagActivityFilter(FlagActivityFilterOption.INACTIVE)}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
