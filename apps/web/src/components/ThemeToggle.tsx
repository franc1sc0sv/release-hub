import { useTranslation } from 'react-i18next'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme, Theme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { t } = useTranslation('common')
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="fixed right-4 top-4 z-50">
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
  )
}
