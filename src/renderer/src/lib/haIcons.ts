import {
  mdiLightbulb, mdiLightbulbOutline,
  mdiToggleSwitch, mdiToggleSwitchOffOutline,
  mdiThermometer, mdiWaterPercent,
  mdiFlash, mdiFlashOutline,
  mdiGauge,
  mdiMotionSensor, mdiMotionSensorOff,
  mdiDoor, mdiDoorOpen,
  mdiWindowClosed, mdiWindowOpen,
  mdiSmoke, mdiSmokeDetector,
  mdiThermostat,
  mdiCastConnected, mdiCast,
  mdiFan, mdiFanOff,
  mdiLock, mdiLockOpen, mdiLockOpenOutline,
  mdiGarage, mdiGarageOpen,
  mdiBlinds, mdiBlindsOpen,
  mdiPalette,
  mdiScriptText,
  mdiCheckboxMarkedOutline, mdiCheckboxBlankOutline,
  mdiWeatherSunny, mdiWeatherNight,
  mdiAccountOutline,
  mdiHomeBattery, mdiHomeBatteryOutline,
  mdiSolarPower,
  mdiWifi, mdiWifiOff,
  mdiAlarmLight, mdiAlarmLightOutline,
  mdiHomeFlood,
  mdiRunFast,
  mdiEyeOutline, mdiEyeOffOutline,
  mdiMoleculeCo2,
  mdiAirFilter,
  mdiTimer, mdiTimerOff,
  mdiHelpCircleOutline
} from '@mdi/js'
import type { HassEntity } from './homeassistant'

export interface IconConfig {
  path: string
  color: string
}

const COLORS = {
  active:  '#c8a900',
  blue:    '#03a9f4',
  red:     '#f44336',
  green:   '#4caf50',
  gray:    '#6b7280',
  orange:  '#ff9800',
  teal:    '#009688',
  purple:  '#9c27b0'
}

function sensorIcon(entity: HassEntity): IconConfig {
  const dc = entity.attributes?.device_class as string | undefined
  switch (dc) {
    case 'temperature':  return { path: mdiThermometer,      color: COLORS.orange }
    case 'humidity':     return { path: mdiWaterPercent,     color: COLORS.blue }
    case 'power':
    case 'energy':
    case 'voltage':
    case 'current':
    case 'gas':          return { path: mdiFlash,            color: COLORS.orange }
    case 'pressure':     return { path: mdiGauge,            color: COLORS.blue }
    case 'co2':          return { path: mdiMoleculeCo2,      color: COLORS.orange }
    case 'air_quality':  return { path: mdiAirFilter,        color: COLORS.blue }
    case 'battery':      return { path: mdiHomeBattery,      color: COLORS.green }
    case 'illuminance':  return { path: mdiWeatherSunny,     color: COLORS.orange }
    case 'solar_power':  return { path: mdiSolarPower,       color: COLORS.orange }
    default:             return { path: mdiGauge,            color: COLORS.gray }
  }
}

function binarySensorIcon(entity: HassEntity, state: string): IconConfig {
  const dc = entity.attributes?.device_class as string | undefined
  const on = state === 'on'
  switch (dc) {
    case 'motion':       return { path: on ? mdiMotionSensor : mdiMotionSensorOff,      color: on ? COLORS.orange : COLORS.gray }
    case 'door':         return { path: on ? mdiDoorOpen : mdiDoor,                     color: on ? COLORS.orange : COLORS.gray }
    case 'window':       return { path: on ? mdiWindowOpen : mdiWindowClosed,           color: on ? COLORS.orange : COLORS.gray }
    case 'smoke':        return { path: on ? mdiSmoke : mdiSmokeDetector,               color: on ? COLORS.red : COLORS.gray }
    case 'moisture':     return { path: mdiHomeFlood,                                   color: on ? COLORS.red : COLORS.gray }
    case 'occupancy':
    case 'presence':     return { path: on ? mdiRunFast : mdiAccountOutline,            color: on ? COLORS.orange : COLORS.gray }
    case 'lock':         return { path: on ? mdiLockOpenOutline : mdiLock,              color: on ? COLORS.orange : COLORS.gray }
    case 'vibration':    return { path: on ? mdiAlarmLight : mdiAlarmLightOutline,      color: on ? COLORS.orange : COLORS.gray }
    case 'connectivity': return { path: on ? mdiWifi : mdiWifiOff,                     color: on ? COLORS.green : COLORS.red }
    default:             return { path: on ? mdiEyeOutline : mdiEyeOffOutline,          color: on ? COLORS.blue : COLORS.gray }
  }
}

