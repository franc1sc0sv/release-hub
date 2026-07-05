import { useState, type FormEvent } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Building2, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useOrganization } from '@/context/organization.context'
import { CREATE_ORGANIZATION } from '@/features/organization/graphql/organization.operations'

export function CreateOrgStage() {
  const { t } = useTranslation('onboarding')
  const { setActiveOrgId, refetch } = useOrganization()
  const [name, setName] = useState('')

  const [createOrganization, { loading, error }] = useMutation(CREATE_ORGANIZATION, {
    async onCompleted(data) {
      await refetch()
      setActiveOrgId(data.createOrganization.id)
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createOrganization({ variables: { input: { name: trimmed } } })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <GlassCard glow="indigo">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="size-7 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="font-display text-display-md">{t('createOrg.title')}</CardTitle>
          <CardDescription className="text-balance">
            {t('createOrg.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="organization-name">{t('createOrg.nameLabel')}</FieldLabel>
              <Input
                id="organization-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('createOrg.namePlaceholder')}
                autoFocus
                required
              />
            </Field>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertDescription>{t('createOrg.error')}</AlertDescription>
              </Alert>
            )}
            <GradientButton
              type="submit"
              className="w-full"
              disabled={loading || !name.trim()}
              aria-label={t('createOrg.submit')}
            >
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {loading ? t('createOrg.creating') : t('createOrg.submit')}
            </GradientButton>
          </form>
        </CardContent>
      </GlassCard>
    </motion.div>
  )
}
