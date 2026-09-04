import type { Translations } from './en'

const fr: Translations = {
  setup: {
    subtitle: 'Connectez-vous à votre installation',
    url_label: 'URL Home Assistant',
    token_label: "Jeton d'accès longue durée",
    token_placeholder: "Créez un jeton via Profil → Sécurité → Jetons d'accès longue durée",
    token_hint: 'Allez dans votre profil HA → Sécurité → créez un nouveau jeton',
    connecting: 'Connexion...',
    connect: 'Connecter'
  },

  nav: {
    rooms: 'Pièces',
    favorites: 'Favoris',
    charts: 'Graphiques'
  },

  header: {
    connecting: 'Connexion...',
    error: 'Erreur de connexion',
    manage_title: 'Gérer les entités',
    settings_title: 'Paramètres'
  },

  rooms: {
    empty_title: 'Aucune pièce trouvée',
    empty_hint: 'Créez des pièces dans HA via Paramètres → Zones'
  },

  room: {
    lights_on_one: '{{count}} lumière allumée',
    lights_on_other: '{{count}} lumières allumées',
    all_off: 'Tout éteint',
    toggle_off_title: 'Éteindre toutes les lumières',
    toggle_on_title: 'Allumer toutes les lumières',
    hide: 'Masquer'
  },

  favorites: {
    empty: 'Aucun favori pour le moment',
    manage: 'Gérer les entités'
  },

  manage: {
    title: 'Gérer les entités',
    search: 'Rechercher...',
    not_found: 'Aucune entité trouvée',
    tab_visible: 'Visible',
    tab_favorites: 'Favoris',
    tab_charts: 'Graphiques',
    show_hidden: 'Afficher uniquement les masqués ({{count}})'
  },

  charts: {
    empty: 'Aucun graphique configuré',
    add_entities: 'Ajouter des entités',
    refresh: 'Actualiser',
    loading: 'Chargement...',
    no_data: 'Aucune donnée disponible'
  },

  settings: {
    status_label: 'Statut de connexion',
    theme_label: 'Thème',
    theme_light: 'Clair',
    theme_dark: 'Sombre',
    theme_system: 'Système',
    language_label: 'Langue',
    manage: 'Gérer les entités',
    disconnect: 'Supprimer la connexion'
  },

  status: {
    connected: 'connecté',
    connecting: 'connexion',
    error: 'erreur',
    disconnected: 'déconnecté'
  }
}

export default fr
