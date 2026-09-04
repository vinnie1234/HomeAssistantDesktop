import { useEffect } from 'react'
import { useAppStore, initStore } from './lib/store'
import { useTheme } from './lib/useTheme'
import SetupScreen from './components/SetupScreen'
import TrayPanel from './components/TrayPanel'

export default function App(): JSX.Element {
  const { config } = useAppStore()
  useTheme()

  useEffect(() => {
    initStore()
  }, [])

  return config ? <TrayPanel /> : <SetupScreen />
}
