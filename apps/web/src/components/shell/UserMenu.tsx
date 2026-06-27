import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, ChevronsUpDown, Sun, Moon, Languages, Check } from 'lucide-react'
import { useApolloClient } from '@apollo/client/react'
import { useAuth } from '@/context/auth.context'
import { useTheme, Theme } from '@/hooks/use-theme'
import { ROUTES } from '@/lib/routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

enum Language {
  Es = 'es',
  En = 'en',
}

const LANGUAGES = [
  { value: Language.Es, label: 'Español' },
  { value: Language.En, label: 'English' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function UserMenu() {
  const { t, i18n } = useTranslation('common')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const client = useApolloClient()

  function handleLogout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    client.clearStore()
    navigate(ROUTES.LOGIN)
  }

  function handleChangeLanguage(lang: Language) {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="size-8 rounded-lg object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {t(`roles.${user.role}`)}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-2.5 text-left text-sm">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                    {getInitials(user.name)}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={toggleTheme} className="gap-3 px-2 py-2">
                {theme === Theme.Dark ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
                {theme === Theme.Dark
                  ? t('common.lightMode')
                  : t('common.darkMode')}
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 px-2 py-2">
                  <Languages className="size-4" />
                  {t('common.language')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.value}
                      onClick={() => handleChangeLanguage(lang.value)}
                      className="gap-3 px-2 py-2"
                    >
                      <Check
                        className={`size-4 ${i18n.language === lang.value ? 'opacity-100' : 'opacity-0'}`}
                      />
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout} className="gap-3 px-2 py-2">
                <LogOut className="size-4" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
