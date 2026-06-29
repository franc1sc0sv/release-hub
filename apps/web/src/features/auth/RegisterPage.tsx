import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useApolloClient } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, User } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/context/auth.context'
import { REGISTER_MUTATION } from '@/features/auth/graphql/auth.operations'
import {
  MeDocument,
  type RegisterMutation,
  type RegisterMutationVariables,
  type MeQuery,
} from '@/generated/graphql'

export function RegisterPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const client = useApolloClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [register, { loading }] = useMutation<RegisterMutation, RegisterMutationVariables>(
    REGISTER_MUTATION,
  )

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    try {
      const result = await register({ variables: { input: { name, email, password } } })
      const tokens = result.data?.register
      if (!tokens) return
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
      const meResult = await client.query<MeQuery>({
        query: MeDocument,
        fetchPolicy: 'network-only',
      })
      if (meResult.data) setUser(meResult.data.me)
      navigate(ROUTES.ONBOARDING, { replace: true })
    } catch (err) {
      const graphqlErrors =
        err instanceof Error && 'graphQLErrors' in err
          ? (err as { graphQLErrors: Array<{ extensions?: { code?: string } }> }).graphQLErrors
          : []
      const code = graphqlErrors[0]?.extensions?.code
      if (code === 'EMAIL_ALREADY_EXISTS') {
        setError(t('auth.emailAlreadyExists'))
      } else {
        setError(t('auth.registerError'))
      }
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <ThemeToggle />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-display">
                {t('auth.createAccount')}
              </CardTitle>
              <CardDescription>{t('common.tagline')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} noValidate>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">{t('auth.name')}</FieldLabel>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">{t('auth.email')}</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder={t('common.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">{t('auth.password')}</FieldLabel>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword
                            ? t('common.hidePassword')
                            : t('common.showPassword')
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </Field>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <Field>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="size-4 animate-spin" />}
                      {t('auth.registerButton')}
                    </Button>
                  </Field>

                  <p className="text-center text-sm text-muted-foreground">
                    {t('auth.alreadyHaveAccount')}{' '}
                    <Link
                      to={ROUTES.LOGIN}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {t('auth.signIn')}
                    </Link>
                  </p>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <p className="text-balance text-center text-xs text-muted-foreground">
            Release Hub &middot; {t('common.tagline')}
          </p>
        </div>
      </motion.div>
    </main>
  )
}
