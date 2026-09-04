// Generates a 32x32 RGBA PNG tray icon using only Node.js built-ins
const { deflateSync } = require('zlib')
const { writeFileSync } = require('fs')
const { join } = require('path')

function crc32(buf) {
  const table = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c >>> 0
  }
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = (table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)) >>> 0
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

const W = 32, H = 32

// Draw a simple house icon: RGBA pixels
const rows = []
for (let y = 0; y < H; y++) {
  const row = [0] // filter byte = None
  for (let x = 0; x < W; x++) {
    const cx = x - W / 2 + 0.5
    const cy = y - H / 2 + 0.5
    let r = 0, g = 0, b = 0, a = 0

    // Roof triangle: rows 2-15, triangle peak at center top
    const roofTop = 3, roofBot = 15
    if (y >= roofTop && y <= roofBot) {
      const halfSpan = (y - roofTop) + 1
      if (x >= W / 2 - halfSpan && x < W / 2 + halfSpan) {
        r = 26; g = 115; b = 232; a = 255
      }
    }

    // Walls: rows 13-27, x 7-24
    if (y >= 13 && y <= 27 && x >= 7 && x <= 24) {
      r = 26; g = 115; b = 232; a = 255
    }

    // Door: rows 20-27, x 13-18 (transparent cutout)
    if (y >= 20 && y <= 27 && x >= 13 && x <= 18) {
      a = 0
    }

    // Windows: rows 14-19, x 8-11 and x 20-23
    if (y >= 14 && y <= 19 && ((x >= 8 && x <= 11) || (x >= 20 && x <= 23))) {
      r = 180; g = 220; b = 255; a = 255
    }

    row.push(r, g, b, a)
  }
  rows.push(...row)
}

const rawData = Buffer.from(rows)
const compressed = deflateSync(rawData)

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8   // bit depth
ihdr[9] = 6   // color type: RGBA
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0))
])

const out = join(__dirname, 'tray-icon.png')
writeFileSync(out, png)
console.log(`Created ${out} (${png.length} bytes)`)
