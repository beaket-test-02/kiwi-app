import { describe, expect, test } from 'vitest'
import { getMonstersByCategory, MONSTER_CATEGORY, monsters } from './monsters'

describe('Monster category', () => {
  test('contains eight common monsters and four bosses with unique assets', () => {
    expect(getMonstersByCategory(MONSTER_CATEGORY.COMMON)).toHaveLength(8)
    expect(getMonstersByCategory(MONSTER_CATEGORY.BOSS)).toHaveLength(4)
    expect(monsters).toHaveLength(12)
    expect(new Set(monsters.map((monster) => monster.asset)).size).toBe(monsters.length)
  })
})
