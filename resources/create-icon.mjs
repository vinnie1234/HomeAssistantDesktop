// Generates a simple 32x32 PNG tray icon using raw PNG encoding
// Run once: node resources/create-icon.mjs
import { writeFileSync } from 'fs'

// Minimal 32x32 PNG with a home shape
// We'll use a base64-encoded simple PNG
const base64Png = `iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAABuElEQVRYhe2XvU4CQRCAvwULCiqKhbHQWCgxWBgTE2OhsZBYaCwkFhoLiYXGQuKBhcRCYiGx0FhILDQWEguNhcRCYuEBkMgfQByP4vbubs8DHrgvuSS3O9+3c7OzMwsqKioq8gHLwCZQBaqABUwBF0ALuAPqHmcGWAWOgVugCXSBNnAFnAGHwJq3rCzHgF1gH2gAH0AbuAE2gUMgB5x5y84BHoD9GJABboCzGJAGPMUAvgE2gA3gFegBX8AZ8A+0Ad4COvADRK0C0gAAAABJRU5ErkJggg==`

const buf = Buffer.from(base64Png, 'base64')
writeFileSync(new URL('./tray-icon.png', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'), buf)
console.log('Icon written to resources/tray-icon.png')
