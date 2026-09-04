import { useEffect, useState, useCallback } from 'react'
import { mdiRefresh } from '@mdi/js'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../lib/store'
import { fetchHistory, HistoryState } from '../lib/homeassistant'
import { getEntityIcon } from '../lib/haIcons'
import HaIcon from './HaIcon'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps
} from 'recharts'

type Period = '1h' | '6h' | '24h' | '7d'

const PERIOD_HOURS: Record<Period, number> = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 }

interface ChartPoint {
  time: number
  value: number | null
}

function formatTime(ts: number, period: Period, locale: string): string {
  const d = new Date(ts)
  if (period === '7d') return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

function toChartData(history: HistoryState[]): ChartPoint[] {
  return history
    .map((h) => ({ time: h.lu * 1000, value: parseFloat(h.s) }))
    .filter((p) => !isNaN(p.value))
}

function getUnit(entityId: string, entities: ReturnType<typeof useAppStore.getState>['entities']): string {
  return entities[entityId]?.attributes?.unit_of_measurement ?? ''
}

function CustomTooltip({ active, payload, label, unit, period, name, locale }: TooltipProps<number, string> & { unit: string; period: Period; name: string; locale: string }): JSX.Element | null {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{
        background: 'var(--ha-surface)',
        border: '1px solid var(--ha-border)',
        color: 'var(--ha-text-primary)'
      }}
    >
      <p style={{ color: 'var(--ha-text-secondary)' }}>{formatTime(Number(label), period, locale)}</p>
      <p className="font-semibold mt-0.5">
        {payload[0].value} {unit}
      </p>
      <p style={{ color: 'var(--ha-text-disabled)' }}>{name}</p>
    </div>
  )
}

export default function ChartsView(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { chartEntities, entities, setActiveView } = useAppStore()
  const [period, setPeriod] = useState<Period>('24h')
  const [data, setData] = useState<Record<string, ChartPoint[]>>({})
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (chartEntities.length === 0) return
    setLoading(true)
    try {
      const history = await fetchHistory(chartEntities, PERIOD_HOURS[period])
      const parsed: Record<string, ChartPoint[]> = {}
      for (const [id, states] of Object.entries(history)) {
        parsed[id] = toChartData(states as HistoryState[])
      }
      setData(parsed)
    } catch (e) {
      console.error('History fetch failed', e)
    } finally {
      setLoading(false)
    }
  }, [chartEntities, period])

  useEffect(() => { load() }, [load])

  if (chartEntities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 px-6 text-center">
        <span className="text-3xl">📈</span>
        <p className="text-sm" style={{ color: 'var(--ha-text-disabled)' }}>{t('charts.empty')}</p>
        <button
          onClick={() => setActiveView('manage')}
          className="text-xs px-4 py-2 rounded-lg transition-colors"
          style={{ background: 'var(--ha-surface-2)', color: 'var(--ha-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ha-surface-3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ha-surface-2)')}
        >
          {t('charts.add_entities')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Period selector */}
      <div className="flex gap-1 px-3 py-2 flex-shrink-0">
        {(['1h', '6h', '24h', '7d'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 text-xs py-1.5 rounded-lg transition-colors font-medium"
            style={{
              background: period === p ? 'var(--ha-accent-bg)' : 'var(--ha-surface-2)',
              color: period === p ? 'var(--ha-accent)' : 'var(--ha-text-secondary)',
              border: `1px solid ${period === p ? 'var(--ha-accent-border)' : 'transparent'}`
            }}
          >
            {p}
          </button>
        ))}
        <button
          onClick={load}
          disabled={loading}
          className="ml-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
          style={{ background: 'var(--ha-surface-2)', color: 'var(--ha-text-secondary)' }}
          title={t('charts.refresh')}
        >
          <HaIcon
            path={mdiRefresh}
            size={14}
            color="currentColor"
            className={loading ? 'animate-spin' : ''}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 px-3 pb-3">
        {chartEntities.map((entityId) => {
          const name = entities[entityId]?.attributes?.friendly_name ?? entityId
          const unit = getUnit(entityId, entities)
          const points = data[entityId] ?? []
          const current = entities[entityId]?.state
          const { path: iconPath, color: iconColor } = getEntityIcon(entities[entityId], entityId)

          // Determine line color from entity icon color
          const lineColor = iconColor === 'var(--ha-icon-inactive)' ? 'var(--ha-accent)' : iconColor

          return (
            <div
              key={entityId}
              className="rounded-xl p-3"
              style={{ background: 'var(--ha-surface-2)' }}
            >
              {/* Card header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 28, height: 28, background: `${iconColor}22` }}
                >
                  <HaIcon path={iconPath} size={16} color={iconColor} />
                </div>
                <p
                  className="text-xs font-medium flex-1 truncate"
                  style={{ color: 'var(--ha-text-primary)' }}
                  title={name}
                >
                  {name}
                </p>
                {current && (
                  <p
                    className="text-sm font-semibold flex-shrink-0"
                    style={{ color: lineColor }}
                  >
                    {current} {unit}
                  </p>
                )}
              </div>

              {points.length > 1 ? (
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={points} margin={{ top: 2, right: 4, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="var(--ha-divider)" />
                    <XAxis
                      dataKey="time"
                      type="number"
                      scale="time"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={(v) => formatTime(v, period, i18n.language)}
                      tick={{ fill: 'var(--ha-icon-inactive)', fontSize: 9 }}
                      tickCount={4}
                    />
                    <YAxis
                      tick={{ fill: 'var(--ha-icon-inactive)', fontSize: 9 }}
                      tickFormatter={(v) => `${v}${unit}`}
                      width={48}
                    />
                    <Tooltip
                      content={<CustomTooltip unit={unit} period={period} name={name} locale={i18n.language} />}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={lineColor}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className="h-[90px] flex items-center justify-center text-xs rounded-lg"
                  style={{ background: 'var(--ha-surface-3)', color: 'var(--ha-text-disabled)' }}
                >
                  {loading ? t('charts.loading') : t('charts.no_data')}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
