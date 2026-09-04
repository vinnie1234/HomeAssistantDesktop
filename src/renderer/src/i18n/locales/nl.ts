import type { Translations } from './en'

const nl: Translations = {
  setup: {
    subtitle: 'Verbind met je installatie',
    url_label: 'Home Assistant URL',
    token_label: 'Long-Lived Access Token',
    token_placeholder: 'Maak een token aan via Profiel → Beveiliging → Long-Lived Access Tokens',
    token_hint: 'Ga naar je HA profiel → Beveiliging → maak een nieuw token aan',
    connecting: 'Verbinden...',
    connect: 'Verbinden'
  },

  nav: {
    rooms: 'Kamers',
    favorites: 'Favorieten',
    charts: 'Grafieken'
  },

  header: {
    connecting: 'Verbinden...',
    error: 'Verbindingsfout',
    manage_title: 'Entities beheren',
    settings_title: 'Instellingen'
  },

  rooms: {
    empty_title: 'Geen kamers gevonden',
    empty_hint: 'Maak kamers aan in HA via Instellingen → Kamers'
  },

  room: {
    lights_on_one: '{{count}} lamp aan',
    lights_on_other: '{{count}} lampen aan',
    all_off: 'Alles uit',
    toggle_off_title: 'Alle lampen uit',
    toggle_on_title: 'Alle lampen aan',
    hide: 'Verbergen'
  },

  favorites: {
    empty: 'Nog geen favorieten',
    manage: 'Entities beheren'
  },

  manage: {
    title: 'Entities beheren',
    search: 'Zoeken...',
    not_found: 'Geen entities gevonden',
    tab_visible: 'Zichtbaar',
    tab_favorites: 'Favorieten',
    tab_charts: 'Grafieken',
    show_hidden: 'Toon alleen verborgen ({{count}})'
  },

  charts: {
    empty: 'Geen grafieken ingesteld',
    add_entities: 'Entities toevoegen',
    refresh: 'Vernieuwen',
    loading: 'Laden...',
    no_data: 'Geen data beschikbaar'
  },

  settings: {
    status_label: 'Verbindingsstatus',
    theme_label: 'Thema',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'Systeem',
    language_label: 'Taal',
    manage: 'Entities beheren',
    disconnect: 'Verbinding verwijderen'
  },

  status: {
    connected: 'verbonden',
    connecting: 'verbinden',
    error: 'fout',
    disconnected: 'verbroken'
  }
}

export default nl
