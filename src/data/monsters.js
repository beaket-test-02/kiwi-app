export const MONSTER_CATEGORY = Object.freeze({
  COMMON: 'common',
  BOSS: 'boss'
})

export const monsters = Object.freeze([
  { id: 'slime', name: '沼地の粘魔', category: MONSTER_CATEGORY.COMMON, baseHp: 6, reward: 3, asset: './assets/monsters/slime.png' },
  { id: 'goblin', name: '緑衣の妖兵', category: MONSTER_CATEGORY.COMMON, baseHp: 8, reward: 4, asset: './assets/monsters/goblin.png' },
  { id: 'bird', name: '南海の怪鳥', category: MONSTER_CATEGORY.COMMON, baseHp: 10, reward: 5, asset: './assets/monsters/bird.png' },
  { id: 'dragon', name: '古森の地竜', category: MONSTER_CATEGORY.COMMON, baseHp: 12, reward: 6, asset: './assets/monsters/dragon.png' },
  { id: 'crab', name: '赤甲の槍蟹', category: MONSTER_CATEGORY.COMMON, baseHp: 9, reward: 5, asset: './assets/monsters/crab.png' },
  { id: 'boar', name: '荒野の猪武者', category: MONSTER_CATEGORY.COMMON, baseHp: 11, reward: 6, asset: './assets/monsters/boar.png' },
  { id: 'mushroom', name: '紅笠の茸術師', category: MONSTER_CATEGORY.COMMON, baseHp: 7, reward: 5, asset: './assets/monsters/mushroom.png' },
  { id: 'turtle', name: '碧甲の亀衛士', category: MONSTER_CATEGORY.COMMON, baseHp: 14, reward: 7, asset: './assets/monsters/turtle.png' },
  { id: 'rainbow', name: '七彩の魔将', category: MONSTER_CATEGORY.BOSS, baseHp: 18, reward: 12, asset: './assets/monsters/rainbow.png' },
  { id: 'queen', name: '星辰の女王', category: MONSTER_CATEGORY.BOSS, baseHp: 22, reward: 15, asset: './assets/monsters/queen.png' },
  { id: 'fox', name: '白妙の妖狐', category: MONSTER_CATEGORY.BOSS, baseHp: 20, reward: 14, asset: './assets/monsters/fox.png' },
  { id: 'serpent', name: '深海の蛇帝', category: MONSTER_CATEGORY.BOSS, baseHp: 24, reward: 17, asset: './assets/monsters/serpent.png' }
])

export const getMonstersByCategory = (category) => monsters.filter((monster) => monster.category === category)
