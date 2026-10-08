import { expect, test } from 'vitest'
import { SAVE_KEY, clearSave, hasSave, loadGame, saveGame } from './save'

const createStorage = (initial = {}) => {
  const items = { ...initial }
  return {
    items,
    getItem: (key) => (key in items ? items[key] : null),
    setItem: (key, value) => { items[key] = String(value) },
    removeItem: (key) => { delete items[key] }
  }
}

const fixedNow = () => new Date('2026-10-08T00:00:00.000Z')

test('saved state round-trips under the app key with version and time', () => {
  const storage = createStorage()
  const state = { level: 3, xp: 2, killCount: 5 }

  expect(saveGame(state, storage, fixedNow)).toBe(true)
  expect(JSON.parse(storage.items[SAVE_KEY])).toEqual({
    version: 1,
    savedAt: '2026-10-08T00:00:00.000Z',
    state
  })
  expect(loadGame(storage)).toEqual(state)
  expect(hasSave(storage)).toBe(true)
})

test('saving again overwrites the single save slot', () => {
  const storage = createStorage()
  saveGame({ level: 1 }, storage, fixedNow)
  saveGame({ level: 2 }, storage, fixedNow)

  expect(Object.keys(storage.items)).toEqual([SAVE_KEY])
  expect(loadGame(storage)).toEqual({ level: 2 })
})

test('missing, broken, or unknown-version data is treated as no save', () => {
  expect(loadGame(createStorage())).toBeNull()
  expect(loadGame(createStorage({ [SAVE_KEY]: '{not json' }))).toBeNull()
  expect(loadGame(createStorage({ [SAVE_KEY]: 'null' }))).toBeNull()
  expect(loadGame(createStorage({ [SAVE_KEY]: JSON.stringify({ version: 2, state: { level: 1 } }) }))).toBeNull()
  expect(loadGame(createStorage({ [SAVE_KEY]: JSON.stringify({ version: 1, state: [1] }) }))).toBeNull()
  expect(hasSave(createStorage({ [SAVE_KEY]: '{not json' }))).toBe(false)
})

test('storage failures do not throw and report no save', () => {
  const failing = {
    getItem: () => { throw new Error('denied') },
    setItem: () => { throw new Error('quota') },
    removeItem: () => { throw new Error('denied') }
  }

  expect(saveGame({ level: 1 }, failing, fixedNow)).toBe(false)
  expect(loadGame(failing)).toBeNull()
  expect(() => clearSave(failing)).not.toThrow()
  expect(saveGame({ level: 1 }, null)).toBe(false)
  expect(loadGame(null)).toBeNull()
})

test('clearing removes the save', () => {
  const storage = createStorage()
  saveGame({ level: 1 }, storage, fixedNow)
  clearSave(storage)

  expect(hasSave(storage)).toBe(false)
})
