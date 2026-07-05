import { useEffect, useState } from 'react'
import { useQuery, useApolloClient } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { Github, ExternalLink } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useOrganization } from '@/context/organization.context'
import { GqlOrgRole } from '@/features/collaboration/constants'
import { GITHUB_INSTALL_URL } from '@/features/settings/graphql/settings.operations'
import { GITHUB_INSTALLATION_REPOSITORIES } from '../graphql/organization.operations'

const REPOS_PER_PAGE = 10

export function GithubIntegrationPanel() {
  const { t } = useTranslation('organization')
  const client = useApolloClient()
  const { activeOrg } = useOrganization()

  const isOwner = activeOrg?.role === GqlOrgRole.OWNER
  const [repoPage, setRepoPage] = useState(0)

  useEffect(() => {
    setRepoPage(0)
  }, [activeOrg?.id])

  const { data: reposData, loading: reposLoading } = useQuery(GITHUB_INSTALLATION_REPOSITORIES, {
    variables: { organizationId: activeOrg?.id ?? '' },
    skip: !activeOrg || !activeOrg.githubConnected,
    fetchPolicy: 'cache-and-network',
  })

  async function redirectToInstall(): Promise<void> {
    const result = await client.query({
      query: GITHUB_INSTALL_URL,
      variables: { projectId: null, organizationId: activeOrg?.id ?? null },
      fetchPolicy: 'network-only',
    })
    const url = result.data?.githubInstallUrl
    if (url) window.location.href = url
  }

  if (!activeOrg) return null

  const repositories = reposData?.githubInstallationRepositories ?? []
  const repoPageCount = Math.max(1, Math.ceil(repositories.length / REPOS_PER_PAGE))
  const currentRepoPage = Math.min(repoPage, repoPageCount - 1)
  const pagedRepositories = repositories.slice(
    currentRepoPage * REPOS_PER_PAGE,
    currentRepoPage * REPOS_PER_PAGE + REPOS_PER_PAGE,
  )

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Github className="size-4 text-muted-foreground" />
          {t('github.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={
                activeOrg.githubConnected
                  ? 'size-2.5 shrink-0 rounded-full bg-emerald-500'
                  : 'size-2.5 shrink-0 rounded-full bg-amber-500'
              }
              aria-hidden
            />
            <span className="text-sm font-medium text-foreground">
              {activeOrg.githubConnected ? t('github.connected') : t('github.notConnected')}
            </span>
          </div>
          {isOwner && (
            <Button variant={activeOrg.githubConnected ? 'outline' : 'default'} onClick={redirectToInstall}>
              <Github className="mr-2 size-4" aria-hidden />
              {activeOrg.githubConnected ? t('github.manage') : t('github.install')}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{t('github.description')}</p>

        {activeOrg.githubConnected && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('github.reposTitle')}
            </p>
            {reposLoading && repositories.length === 0 ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-[var(--radius-button)]" />
                ))}
              </div>
            ) : repositories.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('github.reposEmpty')}</p>
            ) : (
              <>
                <ul className="divide-y divide-border/40">
                  {pagedRepositories.map((repo) => (
                    <li key={repo.fullName} className="flex items-center justify-between gap-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-mono text-sm text-foreground">
                          {repo.fullName}
                        </span>
                        {repo.private && (
                          <Badge variant="outline" className="rounded-full text-xs">
                            {t('github.private')}
                          </Badge>
                        )}
                      </div>
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={repo.fullName}
                      >
                        <ExternalLink className="size-4" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
                {repoPageCount > 1 && (
                  <Pagination className="pt-1">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          text={t('github.reposPrev')}
                          aria-disabled={currentRepoPage === 0}
                          className={currentRepoPage === 0 ? 'pointer-events-none opacity-50' : undefined}
                          onClick={() => setRepoPage((page) => Math.max(0, page - 1))}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-2 text-xs text-muted-foreground">
                          {t('github.reposPageIndicator', {
                            page: currentRepoPage + 1,
                            total: repoPageCount,
                          })}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          text={t('github.reposNext')}
                          aria-disabled={currentRepoPage >= repoPageCount - 1}
                          className={
                            currentRepoPage >= repoPageCount - 1 ? 'pointer-events-none opacity-50' : undefined
                          }
                          onClick={() => setRepoPage((page) => Math.min(repoPageCount - 1, page + 1))}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </GlassCard>
  )
}
