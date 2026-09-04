import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { mdiDragVertical } from '@mdi/js'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../lib/store'
import { HassEntity } from '../lib/homeassistant'
import EntityControl from './EntityControl'
import HaIcon from './HaIcon'

function SortableFavorite({ id, entity }: { id: string; entity: HassEntity }): JSX.Element {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      className="flex items-start gap-1 min-w-0"
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
        className="flex-shrink-0 mt-3.5 cursor-grab active:cursor-grabbing touch-none p-0.5"
        style={{ color: 'var(--ha-icon-inactive)' }}
        tabIndex={-1}
      >
        <HaIcon path={mdiDragVertical} size={14} color="currentColor" />
      </button>
      <div className="flex-1 min-w-0">
        <EntityControl entityId={id} entity={entity} />
      </div>
    </div>
  )
}

export default function FavoritesView(): JSX.Element {
  const { t } = useTranslation()
  const { entities, favoriteEntities, setActiveView, reorderFavorites } = useAppStore()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const visible = favoriteEntities.filter((id) => entities[id])

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = visible.indexOf(String(active.id))
    const newIndex = visible.indexOf(String(over.id))
    if (oldIndex !== -1 && newIndex !== -1) reorderFavorites(oldIndex, newIndex)
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 px-6 text-center">
        <span className="text-3xl">⭐</span>
        <p className="text-sm" style={{ color: 'var(--ha-text-disabled)' }}>{t('favorites.empty')}</p>
        <button
          onClick={() => setActiveView('manage')}
          className="text-xs px-4 py-2 rounded-lg transition-colors"
          style={{ background: 'var(--ha-surface-2)', color: 'var(--ha-text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ha-surface-3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ha-surface-2)')}
        >
          {t('favorites.manage')}
        </button>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visible} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto py-1 px-3">
          {visible.map((id, i) => (
            <div key={id} style={i > 0 ? { borderTop: '1px solid var(--ha-divider)' } : undefined}>
              <SortableFavorite id={id} entity={entities[id]} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
