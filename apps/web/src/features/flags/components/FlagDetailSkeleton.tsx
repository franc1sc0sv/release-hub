import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FlagDetailSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <GlassCard glow="indigo">
        <CardContent className="space-y-5 py-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-72" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </GlassCard>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <GlassCard key={index}>
              <CardContent className="space-y-3 py-5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full rounded-[var(--radius-card)]" />
                <Skeleton className="h-10 w-full rounded-[var(--radius-card)]" />
              </CardContent>
            </GlassCard>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, index) => (
            <GlassCard key={index}>
              <CardContent className="space-y-3 py-5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-[var(--radius-card)]" />
              </CardContent>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
