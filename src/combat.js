export const skills = [
  { level: 1, name: '嘴撃', desc: '鋭き嘴をもって敵の急所を穿つ。', power: 0 },
  { level: 3, name: '飛羽撃', desc: '風をまとい、間合いの外より強襲する。', power: 1 },
  { level: 5, name: '翠星砲', desc: '蓄えた翠光を一条の矢として放つ。', power: 2 },
  { level: 8, name: '暁光烈破', desc: '曙光を呼び、戦場を一閃する奥義。', power: 3 }
]

export const getNextThreshold = (level) => 6 + level * 3

export const getSkillByLevel = (level) => [...skills].reverse().find((skill) => level >= skill.level) || skills[0]

export const getPlayerMaxHp = (level) => 14 + Math.floor(level * 2)

export const getHealAmount = (level) => 4 + Math.floor(level / 2)

export const getEnemyDamage = (enemy, level) => enemy.isBoss ? 4 + Math.floor(level / 2) : 1 + Math.floor(level / 2)

export const getAttackPower = (level, skill, random) => (
  Math.max(1, level + skill.power + Math.floor(random() * 3))
)

export const createEnemy = (level, source, isBoss, random) => {
  const base = source[Math.floor(random() * source.length)]
  const maxHp = base.baseHp + Math.floor(level * 1.5) + Math.floor(random() * 4)
  return { ...base, hp: maxHp, maxHp, reward: base.reward + level, isBoss }
}

export const applyLevels = (earnedXp, startingLevel) => {
  let nextXp = earnedXp
  let nextLevel = startingLevel
  while (nextXp >= getNextThreshold(nextLevel)) {
    nextXp -= getNextThreshold(nextLevel)
    nextLevel += 1
  }
  return [nextXp, nextLevel]
}

export const checkQuests = (items, nextLevel, nextKillCount, bossCleared) => items.map((quest) => {
  if (quest.done) return quest
  const progress = quest.type === 'level' ? nextLevel : quest.type === 'kill' ? nextKillCount : bossCleared ? 1 : 0
  const current = Math.min(quest.target, progress)
  return { ...quest, current, done: current >= quest.target }
})
