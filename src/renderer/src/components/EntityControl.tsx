import { HassEntity } from '../lib/homeassistant'
import { toggleLight, toggleSwitch, turnOnLight, getLightBrightness, isOn, isAvailable } from '../lib/homeassistant'
import { getEntityIcon, getEntityStateLabel } from '../lib/haIcons'
import HaIcon from './HaIcon'

interface Props {
  entity: HassEntity
  entityId: string
}

const TOGGLEABLE = ['light', 'switch', 'input_boolean', 'fan']

export default function EntityControl({ entity, entityId }: Props): JSX.Element {
  const on = isOn(entity)
  const available = isAvailable(entity)
  const domain = entityId.split('.')[0]
  const name = entity.attributes?.friendly_name ?? entityId
  const isLight = domain === 'light'
  const brightness = isLight && on ? getLightBrightness(entity) : null
  const isToggleable = TOGGLEABLE.includes(domain)
  const { path: iconPath, color: iconColor } = getEntityIcon(entity, entityId)
  const stateLabel = getEntityStateLabel(entity, entityId)

  async function handleToggle(): Promise<void> {
    if (!available || !isToggleable) return
    if (domain === 'light') await toggleLight(entityId)
    else if (domain === 'switch' || domain === 'input_boolean' || domain === 'fan') await toggleSwitch(entityId)
  }

  async function handleBrightness(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const pct = parseInt(e.target.value)
    await turnOnLight(entityId, Math.round((pct / 100) * 255))
  }

  return (
    <div className={`flex flex-col py-2 ${!available ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0 transition-colors"
          style={{
            width: 36,
            height: 36,
            background: on ? `${iconColor}22` : 'var(--ha-surface-3)'
          }}
        >
          <HaIcon path={iconPath} size={20} color={on ? iconColor : 'var(--ha-icon-inactive)'} />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <p
            className="text-sm leading-tight"
            style={{
              color: 'var(--ha-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={name}
          >
            {name}
          </p>
          <p className="text-xs leading-tight" style={{ color: on ? iconColor : 'var(--ha-icon-inactive)' }}>
            {stateLabel}
            {isLight && brightness !== null && ` · ${brightness}%`}
          </p>
        </div>

        {isToggleable && (
          <button
            onClick={handleToggle}
            disabled={!available}
            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none flex-shrink-0"
            style={{ background: on ? iconColor : 'var(--ha-surface-3)' }}
          >
            <span
              className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
              style={{ transform: on ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        )}
      </div>

      {isLight && on && brightness !== null && (
        <div className="flex items-center gap-2 pl-12 pt-1">
          <input
            type="range"
            min={1}
            max={100}
            value={brightness}
            onChange={handleBrightness}
            className="flex-1 h-1 cursor-pointer rounded-full appearance-none"
            style={{ accentColor: iconColor }}
          />
        </div>
      )}
    </div>
  )
}
