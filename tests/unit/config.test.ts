import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import os from 'node:os'

describe('getMemoDir', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    // Clear relevant env vars
    delete process.env.OPEN_MEMO_DIR
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('should return OPEN_MEMO_DIR when set', async () => {
    process.env.OPEN_MEMO_DIR = '/custom/memo/path'
    const { getMemoDir } = await import('../../src/config.js')
    expect(getMemoDir()).toBe('/custom/memo/path')
  })

  it('should return default path when OPEN_MEMO_DIR not set', async () => {
    delete process.env.OPEN_MEMO_DIR
    const { getMemoDir } = await import('../../src/config.js')
    const expected = `${os.homedir()}/.openmemo/memos`
    expect(getMemoDir()).toBe(expected)
  })

  it('should ignore empty OPEN_MEMO_DIR', async () => {
    process.env.OPEN_MEMO_DIR = '   '
    const { getMemoDir } = await import('../../src/config.js')
    const expected = `${os.homedir()}/.openmemo/memos`
    expect(getMemoDir()).toBe(expected)
  })
})

describe('getEditorCommand', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    // Clear all editor-related env vars
    delete process.env.OPEN_MEMO_EDITOR
    delete process.env.VISUAL
    delete process.env.EDITOR
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('should return OPEN_MEMO_EDITOR when set', async () => {
    process.env.OPEN_MEMO_EDITOR = 'code'
    const { getEditorCommand } = await import('../../src/config.js')
    expect(getEditorCommand()).toBe('code')
  })

  it('should fall back to VISUAL when OPEN_MEMO_EDITOR not set', async () => {
    process.env.VISUAL = 'nvim'
    const { getEditorCommand } = await import('../../src/config.js')
    expect(getEditorCommand()).toBe('nvim')
  })

  it('should fall back to EDITOR when VISUAL not set', async () => {
    process.env.EDITOR = 'nano'
    const { getEditorCommand } = await import('../../src/config.js')
    expect(getEditorCommand()).toBe('nano')
  })

  it('should default to vi when no env vars set', async () => {
    const { getEditorCommand } = await import('../../src/config.js')
    expect(getEditorCommand()).toBe('vi')
  })

  it('should prioritize OPEN_MEMO_EDITOR over VISUAL and EDITOR', async () => {
    process.env.OPEN_MEMO_EDITOR = 'code'
    process.env.VISUAL = 'nvim'
    process.env.EDITOR = 'nano'
    const { getEditorCommand } = await import('../../src/config.js')
    expect(getEditorCommand()).toBe('code')
  })
})
