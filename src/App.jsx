import { createSignal, Match, Switch } from 'solid-js'
import './style.css'

const quotes = [
  'キウイちゃんのパンチ！',
  'ふわふわアタックだよ！',
  'モンスターがびっくりした！',
  'つぎはもっとつよくなるよ！',
  'キラキラスキル発動〜！'
]

const enemies = [
  { name: 'ぷにぷにスライム', baseHp: 6, reward: 3, type: 'slime' },
  { name: 'もこもこゴブリン', baseHp: 8, reward: 4, type: 'goblin' },
  { name: 'トロピカルバード', baseHp: 10, reward: 5, type: 'bird' },
  { name: 'ふわふわドラゴン', baseHp: 12, reward: 6, type: 'dragon' }
]

const bosses = [
  { name: 'レインボーブロス', baseHp: 18, reward: 12, type: 'rainbow' },
  { name: 'スタークイーン', baseHp: 22, reward: 15, type: 'queen' }
]

const skills = [
  { level: 1, name: 'キウイパンチ', desc: 'やさしい一撃でXPをちょっぴりゲットしよう。', power: 0 },
  { level: 3, name: 'ふわふわアタック', desc: 'ぴょんとジャンプして強めのダメージ！', power: 1 },
  { level: 5, name: 'キウイほう', desc: '魔法のようにモンスターを揺さぶるよ。', power: 2 },
  { level: 8, name: 'サンライズバースト', desc: 'きらめく一撃でボスにも大ダメージ！', power: 3 }
]

const questTemplates = [
  { id: 1, title: 'モンスターを5たい たおす', type: 'kill', target: 5, current: 0, reward: 5, done: false },
  { id: 2, title: 'ボスを1たい たおす', type: 'boss', target: 1, current: 0, reward: 8, done: false },
  { id: 3, title: 'レベル3に なる', type: 'level', target: 3, current: 1, reward: 6, done: false }
]

const getNextThreshold = (level) => 6 + level * 3
const getSkillByLevel = (level) => {
  return [...skills].reverse().find((skill) => level >= skill.level) || skills[0]
}

const getNewEnemy = (level, isBoss = false) => {
  const base = isBoss
    ? bosses[Math.floor(Math.random() * bosses.length)]
    : enemies[Math.floor(Math.random() * enemies.length)]
  const maxHp = base.baseHp + Math.floor(level * 1.5) + Math.floor(Math.random() * 4)
  return {
    name: base.name,
    hp: maxHp,
    maxHp,
    reward: base.reward + level,
    type: base.type,
    isBoss
  }
}

const getPlayerMaxHp = (level) => 14 + Math.floor(level * 2)
const getHealAmount = (level) => 4 + Math.floor(level / 2)
const getEnemyDamage = (enemy, level) => (enemy.isBoss ? 4 + Math.floor(level / 2) : 1 + Math.floor(level / 2))
const getAttackPower = (level, skill) => Math.max(1, level + skill.power + Math.floor(Math.random() * 3))

const checkQuests = (nextQuests, nextLevel, nextKillCount, nextBossDefeated) => {
  return nextQuests.map((quest) => {
    if (quest.done) return quest
    let nextCurrent = quest.current
    if (quest.type === 'level') {
      nextCurrent = Math.min(quest.target, nextLevel)
    }
    if (quest.type === 'kill') {
      nextCurrent = Math.min(quest.target, nextKillCount)
    }
    if (quest.type === 'boss' && nextBossDefeated) {
      nextCurrent = quest.target
    }
    return {
      ...quest,
      current: nextCurrent,
      done: nextCurrent >= quest.target
    }
  })
}

