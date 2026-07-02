import { useTranslation } from 'react-i18next'
import { ExternalLink, GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CoverageMeter } from './CoverageMeter'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { RELEASE_STATUS_BADGE_CLASS, ReleaseStatusValue } from '../constants/release-enums'
import { ReleaseFlagsTab } from './ReleaseFlagsTab'
import { ReleaseFeaturesTab } from './ReleaseFeaturesTab'
import { ReleasePrsTab } from './ReleasePrsTab'
import { SyncNewPrsButton } from './SyncNewPrsButton'
import { NewPrsReviewPanel } from './NewPrsReviewPanel'
import type { GetReleaseTreeQuery } from '@/generated/graphql'

type ReleaseNode = GetReleaseTreeQuery['getReleaseTree']['release']
type FeatureNodes = GetReleaseTreeQuery['getReleaseTree']['features']

interface OverviewTabProps {
  release: ReleaseNode
  features: FeatureNodes
  projectId: string
}

export function OverviewTab({ release, features, projectId }: OverviewTabProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()

  const isDraft = release.status === ReleaseStatusValue.DRAFT

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {release.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5" aria-label={t('view.tagsLabel')}>
              {release.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-xs font-medium text-foreground/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Badge
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${RELEASE_STATUS_BADGE_CLASS[release.status]}`}
          >
            {enumLabels.releaseStatus(release.status)}
          </Badge>
        </div>

        {(release.status === ReleaseStatusValue.DRAFT ||
          release.status === ReleaseStatusValue.READY_TO_RELEASE) && (
          <SyncNewPrsButton releaseId={release.id} />
        )}
      </div>

      <NewPrsReviewPanel release={release} features={features} projectId={projectId} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <GitBranch className="size-3.5 shrink-0" aria-hidden />
          <span className="font-mono text-foreground/70">{release.baseRef}</span>
          <span aria-hidden>→</span>
          <span className="font-mono text-foreground/70">{release.compareRef}</span>
        </span>

        {release.prUrl && (
          <a
            href={release.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('view.prUrlAriaLabel')}
            className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('view.prUrl')}
            <ExternalLink className="size-3" aria-hidden />
          </a>
        )}
      </div>

      <CoverageMeter releaseId={release.id} releaseStatus={release.status} />

      {!isDraft && (
        <Tabs defaultValue="flags">
          <TabsList
            variant="line"
            className="mb-4"
            aria-label={t('view.innerTabs.label')}
          >
            <TabsTrigger value="flags">{t('view.innerTabs.flags')}</TabsTrigger>
            <TabsTrigger value="features">{t('view.innerTabs.features')}</TabsTrigger>
            <TabsTrigger value="prs">{t('view.innerTabs.prs')}</TabsTrigger>
          </TabsList>

          <TabsContent value="flags">
            <ReleaseFlagsTab releaseId={release.id} />
          </TabsContent>

          <TabsContent value="features">
            <ReleaseFeaturesTab features={features} />
          </TabsContent>

          <TabsContent value="prs">
            <ReleasePrsTab features={features} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
