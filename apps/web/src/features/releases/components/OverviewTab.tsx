import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CoverageMeter } from './CoverageMeter'
import { ReleaseStatusValue } from '../constants/release-enums'
import { ReleaseFlagsTab } from './ReleaseFlagsTab'
import { ReleaseFeaturesTab } from './ReleaseFeaturesTab'
import { ReleasePrsTab } from './ReleasePrsTab'
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

  const isDraft = release.status === ReleaseStatusValue.DRAFT

  return (
    <div className="space-y-6">
      <NewPrsReviewPanel release={release} features={features} projectId={projectId} />

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
