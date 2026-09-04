# Home Assistant Desktop

A lightweight system tray desktop app for controlling your Home Assistant instance. Built with Electron, React, and TypeScript.

## Screenshots

<p float="left">
  <img src="images/Schermafbeelding 2026-09-04 125259.png" width="280" alt="Rooms view" />
  <img src="images/Schermafbeelding 2026-09-04 125233.png" width="280" alt="Settings view" />
</p>

## Features

- **Rooms** — Browse all your HA areas. Each room shows lights with a master toggle and sensor chips (temperature, humidity, motion, etc.)
- **Favorites** — Pin any entity for quick access across rooms
- **Charts** — Historical line charts for sensor entities (1h / 6h / 24h / 7d)
- **Drag to reorder** — Rooms, entities within a room, and sensor chips are all drag-sortable
- **Hide entities** — Remove clutter by hiding entities per room; unhide easily via the "Show hidden only" filter in Manage Entities
- **HA-backed settings** — All preferences (hidden entities, favorites, order, etc.) are stored in Home Assistant and tied to your user account. Logging in from any device restores your settings automatically
- **Light / Dark / System theme** — Follows your OS or pick manually
- **Multilingual** — English, Dutch, German, French, Spanish

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A running [Home Assistant](https://www.home-assistant.io/) instance
- A long-lived access token from HA (Profile → Security → Long-Lived Access Tokens)

### Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Package (distributable)

```bash
npm run package
```

Outputs to `dist/` for Windows (NSIS installer), macOS (DMG), and Linux (AppImage).

## Connecting to Home Assistant

On first launch, enter your HA URL (e.g. `http://homeassistant.local:8123`) and a long-lived access token. The app connects via WebSocket and stays in sync in real time.

## Tech Stack

| Layer | Library |
|---|---|
| Shell | Electron + electron-vite |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS + CSS variables |
| State | Zustand |
| HA connection | home-assistant-js-websocket |
| Drag & drop | @dnd-kit/core |
| Charts | recharts |
| Icons | @mdi/js |
| i18n | i18next + react-i18next |

## Adding a Language

1. Copy `src/renderer/src/i18n/locales/en.ts` to a new file, e.g. `pt.ts`
2. Translate all strings — TypeScript will error if any key is missing (enforced via the `Translations` type)
3. Add the new locale to `src/renderer/src/i18n/index.ts`:
   ```ts
   import pt from './locales/pt'

   export const SUPPORTED_LANGUAGES = {
     // ... existing entries
     pt: 'Português',
   } as const

   i18n.use(initReactI18next).init({
     resources: { /* ... */ pt: { translation: pt } },
     // ...
   })
   ```

That's it — the language picker in Settings picks it up automatically.

## Platform Support

| Platform | Format |
|---|---|
| Windows | NSIS installer |
| macOS | DMG |
| Linux | AppImage |
