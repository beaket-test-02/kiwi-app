import { createSignal, For, Match, onCleanup, onMount, Switch } from 'solid-js'
import './style.css'
import { getMonstersByCategory, MONSTER_CATEGORY } from './data/monsters'
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

const enemies = getMonstersByCategory(MONSTER_CATEGORY.COMMON)
const bosses = getMonstersByCategory(MONSTER_CATEGORY.BOSS)

const questTemplates = [
  { id: 1, title: '魔物を五体討伐せよ', type: 'kill', target: 5, current: 0, reward: 5, done: false },
  { id: 2, title: '辺境の魔将を討て', type: 'boss', target: 1, current: 0, reward: 8, done: false },
  { id: 3, title: '練度三へ到達せよ', type: 'level', target: 3, current: 1, reward: 6, done: false }
]

const getNewEnemy = (level, isBoss = false) => createEnemy(level, isBoss ? bosses : enemies, isBoss, Math.random)

function Meter(props) {
  const width = () => Math.max(0, Math.min(100, Math.round((props.value / props.max) * 100)))
  return <div class={`meter ${props.kind || ''}`}><i style={{ width: `${width()}%` }} /></div>
}

export default function App() {
  const [screen, setScreen] = createSignal('title')
  const [level, setLevel] = createSignal(1)
  const [xp, setXp] = createSignal(0)
  const [message, setMessage] = createSignal('東雲の海辺に、妖しき気配が満ちている。')
  const [enemy, setEnemy] = createSignal(getNewEnemy(1))
  const [killCount, setKillCount] = createSignal(0)
  const [bossDefeated, setBossDefeated] = createSignal(false)
  const [quests, setQuests] = createSignal(questTemplates.map((quest) => ({ ...quest })))
  const [playerHp, setPlayerHp] = createSignal(getPlayerMaxHp(1))
  const [turn, setTurn] = createSignal(1)

  const resetGame = () => {
    setLevel(1); setXp(0); setEnemy(getNewEnemy(1)); setKillCount(0); setBossDefeated(false)
    setQuests(questTemplates.map((quest) => ({ ...quest }))); setPlayerHp(getPlayerMaxHp(1)); setTurn(1)
    setMessage('東雲の海辺に、妖しき気配が満ちている。')
  }

  const startGame = () => { resetGame(); setScreen('playing') }
  const backToTitle = () => { resetGame(); setScreen('title') }
  const reset = () => { resetGame(); setScreen('playing') }

  const attack = () => {
    if (screen() !== 'playing' || playerHp() <= 0) return
    const target = enemy()
    const damage = getAttackPower(level(), getSkillByLevel(level()), Math.random)
    const remaining = Math.max(0, target.hp - damage)
    setTurn((value) => value + 1)

    if (remaining > 0) {
      const counter = getEnemyDamage(target, level())
      const hp = Math.max(0, playerHp() - counter)
      setEnemy({ ...target, hp: remaining }); setPlayerHp(hp)
      if (hp === 0) {
        setMessage(`${target.name}の反撃を受け、キウイは力尽きた。`)
        setScreen('gameover')
      } else {
        setMessage(`${getSkillByLevel(level()).name}――${target.name}に ${damage} の損害。敵の反撃 ${counter}。`)
      }
      return
    }

    let nextKills = killCount() + (target.isBoss ? 0 : 1)
    let nextBoss = bossDefeated() || target.isBoss
    let [nextXp, nextLevel] = applyLevels(xp() + target.reward, level())
    const updatedQuests = checkQuests(quests(), nextLevel, nextKills, nextBoss)
    const bonus = updatedQuests.reduce((sum, quest, index) => sum + (quest.done && !quests()[index].done ? quest.reward : 0), 0)
    ;[nextXp, nextLevel] = applyLevels(nextXp + bonus, nextLevel)
    const leveled = nextLevel > level()

    setLevel(nextLevel); setXp(nextXp); setKillCount(nextKills); setBossDefeated(nextBoss); setQuests(updatedQuests)
    setEnemy(getNewEnemy(nextLevel, !nextBoss && nextKills >= 5))
    setMessage(leveled ? `勝鬨が響く。練度 ${nextLevel} に昇り、${getSkillByLevel(nextLevel).name}を修得した。` : `${target.name}を討ち取った。功績 ${target.reward + bonus} を得た。`)
  }

  const heal = () => {
    if (screen() !== 'playing' || playerHp() <= 0) return
    const max = getPlayerMaxHp(level())
    if (playerHp() >= max) { setMessage('兵気は満ちている。今は休息を要さない。'); return }
    const before = playerHp()
    const healed = Math.min(max, before + getHealAmount(level()))
    setPlayerHp(healed); setTurn((value) => value + 1)
    setMessage(`薬草を用い、兵力を ${healed - before} 回復した。`)
  }

  const handleBattleKeydown = (event) => {
    const target = event.target
    const isEditable = target instanceof HTMLElement && (
      target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
    )

    if (
      screen() !== 'playing' || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isEditable
    ) return

    if (event.key === '1') attack()
    if (event.key === '2') heal()
  }

  onMount(() => {
    window.addEventListener('keydown', handleBattleKeydown)
    onCleanup(() => window.removeEventListener('keydown', handleBattleKeydown))
  })

  const activeSkill = () => getSkillByLevel(level())

  return (
    <main class="game-root">
      <div class="scanlines" aria-hidden="true" />
      <Switch>
        <Match when={screen() === 'title'}>
          <section class="title-screen">
            <div class="title-crest">KIWI CHRONICLE</div>
            <h1><span>辺境戦記</span>キウイ伝</h1>
            <p class="title-lead">遥かなる海と、名もなき勇者の年代記</p>
            <div class="title-rule"><span>第一章</span></div>
            <p class="prologue">王暦一五二二年。東方の辺境を覆う霧の中、<br />小さき戦士は、ただ一羽で旅立った。</p>
            <button class="start-command" type="button" onClick={startGame}><b>▶</b> 新たなる旅を始める</button>
            <div class="title-footer">© 1522 KIWI ROYAL ARCHIVES</div>
          </section>
        </Match>

        <Match when={screen() === 'gameover'}>
          <section class="ending-screen">
            <div class="ending-copy">遠征失敗</div>
            <h1>志、未だ果たされず</h1>
            <p>{message()}</p>
            <button class="start-command" type="button" onClick={backToTitle}><b>▶</b> 年代記を閉じる</button>
          </section>
        </Match>

        <Match when={screen() === 'playing'}>
          <section class="game-frame">
            <header class="chronicle-bar">
              <div><span>王暦</span> 1522年 五月 十七日</div>
              <h1>辺境戦記 キウイ伝</h1>
              <div class="turn"><span>刻</span> 第 {turn()} 刻</div>
            </header>

            <div class="main-grid">
              <aside class="left-rail">
                <div class="portrait-frame"><img src="./assets/kiwi-portrait.png" alt="主人公キウイの肖像" /></div>
                <div class="nameplate"><strong>キウイ</strong><span>辺境の若武者</span></div>
                <dl class="stats">
                  <div><dt>練度</dt><dd>{level()}</dd></div>
                  <div><dt>兵力</dt><dd>{playerHp()} / {getPlayerMaxHp(level())}</dd></div>
                  <Meter value={playerHp()} max={getPlayerMaxHp(level())} kind="life" />
                  <div><dt>功績</dt><dd>{xp()} / {getNextThreshold(level())}</dd></div>
                  <Meter value={xp()} max={getNextThreshold(level())} kind="xp" />
                  <div><dt>討伐</dt><dd>{killCount()}</dd></div>
                </dl>
                <div class="technique"><span>現在の奥義</span><strong>{activeSkill().name}</strong><p>{activeSkill().desc}</p></div>
              </aside>

              <section class="field-column">
                <div class="field-view">
                  <img src="./assets/battle-coast.png" alt="海辺の戦場で対峙するキウイと魔物" />
                  <div class="combatant-portrait hero-combatant">
                    <img src="./assets/kiwi-portrait.png" alt="戦いに臨むキウイ" />
                    <span>勇者</span>
                  </div>
                  <div class="versus-mark" aria-hidden="true"><span>対</span></div>
                  <div class={`enemy-portrait ${enemy().isBoss ? 'boss' : ''}`}>
                    <img src={enemy().asset} alt={`${enemy().name}の姿`} />
                    <span>{enemy().isBoss ? '魔将' : '魔物'}</span>
                  </div>
                  <div class="location"><small>東方辺境</small>東雲の海辺</div>
                  <div class="enemy-banner"><span>{enemy().isBoss ? '総大将' : '敵部隊'}</span><strong>{enemy().name}</strong></div>
                </div>
                <div class="enemy-status">
                  <span>敵兵力</span><Meter value={enemy().hp} max={enemy().maxHp} kind="enemy" /><b>{enemy().hp} / {enemy().maxHp}</b>
                </div>
                <div class="message-window"><span class="speaker">軍記</span><p>{message()}</p><i>▼</i></div>
              </section>

              <aside class="right-rail">
                <div class="section-heading">勅命</div>
                <div class="quest-list">
                  <For each={quests()}>{(quest) => <div class={quest.done ? 'quest done' : 'quest'}><i>{quest.done ? '済' : '令'}</i><p>{quest.title}<small>{quest.current} / {quest.target}</small></p></div>}</For>
                </div>
                <div class="section-heading command-title">軍令</div>
                <nav class="commands" aria-label="戦闘コマンド">
                  <button type="button" onClick={attack}><kbd>1</kbd><span>攻撃</span><small>{activeSkill().name}</small></button>
                  <button type="button" onClick={heal}><kbd>2</kbd><span>休息</span><small>薬草を用いる</small></button>
                  <button type="button" onClick={reset}><span>再編</span><small>戦況を初期化</small></button>
                </nav>
              </aside>
            </div>

            <footer class="footer-bar"><span>辺境軍記録 第壱巻</span></footer>
          </section>
        </Match>
      </Switch>
    </main>
  )
}
