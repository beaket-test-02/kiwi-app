// KIWI-DEC-002: localStorage に1件だけ、バージョン付き JSON で保存する
export const SAVE_KEY = 'kiwi-app:save'
export const SAVE_VERSION = 1

const defaultStorage = () => {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

export const saveGame = (state, storage = defaultStorage(), now = () => new Date()) => {
  if (!storage) return false
  try {
    storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, savedAt: now().toISOString(), state }))
    return true
  } catch {
    return false
  }
}

export const loadGame = (storage = defaultStorage()) => {
  if (!storage) return null
  try {
    const raw = storage.getItem(SAVE_KEY)
    if (raw === null) return null
    const data = JSON.parse(raw)
    if (!isPlainObject(data) || data.version !== SAVE_VERSION || !isPlainObject(data.state)) return null
    return data.state
  } catch {
    return null
  }
}

export const hasSave = (storage = defaultStorage()) => loadGame(storage) !== null

export const clearSave = (storage = defaultStorage()) => {
  if (!storage) return
  try {
    storage.removeItem(SAVE_KEY)
  } catch {
    // 消せないときも保存なしと同じく続ける
  }
}
