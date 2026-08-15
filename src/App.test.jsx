import { render as solidRender } from 'solid-js/web'
import { screen } from '@testing-library/dom'
import { afterEach, test, expect, vi } from 'vitest'
import App from './App'

let container
let dispose
let randomValues

const queueRandom = (...values) => randomValues.push(...values)

const playerStats = () => screen.getByText('兵力').parentElement.textContent

const startGame = async () => {
  randomValues = []
  vi.spyOn(Math, 'random').mockImplementation(() => randomValues.shift() ?? 0.999)
  container = document.body.appendChild(document.createElement('div'))
  dispose = solidRender(() => <App />, container)
  queueRandom(0, 0)
  screen.getByText(/新たなる旅を始める/).click()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

const defeatEnemy = (hits) => {
  queueRandom(...Array(hits).fill(0.999), 0, 0)
  for (let index = 0; index < hits; index += 1) screen.getByRole('button', { name: /攻撃/ }).click()
}

afterEach(() => {
  vi.restoreAllMocks()
  if (typeof dispose === 'function') dispose()
  if (container?.parentNode) container.parentNode.removeChild(container)
  container = null
  dispose = null
})

test('title screen transitions to the chronicle battle screen', async () => {
  container = document.body.appendChild(document.createElement('div'))
  dispose = solidRender(() => <App />, container)

  const startButton = screen.getByText(/新たなる旅を始める/)
  expect(startButton).toBeTruthy()
  expect(screen.queryByText('軍令')).toBeNull()

  startButton.click()
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(screen.getByText('勅命')).toBeTruthy()
  expect(screen.getByText('軍令')).toBeTruthy()
  expect(screen.getByRole('button', { name: /攻撃/ })).toBeTruthy()
  expect(container.querySelector('.hero-combatant img')?.getAttribute('src')).toMatch(/kiwi-portrait/)
  expect(container.querySelector('.enemy-portrait img')?.getAttribute('src')).toMatch(/assets\/monsters\//)
})

test('battle keyboard commands run only the allowed commands once', async () => {
  container = document.body.appendChild(document.createElement('div'))
  dispose = solidRender(() => <App />, container)

  screen.getByText(/新たなる旅を始める/).click()
  await new Promise((resolve) => setTimeout(resolve, 0))

  const turn = () => container.querySelector('.turn')?.textContent
  expect(turn()).toContain('第 1 刻')
  expect(container.querySelectorAll('kbd')).toHaveLength(2)
  expect(container.textContent).not.toContain('SPACE / ENTER')

  window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
  expect(turn()).toContain('第 2 刻')

  window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }))
  expect(turn()).toContain('第 3 刻')

  window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }))
  window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', repeat: true }))
  window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', ctrlKey: true }))
  expect(turn()).toContain('第 3 刻')
})

test('battle keyboard commands ignore editable targets', async () => {
  container = document.body.appendChild(document.createElement('div'))
  dispose = solidRender(() => <App />, container)

  screen.getByText(/新たなる旅を始める/).click()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const input = document.body.appendChild(document.createElement('input'))

  input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }))
  expect(container.querySelector('.turn')?.textContent).toContain('第 1 刻')

  input.remove()
})

test('rest consumes a turn only when it recovers troops and never exceeds the maximum', async () => {
  await startGame()

  queueRandom(0)
  screen.getByRole('button', { name: /攻撃/ }).click()
  expect(playerStats()).toContain('15 / 16')

  screen.getByRole('button', { name: /休息/ }).click()
  expect(playerStats()).toContain('16 / 16')
  expect(container.querySelector('.turn')?.textContent).toContain('第 3 刻')

  screen.getByRole('button', { name: /休息/ }).click()
  expect(playerStats()).toContain('16 / 16')
  expect(container.querySelector('.turn')?.textContent).toContain('第 3 刻')
})

test('five common victories complete kill and level orders together, then a boss returns to a common battle', async () => {
  await startGame()

  // The first three fights are level 1 (7 HP); the next two are level 2 (9 HP).
  defeatEnemy(3)
  defeatEnemy(3)
  defeatEnemy(3)
  defeatEnemy(3)
  defeatEnemy(3)

  expect(playerStats()).toContain('2 / 20')
  expect(container.textContent).toContain('討伐5')
  expect(container.querySelectorAll('.quest.done')).toHaveLength(2)
  expect(screen.getByText('総大将')).toBeTruthy()

  // Recover before fighting the level-3 boss (22 HP, four maximum-damage attacks).
  screen.getByRole('button', { name: /休息/ }).click()
  screen.getByRole('button', { name: /休息/ }).click()
  screen.getByRole('button', { name: /休息/ }).click()
  screen.getByRole('button', { name: /休息/ }).click()
  defeatEnemy(4)

  expect(container.textContent).toContain('討伐5')
  expect(container.querySelectorAll('.quest.done')).toHaveLength(3)
  expect(screen.getByText('敵部隊')).toBeTruthy()

  defeatEnemy(2)
  expect(container.textContent).toContain('討伐6')
  expect(screen.getByText(/功績 8 を得た/)).toBeTruthy()
})

test('gameover returns to the title and reorganization resets while staying in play', async () => {
  await startGame()

  // A turtle with 17 HP survives sixteen 1-damage attacks and defeats the player on the last counter.
  queueRandom(0.9, 0.999)
  screen.getByRole('button', { name: /再編/ }).click()
  queueRandom(...Array(16).fill(0))
  for (let index = 0; index < 16; index += 1) screen.getByRole('button', { name: /攻撃/ }).click()

  expect(screen.getByText('遠征失敗')).toBeTruthy()
  screen.getByRole('button', { name: /年代記を閉じる/ }).click()
  expect(screen.getByText(/新たなる旅を始める/)).toBeTruthy()

  queueRandom(0, 0)
  screen.getByText(/新たなる旅を始める/).click()
  await new Promise((resolve) => setTimeout(resolve, 0))
  queueRandom(0)
  screen.getByRole('button', { name: /攻撃/ }).click()
  expect(playerStats()).toContain('15 / 16')
  queueRandom(0, 0)
  screen.getByRole('button', { name: /再編/ }).click()
  expect(screen.queryByText(/新たなる旅を始める/)).toBeNull()
  expect(playerStats()).toContain('16 / 16')
  expect(container.querySelector('.turn')?.textContent).toContain('第 1 刻')
  expect(container.textContent).toContain('討伐0')
})
