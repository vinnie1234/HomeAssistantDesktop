import type { Translations } from './en'

const es: Translations = {
  setup: {
    subtitle: 'Conecta con tu instalación',
    url_label: 'URL de Home Assistant',
    token_label: 'Token de acceso de larga duración',
    token_placeholder: 'Crea un token en Perfil → Seguridad → Tokens de acceso de larga duración',
    token_hint: 'Ve a tu perfil de HA → Seguridad → crea un nuevo token',
    connecting: 'Conectando...',
    connect: 'Conectar'
  },

  nav: {
    rooms: 'Habitaciones',
    favorites: 'Favoritos',
    charts: 'Gráficos'
  },

  header: {
    connecting: 'Conectando...',
    error: 'Error de conexión',
    manage_title: 'Gestionar entidades',
    settings_title: 'Ajustes'
  },

  rooms: {
    empty_title: 'No se encontraron habitaciones',
    empty_hint: 'Crea habitaciones en HA en Ajustes → Áreas'
  },

  room: {
    lights_on_one: '{{count}} luz encendida',
    lights_on_other: '{{count}} luces encendidas',
    all_off: 'Todo apagado',
    toggle_off_title: 'Apagar todas las luces',
    toggle_on_title: 'Encender todas las luces',
    hide: 'Ocultar'
  },

  favorites: {
    empty: 'Aún no hay favoritos',
    manage: 'Gestionar entidades'
  },

  manage: {
    title: 'Gestionar entidades',
    search: 'Buscar...',
    not_found: 'No se encontraron entidades',
    tab_visible: 'Visible',
    tab_favorites: 'Favoritos',
    tab_charts: 'Gráficos',
    show_hidden: 'Mostrar solo ocultos ({{count}})'
  },

  charts: {
    empty: 'No hay gráficos configurados',
    add_entities: 'Añadir entidades',
    refresh: 'Actualizar',
    loading: 'Cargando...',
    no_data: 'No hay datos disponibles'
  },

  settings: {
    status_label: 'Estado de conexión',
    theme_label: 'Tema',
    theme_light: 'Claro',
    theme_dark: 'Oscuro',
    theme_system: 'Sistema',
    language_label: 'Idioma',
    manage: 'Gestionar entidades',
    disconnect: 'Eliminar conexión'
  },

  status: {
    connected: 'conectado',
    connecting: 'conectando',
    error: 'error',
    disconnected: 'desconectado'
  }
}

export default es
