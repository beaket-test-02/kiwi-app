import { render as solidRender } from 'solid-js/web'
import { screen } from '@testing-library/dom'
import { afterEach, test, expect } from 'vitest'
import App from './App'

let container
let dispose

afterEach(() => {
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
