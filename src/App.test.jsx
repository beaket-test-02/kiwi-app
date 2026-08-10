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

test('title screen transitions to playing screen when start button is clicked', async () => {
  container = document.body.appendChild(document.createElement('div'))
  dispose = solidRender(() => <App />, container)

  const startButton = screen.getByText('ゲームスタート')
  expect(startButton).toBeTruthy()
  expect(screen.queryByText('STATUS')).toBeNull()

  startButton.click()
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(screen.getByText('STATUS')).toBeTruthy()
  expect(screen.getByText('BATTLE')).toBeTruthy()
})
