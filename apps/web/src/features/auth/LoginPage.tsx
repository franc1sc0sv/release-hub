import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useApolloClient } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { useTheme, Theme } from '@/hooks/use-theme'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useAuth } from '@/context/auth.context'
import {
  LoginDocument,
  MeDocument,
  RequestLoginCodeDocument,
  LoginWithCodeDocument,
  type LoginMutation,
  type LoginMutationVariables,
  type MeQuery,
  type RequestLoginCodeMutation,
  type RequestLoginCodeMutationVariables,
  type LoginWithCodeMutation,
  type LoginWithCodeMutationVariables,
} from '@/generated/graphql'

const OTP_LENGTH = 6
const RESEND_COOLDOWN_MS = 60_000

type OtpStep = 'email' | 'code'

function cooldownStorageKey(email: string): string {
  return `otp-cooldown:${email}`
}

function readCooldownEnd(email: string): number | null {
  const stored = sessionStorage.getItem(cooldownStorageKey(email))
  if (!stored) return null
  const parsed = parseInt(stored, 10)
  return isNaN(parsed) ? null : parsed
}

function writeCooldownEnd(email: string, endsAt: number): void {
  sessionStorage.setItem(cooldownStorageKey(email), String(endsAt))
}

export function LoginPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const client = useApolloClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const [otpStep, setOtpStep] = useState<OtpStep>('email')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (cooldownEndsAt === null) {
      setSecondsLeft(0)
      return
    }
    const tick = () => {
      const remaining = Math.ceil((cooldownEndsAt - Date.now()) / 1000)
      if (remaining <= 0) {
        setSecondsLeft(0)
        setCooldownEndsAt(null)
      } else {
        setSecondsLeft(remaining)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [cooldownEndsAt])

  function startCooldown(emailAddress: string): void {
    const endsAt = Date.now() + RESEND_COOLDOWN_MS
    setCooldownEndsAt(endsAt)
    writeCooldownEnd(emailAddress, endsAt)
  }

  async function landAuthenticatedUser(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    try {
      const meResult = await client.query<MeQuery>({
        query: MeDocument,
        fetchPolicy: 'network-only',
      })
      if (meResult.data) setUser(meResult.data.me)
      navigate(ROUTES.DASHBOARD)
    } catch {
      setPasswordError(true)
    }
  }

  const [login, { loading: loginLoading }] = useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    {
      async onCompleted(data) {
        await landAuthenticatedUser(data.login)
      },
      onError() {
        setPasswordError(true)
      },
    },
  )

  const [requestLoginCode, { loading: requestLoading }] = useMutation<
    RequestLoginCodeMutation,
    RequestLoginCodeMutationVariables
  >(RequestLoginCodeDocument, {
    onCompleted() {
      startCooldown(otpEmail)
      if (otpStep === 'email') {
        const stored = readCooldownEnd(otpEmail)
        if (stored && Date.now() < stored) {
          setCooldownEndsAt(stored)
        }
        setOtpStep('code')
      }
    },
    onError() {
      setOtpError(true)
    },
  })

  const [loginWithCode, { loading: verifyLoading }] = useMutation<
    LoginWithCodeMutation,
    LoginWithCodeMutationVariables
  >(LoginWithCodeDocument, {
    async onCompleted(data) {
      await landAuthenticatedUser(data.loginWithCode)
    },
    onError() {
      setOtpError(true)
    },
  })

  function handlePasswordSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setPasswordError(false)
    login({ variables: { input: { email, password } } })
  }

  function handleSendCode(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setOtpError(false)
    requestLoginCode({ variables: { input: { email: otpEmail } } })
  }

  function handleVerifyCode(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setOtpError(false)
    loginWithCode({ variables: { input: { email: otpEmail, code: otpCode } } })
  }

  function handleResendCode(): void {
    setOtpError(false)
    requestLoginCode({ variables: { input: { email: otpEmail } } })
  }

  function handleChangeEmail(): void {
    setOtpStep('email')
    setOtpCode('')
    setOtpError(false)
  }

  function handleTabChange(): void {
    setPasswordError(false)
    setOtpError(false)
    setOtpStep('email')
    setOtpCode('')
  }

  const isCooldownActive = cooldownEndsAt !== null && Date.now() < cooldownEndsAt

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === Theme.Dark ? t('common.lightMode') : t('common.darkMode')}
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-5" />
              </div>
              <CardTitle className="text-xl font-display">
                {t('auth.login')}
              </CardTitle>
              <CardDescription>{t('common.schoolName')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password" onValueChange={handleTabChange}>
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="password" className="flex-1">
                    {t('auth.tabs.password')}
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex-1">
                    {t('auth.tabs.code')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="password">
                  <form onSubmit={handlePasswordSubmit} noValidate>
                    <FieldGroup>
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
                        <FieldLabel htmlFor="password">
                          {t('auth.password')}
                        </FieldLabel>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
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

                      {passwordError && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertDescription>
                              {t('auth.loginError')}
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <Field>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loginLoading}
                        >
                          {loginLoading && (
                            <Loader2 className="size-4 animate-spin" />
                          )}
                          {t('auth.loginButton')}
                        </Button>
                      </Field>
                    </FieldGroup>
                  </form>
                </TabsContent>

                <TabsContent value="code">
                  {otpStep === 'email' ? (
                    <form onSubmit={handleSendCode} noValidate>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="otp-email">{t('auth.email')}</FieldLabel>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="otp-email"
                              type="email"
                              autoComplete="email"
                              required
                              placeholder={t('common.emailPlaceholder')}
                              value={otpEmail}
                              onChange={(e) => setOtpEmail(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                        </Field>

                        {otpError && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Alert variant="destructive">
                              <AlertCircle className="size-4" />
                              <AlertDescription>
                                {t('auth.codeInvalid')}
                              </AlertDescription>
                            </Alert>
                          </motion.div>
                        )}

                        <Field>
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={requestLoading}
                          >
                            {requestLoading && (
                              <Loader2 className="size-4 animate-spin" />
                            )}
                            {t('auth.sendCode')}
                          </Button>
                        </Field>
                      </FieldGroup>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode} noValidate>
                      <FieldGroup>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {t('auth.codeSent', { email: otpEmail })}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleChangeEmail}
                            aria-label={t('auth.changeEmail')}
                          >
                            <ArrowLeft className="mr-1 size-3" />
                            {t('auth.changeEmail')}
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {t('auth.codeHint')}
                        </p>

                        <Field>
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={OTP_LENGTH}
                              value={otpCode}
                              onChange={setOtpCode}
                            >
                              <InputOTPGroup>
                                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                                  <InputOTPSlot key={i} index={i} />
                                ))}
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </Field>

                        {otpError && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Alert variant="destructive">
                              <AlertCircle className="size-4" />
                              <AlertDescription>
                                {t('auth.codeInvalid')}
                              </AlertDescription>
                            </Alert>
                          </motion.div>
                        )}

                        <Field>
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={verifyLoading || otpCode.length < OTP_LENGTH}
                          >
                            {verifyLoading && (
                              <Loader2 className="size-4 animate-spin" />
                            )}
                            {t('auth.verifyCode')}
                          </Button>
                        </Field>

                        <Field>
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            disabled={isCooldownActive || requestLoading}
                            onClick={handleResendCode}
                          >
                            {requestLoading && (
                              <Loader2 className="size-4 animate-spin" />
                            )}
                            {isCooldownActive
                              ? t('auth.resendCountdown', { seconds: secondsLeft })
                              : t('auth.resendCode')}
                          </Button>
                        </Field>
                      </FieldGroup>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
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
