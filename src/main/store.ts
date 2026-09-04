import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

function getStorePath(): string {
  const dir = app.getPath('userData')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'config.json')
}

function read(): Record<string, unknown> {
  const path = getStorePath()
  if (!existsSync(path)) return {}
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return {}
  }
}

function write(data: Record<string, unknown>): void {
  writeFileSync(getStorePath(), JSON.stringify(data, null, 2), 'utf-8')
}

export const store = {
  get: (key: string): unknown => read()[key],
  set: (key: string, value: unknown): void => write({ ...read(), [key]: value }),
  delete: (key: string): void => {
    const data = read()
    delete data[key]
    write(data)
  }
}
