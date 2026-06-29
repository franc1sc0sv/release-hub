import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { LIST_PROJECTS } from '@/features/workspace/graphql/workspace.queries'
import { useGithubConnection } from '@/features/settings/hooks/use-github-connection'
import {
  GITHUB_REPOSITORIES,
  CREATE_PROJECT,
} from '@/features/onboarding/graphql/onboarding.operations'
import type {
  GithubRepositoriesQuery,
  CreateProjectMutation,
  CreateProjectMutationVariables,
} from '@/generated/graphql'

type GithubRepo = GithubRepositoriesQuery['githubRepositories'][number]
type CreatedProject = CreateProjectMutation['createProject']

interface RepoPickerProps {
  onCreated: (project: CreatedProject) => void
}

export function RepoPicker({ onCreated }: RepoPickerProps) {
  const { t } = useTranslation('onboarding')

  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data, loading: reposLoading, error: reposError } = useQuery(GITHUB_REPOSITORIES, {
    fetchPolicy: 'cache-and-network',
  })

  const { reconnect, reconnecting } = useGithubConnection()

  const [createProject, { loading: creating }] = useMutation<
    CreateProjectMutation,
    CreateProjectMutationVariables
  >(CREATE_PROJECT, {
    refetchQueries: [{ query: LIST_PROJECTS }],
    onCompleted(result) {
      onCreated(result.createProject)
    },
    onError() {
      setError(t('selectRepo.createError'))
    },
  })

  function handleSelectRepo(repo: GithubRepo): void {
    setSelectedRepo(repo)
    setProjectName(repo.name)
    setError(null)
  }

  function handleCreate(): void {
    if (!selectedRepo) return
    setError(null)
    createProject({
      variables: {
        input: { repo: selectedRepo.fullName, name: projectName.trim() || selectedRepo.name },
      },
    })
  }

  const repos = data?.githubRepositories ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg"
    >
      <GlassCard glow="indigo">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-display">
            {t('selectRepo.title')}
          </CardTitle>
          <CardDescription className="text-balance">
            {t('selectRepo.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reposError ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertDescription>{t('selectRepo.connectionError')}</AlertDescription>
              </Alert>
              <GradientButton
                className="w-full"
                onClick={() => void reconnect()}
                disabled={reconnecting}
                aria-label={t('selectRepo.reconnectButton')}
              >
                {reconnecting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {reconnecting ? t('selectRepo.reconnecting') : t('selectRepo.reconnectButton')}
              </GradientButton>
            </div>
          ) : (
            <FieldGroup>
            <Field>
              <div className="rounded-xl border border-border/60 bg-background/50">
                {reposLoading && repos.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {t('selectRepo.loadingRepos')}
                  </div>
                ) : (
                  <Command>
                    <CommandInput placeholder={t('selectRepo.searchPlaceholder')} />
                    <CommandList>
                      <CommandEmpty>{t('selectRepo.noResults')}</CommandEmpty>
                      <CommandGroup>
                        {repos.map((repo) => (
                          <CommandItem
                            key={repo.fullName}
                            value={repo.fullName}
                            onSelect={() => handleSelectRepo(repo)}
                            data-checked={selectedRepo?.fullName === repo.fullName}
                            aria-selected={selectedRepo?.fullName === repo.fullName}
                          >
                            <span className="flex-1 truncate font-mono text-sm">
                              {repo.fullName}
                            </span>
                            {repo.private && (
                              <Badge variant="secondary" className="ml-2 shrink-0 gap-1 text-xs">
                                <Lock className="size-3" aria-hidden="true" />
                                {t('selectRepo.privateBadge')}
                              </Badge>
                            )}
                            {repo.description && (
                              <span className="sr-only">{repo.description}</span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                )}
              </div>
            </Field>

            {selectedRepo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Field>
                  <FieldLabel htmlFor="project-name">
                    {t('selectRepo.projectNameLabel')}
                  </FieldLabel>
                  <Input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder={t('selectRepo.projectNamePlaceholder')}
                  />
                </Field>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="size-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <GradientButton
              className="w-full"
              onClick={handleCreate}
              disabled={!selectedRepo || creating || !projectName.trim()}
              aria-label={t('selectRepo.createButton')}
            >
              {creating && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {creating ? t('selectRepo.creating') : t('selectRepo.createButton')}
            </GradientButton>
            </FieldGroup>
          )}
        </CardContent>
      </GlassCard>
    </motion.div>
  )
}
