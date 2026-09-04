import { useState, useMemo } from 'react'
import { mdiMagnify, mdiArrowLeft, mdiEye, mdiEyeOff, mdiStar, mdiStarOutline, mdiChartLine, mdiChartLineVariant } from '@mdi/js'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../lib/store'
import { getEntityIcon } from '../lib/haIcons'
import HaIcon from './HaIcon'

const SUPPORTED_DOMAINS = ['light', 'switch', 'sensor', 'binary_sensor', 'climate', 'media_player', 'cover', 'lock', 'fan', 'scene', 'script', 'input_boolean']

export default function ManageEntities(): JSX.Element {
  const { t } = useTranslation()
  const { entities, entityEntries, hiddenEntities, favoriteEntities, chartEntities, toggleHidden, toggleFavorite, toggleChart, setActiveView } = useAppStore()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'visibility' | 'favorites' | 'charts'>('visibility')
  const [showHiddenOnly, setShowHiddenOnly] = useState(false)

  const allEntities = useMemo(() => {
    return entityEntries
      .filter((e) => {
        const domain = e.entity_id.split('.')[0]
        return SUPPORTED_DOMAINS.includes(domain) && entities[e.entity_id]
      })
      .map((e) => ({
        id: e.entity_id,
        name: entities[e.entity_id]?.attributes?.friendly_name ?? e.entity_id,
        entity: entities[e.entity_id]
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [entities, entityEntries])

  const filtered = useMemo(() => {
    let list = allEntities
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.id.includes(q))
    }
    if (tab === 'visibility' && showHiddenOnly) {
      list = list.filter((e) => hiddenEntities.includes(e.id))
    }
    return list
  }, [allEntities, search, tab, showHiddenOnly, hiddenEntities])

  const tabs = [
    { key: 'visibility' as const, label: t('manage.tab_visible'), iconOn: mdiEye, iconOff: mdiEyeOff },
    { key: 'favorites' as const, label: t('manage.tab_favorites'), iconOn: mdiStar, iconOff: mdiStarOutline },
    { key: 'charts' as const, label: t('manage.tab_charts'), iconOn: mdiChartLine, iconOff: mdiChartLineVariant }
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--ha-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--ha-border)', background: 'var(--ha-surface)' }}
      >
        <button
          onClick={() => setActiveView('rooms')}
          className="transition-colors"
          style={{ color: 'var(--ha-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ha-text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ha-text-secondary)')}
        >
          <HaIcon path={mdiArrowLeft} size={18} color="currentColor" />
        </button>
        <span className="text-sm font-semibold flex-1" style={{ color: 'var(--ha-text-primary)' }}>
          {t('manage.title')}
        </span>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <HaIcon path={mdiMagnify} size={16} color="var(--ha-icon-inactive)" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('manage.search')}
            className="w-full rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none transition-colors"
            style={{
              background: 'var(--ha-surface-2)',
              border: '1px solid var(--ha-border)',
              color: 'var(--ha-text-primary)'
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pb-2 flex-shrink-0">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setShowHiddenOnly(false) }}
            className="flex-1 text-xs py-1.5 rounded-lg transition-colors"
            style={{
              background: tab === key ? 'var(--ha-accent-bg)' : 'var(--ha-surface-2)',
              color: tab === key ? 'var(--ha-accent)' : 'var(--ha-text-secondary)',
              border: `1px solid ${tab === key ? 'var(--ha-accent-border)' : 'transparent'}`
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Hidden-only filter (visibility tab only) */}
      {tab === 'visibility' && hiddenEntities.length > 0 && (
        <div className="px-4 pb-2 flex-shrink-0">
          <button
            onClick={() => setShowHiddenOnly((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              background: showHiddenOnly ? 'var(--ha-accent-bg)' : 'var(--ha-surface-2)',
              color: showHiddenOnly ? 'var(--ha-accent)' : 'var(--ha-text-secondary)',
              border: `1px solid ${showHiddenOnly ? 'var(--ha-accent-border)' : 'transparent'}`
            }}
          >
            <HaIcon path={mdiEyeOff} size={13} color="currentColor" />
            {t('manage.show_hidden', { count: hiddenEntities.length })}
          </button>
        </div>
      )}

      {/* Entity list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm" style={{ color: 'var(--ha-text-disabled)' }}>
            {t('manage.not_found')}
          </div>
        )}
        {filtered.map(({ id, name, entity }) => {
          const { path, color } = getEntityIcon(entity, id)
          const isHidden = hiddenEntities.includes(id)
          const isFav = favoriteEntities.includes(id)
          const isChart = chartEntities.includes(id)

          const isActive = tab === 'visibility' ? !isHidden : tab === 'favorites' ? isFav : isChart
          const toggle = tab === 'visibility' ? toggleHidden : tab === 'favorites' ? toggleFavorite : toggleChart
          const iconActive = tabs.find((t) => t.key === tab)!.iconOn
          const iconInactive = tabs.find((t) => t.key === tab)!.iconOff

          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ha-surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 34,
                  height: 34,
                  background: entity.state === 'on' ? `${color}22` : 'var(--ha-surface-3)'
                }}
              >
                <HaIcon path={path} size={18} color={entity.state === 'on' ? color : 'var(--ha-icon-inactive)'} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--ha-text-primary)' }}>{name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--ha-text-disabled)' }}>{id}</p>
              </div>
              <HaIcon
                path={isActive ? iconActive : iconInactive}
                size={18}
                color={isActive ? 'var(--ha-accent)' : 'var(--ha-surface-3)'}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
