import {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
  callService,
  Connection,
  HassEntities,
  HassEntity
} from 'home-assistant-js-websocket'

export type { HassEntities, HassEntity }

export interface HaConfig {
  url: string
  token: string
}

export interface HaArea {
  area_id: string
  name: string
  icon?: string
}

export interface HaDevice {
  id: string
  name: string
  area_id?: string
}

export interface HaEntityEntry {
  entity_id: string
  device_id?: string
  area_id?: string
  name?: string
  original_name?: string
}

let connection: Connection | null = null
let entityUnsubscribe: (() => void) | null = null

export async function connectToHA(config: HaConfig): Promise<Connection> {
  if (connection) {
    connection.close()
    connection = null
  }

  const auth = createLongLivedTokenAuth(config.url, config.token)
  connection = await createConnection({ auth })
  return connection
}

export function disconnect(): void {
  entityUnsubscribe?.()
  entityUnsubscribe = null
  connection?.close()
  connection = null
}

export function getConnection(): Connection | null {
  return connection
}

export function subscribeToEntities(callback: (entities: HassEntities) => void): () => void {
  if (!connection) throw new Error('Not connected')
  const unsub = subscribeEntities(connection, callback)
  entityUnsubscribe = unsub
  return unsub
}

export async function fetchAreas(): Promise<HaArea[]> {
  if (!connection) throw new Error('Not connected')
  return connection.sendMessagePromise({ type: 'config/area_registry/list' })
}

export async function fetchDevices(): Promise<HaDevice[]> {
  if (!connection) throw new Error('Not connected')
  return connection.sendMessagePromise({ type: 'config/device_registry/list' })
}

export async function fetchEntityEntries(): Promise<HaEntityEntry[]> {
  if (!connection) throw new Error('Not connected')
  return connection.sendMessagePromise({ type: 'config/entity_registry/list' })
}

export async function toggleLight(entityId: string): Promise<void> {
  if (!connection) throw new Error('Not connected')
  await callService(connection, 'light', 'toggle', { entity_id: entityId })
}

export async function turnOnLight(entityId: string, brightness?: number, rgbColor?: [number, number, number]): Promise<void> {
  if (!connection) throw new Error('Not connected')
  const serviceData: Record<string, unknown> = { entity_id: entityId }
  if (brightness !== undefined) serviceData.brightness = brightness
  if (rgbColor) serviceData.rgb_color = rgbColor
  await callService(connection, 'light', 'turn_on', serviceData)
}

export async function turnOffLight(entityId: string): Promise<void> {
  if (!connection) throw new Error('Not connected')
  await callService(connection, 'light', 'turn_off', { entity_id: entityId })
}

export async function turnOnLights(entityIds: string[]): Promise<void> {
  if (!connection) throw new Error('Not connected')
  await callService(connection, 'light', 'turn_on', { entity_id: entityIds })
}

export async function turnOffLights(entityIds: string[]): Promise<void> {
  if (!connection) throw new Error('Not connected')
  await callService(connection, 'light', 'turn_off', { entity_id: entityIds })
}

export async function toggleSwitch(entityId: string): Promise<void> {
  if (!connection) throw new Error('Not connected')
  await callService(connection, 'switch', 'toggle', { entity_id: entityId })
}

export interface HistoryState {
  s: string   // state
  a?: Record<string, unknown>  // attributes (only if not minimal)
  lu: number  // last_updated (unix timestamp)
}

const HA_STORAGE_KEY = 'homeassistant-desktop'

export interface HaUserData {
  hiddenEntities: string[]
  favoriteEntities: string[]
  chartEntities: string[]
  areaOrder: string[]
  roomEntityOrder: Record<string, string[]>
  roomSensorOrder: Record<string, string[]>
}

export async function getUserData(): Promise<HaUserData | null> {
  if (!connection) throw new Error('Not connected')
  const result = await connection.sendMessagePromise<{ value: HaUserData | null }>({
    type: 'frontend/get_user_data',
    key: HA_STORAGE_KEY
  })
  return result.value
}

export async function saveUserData(data: HaUserData): Promise<void> {
  if (!connection) throw new Error('Not connected')
  await connection.sendMessagePromise({
    type: 'frontend/set_user_data',
    key: HA_STORAGE_KEY,
    value: data
  })
}

export async function fetchHistory(
  entityIds: string[],
  hoursBack = 24
): Promise<Record<string, HistoryState[]>> {
  if (!connection) throw new Error('Not connected')
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - hoursBack * 60 * 60 * 1000)

  return connection.sendMessagePromise({
    type: 'history/history_during_period',
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    entity_ids: entityIds,
    include_start_time_state: true,
    significant_changes_only: false,
    minimal_response: true,
    no_attributes: true
  })
}

export function getLightBrightness(entity: HassEntity): number {
  return Math.round(((entity.attributes?.brightness ?? 0) / 255) * 100)
}

export function isOn(entity: HassEntity): boolean {
  return entity.state === 'on'
}

export function isAvailable(entity: HassEntity): boolean {
  return entity.state !== 'unavailable'
}
