import { mdiPencilOutline, mdiCog, mdiHome, mdiStar, mdiChartLine } from '@mdi/js'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'
import { useAppStore, type LanguageCode } from '../lib/store'
import { SUPPORTED_LANGUAGES } from '../i18n'
import RoomCard from './RoomCard'
import FavoritesView from './FavoritesView'
import ChartsView from './ChartsView'
import ManageEntities from './ManageEntities'
import HaIcon from './HaIcon'

export default function TrayPanel(): JSX.Element {
  const { t } = useTranslation()
  const { entities, areas, devices, entityEntries, status, clearConfig, setActiveView, activeView, areaOrder, setAreaOrder } = useAppStore()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const areaEntityMap: Record<string, string[]> = {}
  for (const entry of entityEntries) {
    const areaId = entry.area_id
    if (areaId) {
      ;(areaEntityMap[areaId] ??= []).push(entry.entity_id)
    } else if (entry.device_id) {
      const device = devices.find((d) => d.id === entry.device_id)
      if (device?.area_id) {
        ;(areaEntityMap[device.area_id] ??= []).push(entry.entity_id)
      }
    }
  }

  const orderedAreas = [...areas].sort((a, b) => {
    const ai = areaOrder.indexOf(a.area_id)
    const bi = areaOrder.indexOf(b.area_id)
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
  })

  function handleRoomDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = orderedAreas.findIndex((a) => a.area_id === active.id)
    const newIndex = orderedAreas.findIndex((a) => a.area_id === over.id)
    setAreaOrder(arrayMove(orderedAreas, oldIndex, newIndex).map((a) => a.area_id))
  }

  const statusColor = { connected: '#4ade80', connecting: '#facc15', error: '#f87171', disconnected: '#6b7280' }[status]

  if (activeView === 'manage') return <ManageEntities />

  const navTabs = [
    { key: 'rooms'     as const, icon: mdiHome,      label: t('nav.rooms') },
    { key: 'favorites' as const, icon: mdiStar,      label: t('nav.favorites') },
    { key: 'charts'    as const, icon: mdiChartLine, label: t('nav.charts') }
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--ha-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--ha-border)', background: 'var(--ha-surface)' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor }} />
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--ha-text-primary)' }}>
            Home Assistant
          </span>
          {status === 'connecting' && <span className="text-xs flex-shrink-0" style={{ color: '#facc15' }}>{t('header.connecting')}</span>}
          {status === 'error'      && <span className="text-xs flex-shrink-0" style={{ color: '#f87171' }}>{t('header.error')}</span>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveView('manage')}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--ha-text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ha-surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            title={t('header.manage_title')}
          >
            <HaIcon path={mdiPencilOutline} size={16} color="currentColor" />
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--ha-text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ha-surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            title={t('header.settings_title')}
          >
            <HaIcon path={mdiCog} size={16} color="currentColor" />
          </button>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="flex flex-shrink-0 px-3 pt-2 gap-1">
        {navTabs.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{
              background: activeView === key ? 'var(--ha-accent-bg)' : 'var(--ha-surface-2)',
              color: activeView === key ? 'var(--ha-accent)' : 'var(--ha-text-secondary)',
              border: `1px solid ${activeView === key ? 'var(--ha-accent-border)' : 'transparent'}`
            }}
          >
            <HaIcon path={icon} size={14} color="currentColor" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col mt-2">
        {activeView === 'rooms' && (
          orderedAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2" style={{ color: 'var(--ha-text-disabled)' }}>
              <HaIcon path={mdiHome} size={32} color="currentColor" />
              <p className="text-sm">{t('rooms.empty_title')}</p>
              <p className="text-xs text-center px-8">{t('rooms.empty_hint')}</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRoomDragEnd}>
              <SortableContext items={orderedAreas.map((a) => a.area_id)} strategy={verticalListSortingStrategy}>
                <div className="pb-2">
                  {orderedAreas.map((area) => (
                    <RoomCard key={area.area_id} area={area} entities={entities} entityIds={areaEntityMap[area.area_id] ?? []} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )
        )}

        {activeView === 'favorites' && <FavoritesView />}
        {activeView === 'charts'    && <ChartsView />}

        {activeView === 'settings' && <SettingsView onClear={clearConfig} onManage={() => setActiveView('manage')} />}
      </div>
    </div>
  )
}

function SettingsView({ onClear, onManage }: { onClear: () => void; onManage: () => void }): JSX.Element {
  const { t } = useTranslation()
  const { status, theme, setTheme, language, setLanguage } = useAppStore()
  const statusColor = { connected: '#4ade80', connecting: '#facc15', error: '#f87171', disconnected: '#6b7280' }[status]

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="rounded-xl p-3" style={{ background: 'var(--ha-surface-2)' }}>
        <p className="text-xs mb-1" style={{ color: 'var(--ha-text-secondary)' }}>{t('settings.status_label')}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
          <p className="text-sm" style={{ color: 'var(--ha-text-primary)' }}>{t(`status.${status}`)}</p>
        </div>
      </div>

      {/* Theme picker */}
      <div className="rounded-xl p-3" style={{ background: 'var(--ha-surface-2)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--ha-text-secondary)' }}>{t('settings.theme_label')}</p>
        <div className="flex gap-1">
          {(['light', 'dark', 'system'] as const).map((th) => (
            <button
              key={th}
              onClick={() => setTheme(th)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: theme === th ? 'var(--ha-accent-bg)' : 'var(--ha-surface-3)',
                color: theme === th ? 'var(--ha-accent)' : 'var(--ha-text-secondary)',
                border: `1px solid ${theme === th ? 'var(--ha-accent-border)' : 'transparent'}`
              }}
            >
              {th === 'light' ? `☀️ ${t('settings.theme_light')}` : th === 'dark' ? `🌙 ${t('settings.theme_dark')}` : `💻 ${t('settings.theme_system')}`}
            </button>
          ))}
        </div>
      </div>

      {/* Language picker */}
      <div className="rounded-xl p-3" style={{ background: 'var(--ha-surface-2)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--ha-text-secondary)' }}>{t('settings.language_label')}</p>
        <div className="grid grid-cols-3 gap-1">
          {(Object.entries(SUPPORTED_LANGUAGES) as [LanguageCode, string][]).map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className="py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: language === code ? 'var(--ha-accent-bg)' : 'var(--ha-surface-3)',
                color: language === code ? 'var(--ha-accent)' : 'var(--ha-text-secondary)',
                border: `1px solid ${language === code ? 'var(--ha-accent-border)' : 'transparent'}`
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onManage}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-colors"
        style={{ background: 'var(--ha-surface-2)', color: 'var(--ha-text-primary)' }}
      >
        <HaIcon path={mdiPencilOutline} size={16} color="currentColor" />
        {t('settings.manage')}
      </button>
      <button
        onClick={onClear}
        className="py-2.5 rounded-xl text-sm transition-colors"
        style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        {t('settings.disconnect')}
      </button>
    </div>
  )
}