export function getEntityIcon(entity: HassEntity, entityId: string): IconConfig {
  const domain = entityId.split('.')[0]
  const state = entity.state
  const on = state === 'on'

  switch (domain) {
    case 'light':
      return { path: on ? mdiLightbulb : mdiLightbulbOutline, color: on ? COLORS.active : COLORS.gray }

    case 'switch':
      return { path: on ? mdiToggleSwitch : mdiToggleSwitchOffOutline, color: on ? COLORS.blue : COLORS.gray }

    case 'input_boolean':
      return { path: on ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline, color: on ? COLORS.blue : COLORS.gray }

    case 'sensor':
      return sensorIcon(entity)

    case 'binary_sensor':
      return binarySensorIcon(entity, state)

    case 'climate': {
      const color = state === 'heat' ? COLORS.orange : state === 'cool' ? COLORS.blue : state === 'off' ? COLORS.gray : COLORS.teal
      return { path: mdiThermostat, color }
    }

    case 'media_player':
      return { path: on ? mdiCastConnected : mdiCast, color: on ? COLORS.blue : COLORS.gray }

    case 'fan':
      return { path: on ? mdiFan : mdiFanOff, color: on ? COLORS.blue : COLORS.gray }

    case 'lock':
      return { path: state === 'locked' ? mdiLock : mdiLockOpen, color: state === 'locked' ? COLORS.green : COLORS.orange }

    case 'cover': {
      const dc = entity.attributes?.device_class
      const isOpen = state === 'open'
      if (dc === 'garage') return { path: isOpen ? mdiGarageOpen : mdiGarage, color: isOpen ? COLORS.orange : COLORS.gray }
      if (dc === 'blind' || dc === 'shade') return { path: isOpen ? mdiBlindsOpen : mdiBlinds, color: isOpen ? COLORS.blue : COLORS.gray }
      return { path: isOpen ? mdiWindowOpen : mdiWindowClosed, color: isOpen ? COLORS.blue : COLORS.gray }
    }

    case 'scene':
      return { path: mdiPalette, color: COLORS.purple }

    case 'script':
      return { path: mdiScriptText, color: COLORS.blue }

    case 'timer':
      return { path: state === 'active' ? mdiTimer : mdiTimerOff, color: state === 'active' ? COLORS.orange : COLORS.gray }

    case 'person':
      return { path: mdiAccountOutline, color: COLORS.blue }

    case 'sun':
      return { path: state === 'above_horizon' ? mdiWeatherSunny : mdiWeatherNight, color: COLORS.orange }

    default:
      return { path: mdiHelpCircleOutline, color: COLORS.gray }
  }
}

export function getEntityStateLabel(entity: HassEntity, entityId: string): string {
  const domain = entityId.split('.')[0]
  const state = entity.state
  const unit = entity.attributes?.unit_of_measurement as string | undefined

  if (unit) return `${state} ${unit}`

  switch (domain) {
    case 'light':
    case 'switch':
    case 'fan':
    case 'input_boolean':  return state === 'on' ? 'Aan' : 'Uit'
    case 'binary_sensor':  return state === 'on' ? 'Open / Actief' : 'Gesloten / Inactief'
    case 'lock':           return state === 'locked' ? 'Vergrendeld' : 'Ontgrendeld'
    case 'cover':          return state === 'open' ? 'Open' : state === 'closed' ? 'Gesloten' : state
    case 'climate':        return state === 'off' ? 'Uit' : state
    case 'media_player':   return state === 'playing' ? 'Speelt af' : state === 'idle' ? 'Inactief' : state === 'off' ? 'Uit' : state
    default:               return state === 'unavailable' ? 'Niet beschikbaar' : state
  }
}
