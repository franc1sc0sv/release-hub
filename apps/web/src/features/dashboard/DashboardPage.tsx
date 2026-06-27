import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/auth.context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function DashboardPage() {
  const { t } = useTranslation('common')
  const { user } = useAuth()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('nav.dashboard')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('common.tagline')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{user?.name ?? ''}</CardTitle>
          <CardDescription>{user?.email ?? ''}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t('common.platform')}
          {user ? ` · ${t(`roles.${user.role}`)}` : ''}
        </CardContent>
      </Card>
    </div>
  )
}
