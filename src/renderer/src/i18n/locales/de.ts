import type { Translations } from './en'

const de: Translations = {
  setup: {
    subtitle: 'Mit deiner Installation verbinden',
    url_label: 'Home Assistant URL',
    token_label: 'Long-Lived Access Token',
    token_placeholder: 'Token erstellen über Profil → Sicherheit → Long-Lived Access Tokens',
    token_hint: 'Gehe zu deinem HA-Profil → Sicherheit → neues Token erstellen',
    connecting: 'Verbinde...',
    connect: 'Verbinden'
  },

  nav: {
    rooms: 'Räume',
    favorites: 'Favoriten',
    charts: 'Diagramme'
  },

  header: {
    connecting: 'Verbinde...',
    error: 'Verbindungsfehler',
    manage_title: 'Entitäten verwalten',
    settings_title: 'Einstellungen'
  },

  rooms: {
    empty_title: 'Keine Räume gefunden',
    empty_hint: 'Räume in HA anlegen über Einstellungen → Bereiche'
  },

  room: {
    lights_on_one: '{{count}} Lampe an',
    lights_on_other: '{{count}} Lampen an',
    all_off: 'Alles aus',
    toggle_off_title: 'Alle Lampen ausschalten',
    toggle_on_title: 'Alle Lampen einschalten',
    hide: 'Ausblenden'
  },

  favorites: {
    empty: 'Noch keine Favoriten',
    manage: 'Entitäten verwalten'
  },

  manage: {
    title: 'Entitäten verwalten',
    search: 'Suchen...',
    not_found: 'Keine Entitäten gefunden',
    tab_visible: 'Sichtbar',
    tab_favorites: 'Favoriten',
    tab_charts: 'Diagramme',
    show_hidden: 'Nur ausgeblendete anzeigen ({{count}})'
  },

  charts: {
    empty: 'Keine Diagramme konfiguriert',
    add_entities: 'Entitäten hinzufügen',
    refresh: 'Aktualisieren',
    loading: 'Laden...',
    no_data: 'Keine Daten verfügbar'
  },

  settings: {
    status_label: 'Verbindungsstatus',
    theme_label: 'Design',
    theme_light: 'Hell',
    theme_dark: 'Dunkel',
    theme_system: 'System',
    language_label: 'Sprache',
    manage: 'Entitäten verwalten',
    disconnect: 'Verbindung entfernen'
  },

  status: {
    connected: 'verbunden',
    connecting: 'verbinden',
    error: 'Fehler',
    disconnected: 'getrennt'
  }
}

export default de
