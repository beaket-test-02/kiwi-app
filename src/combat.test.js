import { expect, test } from 'vitest'
import {
  applyLevels,
  checkQuests,
  createEnemy,
  getAttackPower,
  getEnemyDamage,
  getHealAmount,
  getNextThreshold,
  getPlayerMaxHp,
  getSkillByLevel
} from './combat'

test('combat formulas preserve their current boundary values', () => {
  expect(getNextThreshold(1)).toBe(9)
  expect(getPlayerMaxHp(3)).toBe(20)
  expect(getHealAmount(3)).toBe(5)
  expect(getEnemyDamage({ isBoss: false }, 3)).toBe(2)
  expect(getEnemyDamage({ isBoss: true }, 3)).toBe(5)
  expect(getAttackPower(1, { power: 0 }, () => 0)).toBe(1)
  expect(getAttackPower(3, { power: 1 }, () => 0.999)).toBe(6)
  expect(getSkillByLevel(4)).toMatchObject({ name: '飛羽撃', power: 1 })
})

test('enemy generation uses the existing category, random consumption order, and reward formula', () => {
  const source = [
    { id: 'first', baseHp: 6, reward: 3 },
    { id: 'second', baseHp: 10, reward: 5 }
  ]
  const randomValues = [0.75, 0.999]
  const enemy = createEnemy(3, source, false, () => randomValues.shift())

  expect(enemy).toMatchObject({ id: 'second', hp: 17, maxHp: 17, reward: 8, isBoss: false })
  expect(randomValues).toHaveLength(0)
})

test('quest rewards can trigger multiple level-ups while carrying experience forward', () => {
  const quests = [
    { type: 'kill', target: 1, current: 0, reward: 20, done: false },
    { type: 'level', target: 3, current: 1, reward: 0, done: false }
  ]
  let [xp, level] = applyLevels(8, 1)
  expect([xp, level]).toEqual([8, 1])

  const updated = checkQuests(quests, level, 1, false)
  const bonus = updated.reduce((sum, quest, index) => sum + (quest.done && !quests[index].done ? quest.reward : 0), 0)
  ;[xp, level] = applyLevels(xp + bonus, level)

  expect([xp, level]).toEqual([7, 3])
  expect(updated[0]).toMatchObject({ current: 1, done: true })
})
