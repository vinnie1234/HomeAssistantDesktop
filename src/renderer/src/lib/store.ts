import { create } from 'zustand'
import i18n, { type LanguageCode } from '../i18n'
import {
  connectToHA,
  disconnect,
  fetchAreas,
  fetchDevices,
  fetchEntityEntries,
  subscribeToEntities,
  getUserData,
  saveUserData,
  HaArea,
  HaDevice,
  HaEntityEntry,
  HassEntities
} from './homeassistant'

export interface HaConfig {
  url: string
  token: string
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type ActiveView = 'rooms' | 'favorites' | 'charts' | 'settings' | 'manage'
export type ThemePreference = 'light' | 'dark' | 'system'
export type { LanguageCode }

interface AppState {
  config: HaConfig | null
  status: ConnectionStatus
  errorMessage: string | null
  entities: HassEntities
  areas: HaArea[]
  devices: HaDevice[]
  entityEntries: HaEntityEntry[]
  activeView: ActiveView
  theme: ThemePreference
  language: LanguageCode

  hiddenEntities: string[]
  favoriteEntities: string[]
  chartEntities: string[]
  areaOrder: string[]
  roomEntityOrder: Record<string, string[]>
  roomSensorOrder: Record<string, string[]>

  setConfig: (config: HaConfig) => void
  clearConfig: () => void
  connect: () => Promise<void>
  setActiveView: (view: ActiveView) => void
  toggleHidden: (entityId: string) => void
  toggleFavorite: (entityId: string) => void
  toggleChart: (entityId: string) => void
  setTheme: (theme: ThemePreference) => void
  setLanguage: (lang: LanguageCode) => void
  setAreaOrder: (order: string[]) => void
  setRoomEntityOrder: (areaId: string, order: string[]) => void
  setRoomSensorOrder: (areaId: string, order: string[]) => void
  reorderFavorites: (fromIndex: number, toIndex: number) => void
}

function buildUserData(state: AppState) {
  return {
    hiddenEntities: state.hiddenEntities,
    favoriteEntities: state.favoriteEntities,
    chartEntities: state.chartEntities,
    areaOrder: state.areaOrder,
    roomEntityOrder: state.roomEntityOrder,
    roomSensorOrder: state.roomSensorOrder
  }
}

function persistToHA(get: () => AppState): void {
  saveUserData(buildUserData(get())).catch(console.error)
}

const USER_SETTINGS_DEFAULT = {
  hiddenEntities: [] as string[],
  favoriteEntities: [] as string[],
  chartEntities: [] as string[],
  areaOrder: [] as string[],
  roomEntityOrder: {} as Record<string, string[]>,
  roomSensorOrder: {} as Record<string, string[]>
}

export const useAppStore = create<AppState>((set, get) => ({
  config: null,
  status: 'disconnected',
  errorMessage: null,
  entities: {},
  areas: [],
  devices: [],
  entityEntries: [],
  activeView: 'rooms',
  theme: 'system',
  language: i18n.language as LanguageCode,
  ...USER_SETTINGS_DEFAULT,

  setConfig: (config) => {
    set({ config })
    window.api.store.set('haConfig', config)
  },

  clearConfig: () => {
    disconnect()
    set({
      config: null,
      status: 'disconnected',
      entities: {},
      areas: [],
      devices: [],
      entityEntries: [],
      ...USER_SETTINGS_DEFAULT
    })
    window.api.store.delete('haConfig')
  },

  connect: async () => {
    const { config } = get()
    if (!config) return

    set({ status: 'connecting', errorMessage: null })
    try {
      const conn = await connectToHA(config)

      conn.addEventListener('disconnected', () => set({ status: 'disconnected' }))
      conn.addEventListener('reconnect-error', () => set({ status: 'error', errorMessage: 'Reconnect failed' }))

      const [areas, devices, entityEntries, userData] = await Promise.all([
        fetchAreas(),
        fetchDevices(),
        fetchEntityEntries(),
        getUserData()
      ])

      set({
        areas,
        devices,
        entityEntries,
        status: 'connected',
        hiddenEntities: userData?.hiddenEntities ?? [],
        favoriteEntities: userData?.favoriteEntities ?? [],
        chartEntities: userData?.chartEntities ?? [],
        areaOrder: userData?.areaOrder ?? [],
        roomEntityOrder: userData?.roomEntityOrder ?? {},
        roomSensorOrder: userData?.roomSensorOrder ?? {}
      })
      subscribeToEntities((entities) => set({ entities }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      set({ status: 'error', errorMessage: msg })
    }
  },

  setActiveView: (view) => set({ activeView: view }),

  toggleHidden: (entityId) => {
    const hidden = get().hiddenEntities
    const next = hidden.includes(entityId)
      ? hidden.filter((id) => id !== entityId)
      : [...hidden, entityId]
    set({ hiddenEntities: next })
    persistToHA(get)
  },

  toggleFavorite: (entityId) => {
    const favs = get().favoriteEntities
    const next = favs.includes(entityId)
      ? favs.filter((id) => id !== entityId)
      : [...favs, entityId]
    set({ favoriteEntities: next })
    persistToHA(get)
  },

  toggleChart: (entityId) => {
    const charts = get().chartEntities
    const next = charts.includes(entityId)
      ? charts.filter((id) => id !== entityId)
      : [...charts, entityId]
    set({ chartEntities: next })
    persistToHA(get)
  },

  setTheme: (theme) => {
    set({ theme })
    window.api.store.set('theme', theme)
  },

  setLanguage: (lang) => {
    set({ language: lang })
    i18n.changeLanguage(lang)
    window.api.store.set('language', lang)
  },

  setAreaOrder: (order) => {
    set({ areaOrder: order })
    persistToHA(get)
  },

  setRoomEntityOrder: (areaId, order) => {
    const next = { ...get().roomEntityOrder, [areaId]: order }
    set({ roomEntityOrder: next })
    persistToHA(get)
  },

  setRoomSensorOrder: (areaId, order) => {
    const next = { ...get().roomSensorOrder, [areaId]: order }
    set({ roomSensorOrder: next })
    persistToHA(get)
  },

  reorderFavorites: (fromIndex, toIndex) => {
    const favs = [...get().favoriteEntities]
    const [moved] = favs.splice(fromIndex, 1)
    favs.splice(toIndex, 0, moved)
    set({ favoriteEntities: favs })
    persistToHA(get)
  }
}))

export async function initStore(): Promise<void> {
  const [rawConfig, rawTheme, rawLang] = await Promise.all([
    window.api.store.get('haConfig'),
    window.api.store.get('theme'),
    window.api.store.get('language')
  ])

  const config = rawConfig as HaConfig | null
  const theme = (rawTheme as ThemePreference | null) ?? 'system'
  const language = (rawLang as LanguageCode | null) ?? (i18n.language as LanguageCode)

  i18n.changeLanguage(language)
  useAppStore.setState({ theme, language })

  if (config) {
    useAppStore.getState().setConfig(config)
    await useAppStore.getState().connect()
  }
}
