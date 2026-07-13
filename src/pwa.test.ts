import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('PWA files', () => {
  const root = path.resolve(__dirname, '..')

  it('manifest.json exists and has required fields', () => {
    const manifestPath = path.join(root, 'public', 'manifest.json')
    const exists = fs.existsSync(manifestPath)
    expect(exists).toBe(true)

    const content = fs.readFileSync(manifestPath, 'utf-8')
    const json = JSON.parse(content)

    expect(json.name).toBeDefined()
    expect(json.start_url).toBeDefined()
  })

  it('icons exist (192 & 512)', () => {
    const icon192 = path.join(root, 'public', 'icons', 'icon-192.svg')
    const icon512 = path.join(root, 'public', 'icons', 'icon-512.svg')

    expect(fs.existsSync(icon192)).toBe(true)
    expect(fs.existsSync(icon512)).toBe(true)
  })
})
