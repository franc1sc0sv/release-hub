import { useState, type FormEvent } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/nebula/GradientButton'
import { useOrganization } from '@/context/organization.context'
import { CREATE_ORGANIZATION } from '../graphql/organization.operations'

interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrganizationDialog({ open, onOpenChange }: CreateOrganizationDialogProps) {
  const { t } = useTranslation('organization')
  const { setActiveOrgId, refetch } = useOrganization()
  const [name, setName] = useState('')

  const [createOrganization, { loading, error }] = useMutation(CREATE_ORGANIZATION, {
    async onCompleted(data) {
      await refetch()
      setActiveOrgId(data.createOrganization.id)
      setName('')
      onOpenChange(false)
    },
  })

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createOrganization({ variables: { input: { name: trimmed } } })
  }

  function handleOpenChange(next: boolean): void {
    if (!next) setName('')
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{t('create.title')}</DialogTitle>
            <DialogDescription>{t('create.description')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="organization-name">{t('create.nameLabel')}</Label>
            <Input
              id="organization-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('create.namePlaceholder')}
              autoFocus
              required
            />
            {error && <p className="text-sm text-destructive">{t('create.error')}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {t('create.cancel')}
            </Button>
            <GradientButton type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('create.creating')}
                </>
              ) : (
                t('create.submit')
              )}
            </GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
