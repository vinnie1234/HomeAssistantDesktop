import { useEffect } from 'react'
import { useAppStore } from './store'

export function useTheme(): void {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    function apply(dark: boolean): void {
      document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    }

    if (theme === 'dark') {
      apply(true)
      return
    }
    if (theme === 'light') {
      apply(false)
      return
    }

    // system
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    apply(mq.matches)
    const handler = (e: MediaQueryListEvent): void => apply(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])
}
