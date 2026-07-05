import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronsUpDown, Check, Building2, Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { generatePath, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/context/organization.context'
import { ROUTES } from '@/lib/routes'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateOrganizationDialog } from './CreateOrganizationDialog'

interface ConnectedIndicatorProps {
  connected: boolean
  decorative?: boolean
}

function ConnectedIndicator({ connected, decorative = false }: ConnectedIndicatorProps) {
  const { t } = useTranslation('organization')
  const label = connected ? t('switcher.connected') : t('switcher.notConnected')
  return (
    <span
      className={cn(
        'size-2 shrink-0 rounded-full',
        connected ? 'bg-emerald-500' : 'bg-amber-500',
      )}
      title={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  )
}

export function OrganizationSwitcher() {
  const { t } = useTranslation('organization')
  const { organizations, activeOrg, loading } = useOrganization()
  const reducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)

  if (loading && organizations.length === 0) {
    return (
      <div className="flex items-center gap-2 p-1">
        <Skeleton className="size-8 rounded-lg" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-2.5 w-16 rounded" />
        </div>
      </div>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              size="lg"
              className={cn(
                'rounded-xl border border-transparent',
                'transition-all duration-200',
                'hover:border-border/60 hover:shadow-glow-sm',
                'data-[state=open]:border-border/60 data-[state=open]:shadow-glow-sm',
              )}
              aria-label={t('switcher.label')}
            />
          }
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-nebula-gradient text-white">
            <Building2 className="size-4" aria-hidden />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-foreground">
              {activeOrg?.name ?? t('switcher.noOrganizations')}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {activeOrg && <ConnectedIndicator connected={activeOrg.githubConnected} decorative />}
              <span className="truncate">
                {activeOrg
                  ? activeOrg.githubConnected
                    ? t('switcher.connected')
                    : t('switcher.notConnected')
                  : t('switcher.eyebrow')}
              </span>
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" aria-hidden />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          sideOffset={4}
          className="w-64 rounded-xl border border-border/60 bg-popover/90 backdrop-blur-md"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">
              {t('switcher.label')}
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          {organizations.map((org, index) => {
            const isActive = org.id === activeOrg?.id
            return (
              <motion.div
                key={org.id}
                initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.18 }}
              >
                <DropdownMenuItem
                  className={cn('cursor-pointer rounded-lg px-2 py-2', isActive && 'bg-accent')}
                  onClick={() =>
                    navigate(generatePath(ROUTES.ORG_ROOT, { organizationId: org.id }))
                  }
                >
                  <ConnectedIndicator connected={org.githubConnected} />
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-sm font-medium',
                      isActive && 'text-primary',
                    )}
                  >
                    {org.name}
                  </span>
                  {isActive && (
                    <Check
                      className="ml-2 size-4 shrink-0 text-primary"
                      aria-label={t('switcher.active')}
                    />
                  )}
                </DropdownMenuItem>
              </motion.div>
            )
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-lg px-2 py-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">{t('switcher.createOrganization')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
