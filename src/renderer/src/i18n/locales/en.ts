const en = {
  // Setup screen
  setup: {
    subtitle: 'Connect to your installation',
    url_label: 'Home Assistant URL',
    token_label: 'Long-Lived Access Token',
    token_placeholder: 'Create a token via Profile → Security → Long-Lived Access Tokens',
    token_hint: 'Go to your HA profile → Security → create a new token',
    connecting: 'Connecting...',
    connect: 'Connect'
  },

  // Navigation
  nav: {
    rooms: 'Rooms',
    favorites: 'Favorites',
    charts: 'Charts'
  },

  // Header
  header: {
    connecting: 'Connecting...',
    error: 'Connection error',
    manage_title: 'Manage entities',
    settings_title: 'Settings'
  },

  // Rooms view
  rooms: {
    empty_title: 'No rooms found',
    empty_hint: 'Create rooms in HA via Settings → Areas'
  },

  // Room card
  room: {
    lights_on_one: '{{count}} light on',
    lights_on_other: '{{count}} lights on',
    all_off: 'All off',
    toggle_off_title: 'Turn all lights off',
    toggle_on_title: 'Turn all lights on',
    hide: 'Hide'
  },

  // Favorites view
  favorites: {
    empty: 'No favorites yet',
    manage: 'Manage entities'
  },

  // Manage entities
  manage: {
    title: 'Manage Entities',
    search: 'Search...',
    not_found: 'No entities found',
    tab_visible: 'Visible',
    tab_favorites: 'Favorites',
    tab_charts: 'Charts',
    show_hidden: 'Show hidden only ({{count}})'
  },

  // Charts view
  charts: {
    empty: 'No charts configured',
    add_entities: 'Add entities',
    refresh: 'Refresh',
    loading: 'Loading...',
    no_data: 'No data available'
  },

  // Settings view
  settings: {
    status_label: 'Connection status',
    theme_label: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    language_label: 'Language',
    manage: 'Manage entities',
    disconnect: 'Remove connection'
  },

  // Connection statuses
  status: {
    connected: 'connected',
    connecting: 'connecting',
    error: 'error',
    disconnected: 'disconnected'
  }
} as const

export default en
export type Translations = typeof en
