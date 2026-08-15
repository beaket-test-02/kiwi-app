import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { getMonstersByCategory, MONSTER_CATEGORY, monsters } from './monsters'

describe('Monster category', () => {
  test('contains eight common monsters and four bosses with unique IDs and assets', () => {
    expect(getMonstersByCategory(MONSTER_CATEGORY.COMMON)).toHaveLength(8)
    expect(getMonstersByCategory(MONSTER_CATEGORY.BOSS)).toHaveLength(4)
    expect(monsters).toHaveLength(12)
    expect(new Set(monsters.map((monster) => monster.id)).size).toBe(monsters.length)
    expect(new Set(monsters.map((monster) => monster.asset)).size).toBe(monsters.length)
  })

  test('keeps every monster record and its asset valid', () => {
    const assetPattern = /^\.\/assets\/monsters\/[a-z]+\.png$/

    monsters.forEach((monster) => {
      expect(monster).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        category: expect.any(String),
        baseHp: expect.any(Number),
        reward: expect.any(Number),
        asset: expect.any(String)
      }))
      expect(monster.id).toMatch(/^[a-z]+$/)
      expect(monster.name.trim()).not.toBe('')
      expect([MONSTER_CATEGORY.COMMON, MONSTER_CATEGORY.BOSS]).toContain(monster.category)
      expect(monster.baseHp).toSatisfy(Number.isInteger)
      expect(monster.baseHp).toBeGreaterThan(0)
      expect(monster.reward).toSatisfy(Number.isInteger)
      expect(monster.reward).toBeGreaterThan(0)
      expect(monster.asset).toMatch(assetPattern)
      expect(existsSync(resolve(process.cwd(), monster.asset.replace('./assets/', 'public/assets/')))).toBe(true)
    })
  })
})
