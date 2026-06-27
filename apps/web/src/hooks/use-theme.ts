import { useEffect, useState } from 'react'

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

const STORAGE_KEY = 'theme'

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === Theme.Light || stored === Theme.Dark) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.Dark : Theme.Light
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    document.documentElement.classList.toggle(Theme.Dark, theme === Theme.Dark)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setThemeState((prev) => (prev === Theme.Dark ? Theme.Light : Theme.Dark))
  }

  return { theme, toggleTheme } as const
}
