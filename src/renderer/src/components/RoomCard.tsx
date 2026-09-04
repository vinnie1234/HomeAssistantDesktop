import { useState } from 'react'
import { mdiChevronDown, mdiLightbulbMultipleOutline, mdiDragVertical } from '@mdi/js'
import { useSortable, SortableContext, verticalListSortingStrategy, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import { HaArea, HassEntities, HassEntity, turnOnLights, turnOffLights } from '../lib/homeassistant'
import { useAppStore } from '../lib/store'
import { getEntityIcon } from '../lib/haIcons'
import EntityControl from './EntityControl'
import HaIcon from './HaIcon'

interface Props {
  area: HaArea
  entities: HassEntities
  entityIds: string[]
}

const CONTROLLABLE_DOMAINS = ['light', 'switch', 'fan', 'cover', 'lock', 'climate', 'media_player', 'input_boolean']

const SENSOR_CLASSES = new Set([
  'temperature', 'humidity', 'power', 'energy', 'illuminance',
  'pressure', 'co2', 'volatile_organic_compounds', 'pm25', 'pm10', 'moisture', 'battery'
])
const BINARY_CLASSES = new Set([
  'door', 'window', 'motion', 'presence', 'smoke', 'gas', 'moisture', 'vibration'
])

function isSensorChip(entityId: string, entity: HassEntity): boolean {
  const domain = entityId.split('.')[0]
  const dc: string = entity.attributes?.device_class ?? ''
  if (domain === 'sensor') return SENSOR_CLASSES.has(dc)
  if (domain === 'binary_sensor') return BINARY_CLASSES.has(dc)
  return false
}

function SortableSensorChip({ entityId, entity, onHide }: { entityId: string; entity: HassEntity; onHide: () => void }): JSX.Element {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entityId })
  const { path, color } = getEntityIcon(entity, entityId)
  const unit: string = entity.attributes?.unit_of_measurement ?? ''
  const val = entity.state === 'unavailable' ? '—' : `${entity.state}${unit}`

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="group relative flex items-center gap-1 px-2 py-1 rounded-lg text-xs flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}30`,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
      }}
      title={entity.attributes?.friendly_name ?? entityId}
    >
      <HaIcon path={path} size={12} color={color} />
      <span style={{ color: 'var(--ha-text-primary)' }}>{val}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onHide() }}
        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full items-center justify-center text-[9px] leading-none hidden group-hover:flex"
        style={{ background: 'var(--ha-surface-3)', color: 'var(--ha-text-secondary)' }}
        title={t('room.hide')}
      >
        ✕
      </button>
    </div>
  )
}

function SortableEntityRow({ entityId, entity, onHide }: { entityId: string; entity: HassEntity; onHide: () => void }): JSX.Element {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: entityId })

  return (
    <div
      ref={setNodeRef}
      className="group flex items-start gap-1"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
      }}
    >
      <button
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className="flex-shrink-0 mt-3.5 cursor-grab active:cursor-grabbing touch-none"
        style={{ color: 'var(--ha-icon-inactive)' }}
        tabIndex={-1}
      >
        <HaIcon path={mdiDragVertical} size={14} color="currentColor" />
      </button>
      <div className="flex-1 min-w-0">
        <EntityControl entityId={entityId} entity={entity} />
      </div>
      <button
        onClick={onHide}
        className="opacity-0 group-hover:opacity-100 transition-opacity mt-3 text-xs px-1 flex-shrink-0"
        style={{ color: 'var(--ha-icon-inactive)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ha-icon-inactive)')}
        title={t('room.hide')}
      >
        ✕
      </button>
    </div>
  )
}

