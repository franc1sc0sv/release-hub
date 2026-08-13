import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { FolderOpen, Rocket, LayoutList, Flag, GitBranch, Settings } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useProject } from '@/context/project.context'
import { ROUTES } from '@/lib/routes'
import { GET_RELEASES_PAGE } from '@/features/releases/graphql/releases.queries'
import { LIST_FEATURES_PAGE } from '@/features/features/graphql/features.queries'
import { GET_FLAGS } from '@/features/flags/graphql/flags.queries'

const SEARCH_MIN_LENGTH = 2
const RESULT_LIMIT = 5
const DEBOUNCE_MS = 200

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useTranslation('palette')
  const navigate = useNavigate()
  const { activeProject } = useProject()
  const { organizationId } = useParams<{ organizationId: string }>()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_MS)

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const canSearch = debouncedSearch.trim().length >= SEARCH_MIN_LENGTH
  const orgId = organizationId ?? ''
  const projectId = activeProject?.id ?? ''

  const navigationItems = useMemo(
    () => [
      {
        to: generatePath(ROUTES.ORG_ROOT, { organizationId: orgId }),
        labelKey: 'nav.workspace',
        icon: FolderOpen,
      },
      {
        to: generatePath(ROUTES.PROJECT_RELEASES, { organizationId: orgId, projectId }),
        labelKey: 'nav.releases',
        icon: Rocket,
      },
      {
        to: generatePath(ROUTES.PROJECT_FEATURES, { organizationId: orgId, projectId }),
        labelKey: 'nav.features',
        icon: LayoutList,
      },
      {
        to: generatePath(ROUTES.PROJECT_FLAGS, { organizationId: orgId, projectId }),
        labelKey: 'nav.flags',
        icon: Flag,
      },
      {
        to: generatePath(ROUTES.PROJECT_REPO_OPS, { organizationId: orgId, projectId }),
        labelKey: 'nav.repoOps',
        icon: GitBranch,
      },
      {
        to: generatePath(ROUTES.PROJECT_SETTINGS, { organizationId: orgId, projectId }),
        labelKey: 'nav.settings',
        icon: Settings,
      },
    ],
    [orgId, projectId],
  )

  const { data: releasesData, loading: releasesLoading } = useQuery(GET_RELEASES_PAGE, {
    variables: { projectId, limit: RESULT_LIMIT, offset: 0, search: debouncedSearch },
    skip: !projectId || !canSearch,
  })

  const { data: featuresData, loading: featuresLoading } = useQuery(LIST_FEATURES_PAGE, {
    variables: {
      input: {
        projectId,
        limit: RESULT_LIMIT,
        offset: 0,
        search: debouncedSearch,
        assignableOnly: false,
      },
    },
    skip: !projectId || !canSearch,
  })

  const { data: flagsData, loading: flagsLoading } = useQuery(GET_FLAGS, {
    variables: {
      input: {
        projectId,
        limit: RESULT_LIMIT,
        offset: 0,
        search: debouncedSearch,
        sortDirection: undefined,
        sortEnvironment: undefined,
        sortField: undefined,
        activity: undefined,
        statuses: undefined,
      },
    },
    skip: !projectId || !canSearch,
  })

  const releases = releasesData?.getReleasesPage.items ?? []
  const features = featuresData?.listFeaturesPage.items ?? []
  const flags = flagsData?.getFlags?.items ?? []
  const isSearchLoading = releasesLoading || featuresLoading || flagsLoading

  const goTo = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      description={t('description')}
    >
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder={t('inputPlaceholder')}
      />
      <CommandList>
        <CommandEmpty>
          {canSearch && !isSearchLoading ? t('noResults') : t('typeToSearch')}
        </CommandEmpty>

        <CommandGroup heading={t('groups.navigation')}>
          {navigationItems.map((item) => (
            <CommandItem key={item.to} onSelect={() => goTo(item.to)}>
              <item.icon className="size-4" aria-hidden />
              <span>{t(item.labelKey)}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {canSearch && releases.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t('groups.releases')}>
              {releases.map((release) => (
                <CommandItem
                  key={release.id}
                  onSelect={() =>
                    goTo(
                      generatePath(ROUTES.PROJECT_RELEASE_DETAIL, {
                        organizationId: orgId,
                        projectId,
                        releaseId: release.id,
                      }),
                    )
                  }
                >
                  <Rocket className="size-4" aria-hidden />
                  <span>{release.name ?? `${release.baseRef} → ${release.compareRef}`}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {canSearch && features.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t('groups.features')}>
              {features.map((feature) => (
                <CommandItem
                  key={feature.id}
                  onSelect={() =>
                    goTo(
                      generatePath(ROUTES.PROJECT_FEATURE_DETAIL, {
                        organizationId: orgId,
                        projectId,
                        id: feature.id,
                      }),
                    )
                  }
                >
                  <LayoutList className="size-4" aria-hidden />
                  <span>{feature.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {canSearch && flags.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t('groups.flags')}>
              {flags.map((flag) => (
                <CommandItem
                  key={flag.key}
                  onSelect={() =>
                    goTo(
                      generatePath(ROUTES.PROJECT_FLAG_DETAIL, {
                        organizationId: orgId,
                        projectId,
                        flagKey: flag.key,
                      }),
                    )
                  }
                >
                  <Flag className="size-4" aria-hidden />
                  <span>{flag.key}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
