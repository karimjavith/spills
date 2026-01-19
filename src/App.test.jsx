import {render, screen} from '@testing-library/react'
import {it, expect} from 'vitest'
import App from './App.jsx'

it('renders hello message', () => {
  render(<App />)
  const headingElement = screen.getByText(/Hello Vite \+ React!/i)
  expect(headingElement).toBeInTheDocument()
})