export default function RoomCard({ area, entities, entityIds }: Props): JSX.Element {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(true)
  const { hiddenEntities, toggleHidden, roomEntityOrder, setRoomEntityOrder, roomSensorOrder, setRoomSensorOrder } = useAppStore()

  const entitySensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const sensorChipSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Sortable room card itself
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: area.area_id })

  const controllable = entityIds.filter((id) => {
    const domain = id.split('.')[0]
    return CONTROLLABLE_DOMAINS.includes(domain) && entities[id]
  })

  const sensorIds = entityIds.filter((id) => entities[id] && isSensorChip(id, entities[id]))
  const visible = controllable.filter((id) => !hiddenEntities.includes(id))
  const visibleSensors = sensorIds.filter((id) => !hiddenEntities.includes(id))

  // Apply stored sensor order for this room
  const savedSensorOrder = roomSensorOrder[area.area_id] ?? []
  const sortedSensors = [...visibleSensors].sort((a, b) => {
    const ai = savedSensorOrder.indexOf(a)
    const bi = savedSensorOrder.indexOf(b)
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
  })

  function handleSensorDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortedSensors.indexOf(String(active.id))
    const newIndex = sortedSensors.indexOf(String(over.id))
    setRoomSensorOrder(area.area_id, arrayMove(sortedSensors, oldIndex, newIndex))
  }

  if (controllable.length === 0 && sensorIds.length === 0) return <></>

  // Apply stored entity order for this room
  const savedOrder = roomEntityOrder[area.area_id] ?? []
  const sortedVisible = [...visible].sort((a, b) => {
    const ai = savedOrder.indexOf(a)
    const bi = savedOrder.indexOf(b)
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
  })

  const lights = visible.filter((id) => id.startsWith('light.'))
  const lightsOn = lights.filter((id) => entities[id]?.state === 'on').length
  const hasActiveLights = lightsOn > 0

  async function handleRoomToggle(e: React.MouseEvent): Promise<void> {
    e.stopPropagation()
    if (lights.length === 0) return
    if (hasActiveLights) await turnOffLights(lights)
    else await turnOnLights(lights)
  }

  function handleEntityDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortedVisible.indexOf(String(active.id))
    const newIndex = sortedVisible.indexOf(String(over.id))
    setRoomEntityOrder(area.area_id, arrayMove(sortedVisible, oldIndex, newIndex))
  }

  return (
    <div
      ref={setNodeRef}
      className="mx-3 mb-2 rounded-xl overflow-hidden"
      style={{
        background: 'var(--ha-surface-2)',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-2 py-3 transition-colors cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ha-surface-3)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      >
        {/* Drag handle for room */}
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 mr-1 cursor-grab active:cursor-grabbing touch-none p-1"
          style={{ color: 'var(--ha-icon-inactive)' }}
          tabIndex={-1}
        >
          <HaIcon path={mdiDragVertical} size={16} color="currentColor" />
        </button>

        {/* Icon + text */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{
              width: 32,
              height: 32,
              background: hasActiveLights ? 'rgba(200,169,0,0.15)' : 'var(--ha-surface-3)'
            }}
          >
            <HaIcon
              path={mdiLightbulbMultipleOutline}
              size={18}
              color={hasActiveLights ? '#c8a900' : 'var(--ha-icon-inactive)'}
            />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p
              className="text-sm font-medium leading-tight truncate"
              style={{ color: 'var(--ha-text-primary)' }}
              title={area.name}
            >
              {area.name}
            </p>
            {lights.length > 0 && (
              <p
                className="text-xs leading-tight truncate"
                style={{ color: hasActiveLights ? '#c8a900' : 'var(--ha-icon-inactive)' }}
              >
                {lightsOn > 0 ? t('room.lights_on', { count: lightsOn }) : t('room.all_off')}
              </p>
            )}
          </div>
        </div>

        {/* Room light toggle + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {lights.length > 0 && (
            <button
              onClick={handleRoomToggle}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
              style={{ background: hasActiveLights ? '#c8a900' : 'var(--ha-surface-3)' }}
              title={hasActiveLights ? t('room.toggle_off_title') : t('room.toggle_on_title')}
            >
              <span
                className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                style={{ transform: hasActiveLights ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            </button>
          )}
          <HaIcon
            path={mdiChevronDown}
            size={18}
            color="var(--ha-icon-inactive)"
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Sortable sensor chips */}
      {sortedSensors.length > 0 && (
        <DndContext sensors={sensorChipSensors} collisionDetection={closestCenter} onDragEnd={handleSensorDragEnd}>
          <SortableContext items={sortedSensors} strategy={rectSortingStrategy}>
            <div
              className="flex flex-wrap gap-1.5 px-3 pb-2"
              style={expanded && sortedVisible.length > 0 ? { borderBottom: '1px solid var(--ha-divider)' } : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              {sortedSensors.map((id) => (
                <SortableSensorChip
                  key={id}
                  entityId={id}
                  entity={entities[id]}
                  onHide={() => toggleHidden(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Sortable entity controls */}
      {expanded && sortedVisible.length > 0 && (
        <DndContext sensors={entitySensors} collisionDetection={closestCenter} onDragEnd={handleEntityDragEnd}>
          <SortableContext items={sortedVisible} strategy={verticalListSortingStrategy}>
            <div
              className="px-3 pb-2"
              style={visibleSensors.length === 0 ? { borderTop: '1px solid var(--ha-divider)' } : undefined}
            >
              {sortedVisible.map((entityId, i) => (
                <div
                  key={entityId}
                  style={i > 0 ? { borderTop: '1px solid var(--ha-divider)' } : undefined}
                >
                  <SortableEntityRow
                    entityId={entityId}
                    entity={entities[entityId]}
                    onHide={() => toggleHidden(entityId)}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