export default function App() {
  const [screen, setScreen] = createSignal('title')
  const [level, setLevel] = createSignal(1)
  const [xp, setXp] = createSignal(0)
  const [message, setMessage] = createSignal('ちいさなキウイの冒険へようこそ！')
  const [enemy, setEnemy] = createSignal(getNewEnemy(1))
  const [killCount, setKillCount] = createSignal(0)
  const [bossDefeated, setBossDefeated] = createSignal(false)
  const [quests, setQuests] = createSignal(questTemplates)
  const [playerHp, setPlayerHp] = createSignal(getPlayerMaxHp(1))


  const resetGame = () => {
    setLevel(1)
    setXp(0)
    setEnemy(getNewEnemy(1))
    setKillCount(0)
    setBossDefeated(false)
    setQuests(questTemplates)
    setPlayerHp(getPlayerMaxHp(1))
    setMessage('モンスターをたおしてXPをためよう！')
  }

  const startGame = () => {
    resetGame()
    setScreen('playing')
  }

  const backToTitle = () => {
    resetGame()
    setScreen('title')
    setMessage('ちいさなキウイの冒険へようこそ！')
  }

  const gameOver = () => {
    setScreen('gameover')
    setMessage('キウイちゃんはたおれた…ゲームオーバー！')
  }

  const spawnNextEnemy = (currentLevel, nextKillCount, bossCleared) => {
    const needsBoss = !bossCleared && nextKillCount >= 5
    return getNewEnemy(currentLevel, needsBoss)
  }

  const attack = () => {
    if (screen() !== 'playing' || playerHp() <= 0) return

    const currentEnemy = enemy()
    if (currentEnemy.hp <= 0) {
      setMessage('あたらしいモンスターがもうすぐあらわれるよ！')
      return
    }

    const activeSkill = getSkillByLevel(level())
    const damage = getAttackPower(level(), activeSkill)
    const nextHp = Math.max(0, currentEnemy.hp - damage)

    if (nextHp === 0) {
      const gainedXp = currentEnemy.reward
      let nextXp = xp() + gainedXp
      let nextLevel = level()
      let nextKillCount = killCount()
      let nextBossDefeated = bossDefeated()
      let msg = `${currentEnemy.name}をたおした！ XP +${gainedXp}`

      if (currentEnemy.isBoss) {
        nextBossDefeated = true
      } else {
        nextKillCount += 1
      }

      while (nextXp >= getNextThreshold(nextLevel)) {
        nextXp -= getNextThreshold(nextLevel)
        nextLevel += 1
      }

      const nextQuests = checkQuests(quests(), nextLevel, nextKillCount, nextBossDefeated)
      const newQuestRewards = nextQuests.filter((quest, index) => quest.done && !quests()[index].done)
      const bonusXp = newQuestRewards.reduce((sum, quest) => sum + quest.reward, 0)
      if (bonusXp > 0) {
        nextXp += bonusXp
        msg += `  クエストクリア！XP +${bonusXp}`
      }

      if (nextLevel > level()) {
        const skill = getSkillByLevel(nextLevel)
        msg = `レベル${nextLevel}にアップ！${skill.name}を会得！`
      }

      setLevel(nextLevel)
      setXp(nextXp)
      setKillCount(nextKillCount)
      setBossDefeated(nextBossDefeated)
      setQuests(nextQuests)
      setMessage(msg)
      setEnemy(spawnNextEnemy(nextLevel, nextKillCount, nextBossDefeated))
    } else {
      const enemyDamage = getEnemyDamage(currentEnemy, level())
      const nextPlayerHp = Math.max(0, playerHp() - enemyDamage)
      setEnemy({ ...currentEnemy, hp: nextHp })
      setPlayerHp(nextPlayerHp)

      if (nextPlayerHp === 0) {
        setMessage(`${currentEnemy.name}に${damage}のダメージ！ キウイちゃんはたおれた…`)
        gameOver()
        return
      }

      setMessage(`${currentEnemy.name}に${damage}のダメージ！ つぎに${enemyDamage}のカウンター！`)
    }
  }

  const heal = () => {
    if (screen() !== 'playing' || playerHp() <= 0) return
    const maxHp = getPlayerMaxHp(level())
    if (playerHp() >= maxHp) {
      setMessage('キウイちゃんはもう元気いっぱい！')
      return
    }
    const healed = Math.min(maxHp, playerHp() + getHealAmount(level()))
    setPlayerHp(healed)
    setMessage(`キウイちゃんが ${healed - playerHp()} かいふくしたよ！`)
  }

  const reset = () => {
    resetGame()
    setScreen('playing')
  }

  const threshold = getNextThreshold(level())
  const activeSkill = getSkillByLevel(level())

  return (
    <Switch>
      <Match when={screen() === 'title'}>
        <div class="app-shell">
          <div class="card">
            <div class="title-bar">
              <h1>キウイ伝説</h1>
            </div>
            <div class="panel">
              <p class="skill-desc">キウイちゃんの冒険をはじめよう。モンスターとバトルして、レベルアップとクエストをクリアしよう！</p>
              <div class="button-row">
                <button type="button" onClick={startGame}>ゲームスタート</button>
              </div>
            </div>
          </div>
        </div>
      </Match>

      <Match when={screen() === 'gameover'}>
        <div class="app-shell">
          <div class="card">
            <div class="title-bar">
              <h1>ゲームオーバー</h1>
              <p>もう一度チャレンジしよう</p>
            </div>
            <div class="panel">
              <p class="skill-desc">{message()}</p>
              <div class="button-row">
                <button type="button" onClick={backToTitle}>タイトルへもどる</button>
              </div>
            </div>
          </div>
        </div>
      </Match>

      <Match when={screen() === 'playing'}>
        <div class="app-shell">
          <div class="card">
            <div class="title-bar">
              <h1>キウイ伝説</h1>
            </div>

            <div class="menu-grid">
              <section class="panel status-panel">
                <div class="panel-title">STATUS</div>
                <div class="stat-row"><span>Lv</span><strong>{level()}</strong></div>
                <div class="stat-row"><span>HP</span><strong>{playerHp()} / {getPlayerMaxHp(level())}</strong></div>
                <div class="stat-row"><span>XP</span><strong>{xp()} / {threshold}</strong></div>
                <div class="stat-row"><span>Skill</span><strong>{activeSkill.name}</strong></div>
                <div class="skill-desc">{activeSkill.desc}</div>
              </section>

              <section class="panel enemy-panel">
                <div class="panel-title">ENEMY</div>
                <div class="enemy-avatar-wrapper">
                  <div class={`enemy-avatar ${enemy().type} ${enemy().isBoss ? 'boss' : ''}`}></div>
                </div>
                <div class="enemy-name">{enemy().name}</div>
                <div class="meter-bar">
                  <div class="meter-fill" style={{ width: `${Math.round((enemy().hp / enemy().maxHp) * 100)}%` }}></div>
                </div>
                <div class="meter-label">HP {enemy().hp} / {enemy().maxHp}</div>
              </section>

              <section class="panel quest-panel">
                <div class="panel-title">QUESTS</div>
                {quests().map((quest) => (
                  <div class={`quest-item ${quest.done ? 'done' : ''}`}>
                    <span>{quest.title}</span>
                    <small>{quest.current} / {quest.target}</small>
                  </div>
                ))}
              </section>
            </div>

            <div class="battle-grid">
              <div class="hero-card">
                <div class="hero-avatar"></div>
                <div class="hero-title">キウイちゃん</div>
                <p class="hero-subtitle">勇者のたまご</p>
              </div>

              <div class="battle-panel">
                <div class="panel-title">BATTLE</div>
                <div class="battle-display">
                  <div class="battle-frame">
                    <span class="battle-text">{message()}</span>
                  </div>
                </div>
                <div class="button-row">
                  <button type="button" onClick={attack}>こうげき</button>
                  <button type="button" class="heal-button" onClick={heal}>かいふく</button>
                </div>
              </div>
            </div>

            <div class="footer-row">
              <button type="button" class="reset-button" onClick={reset}>ゲームリセット</button>
            </div>
          </div>
        </div>
      </Match>
    </Switch>
  )
}
