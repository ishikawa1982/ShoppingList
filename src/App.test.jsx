import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App.jsx'

describe('App (local mode, Firebase 未設定)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('クラッシュせず初期画面が表示される', () => {
    render(<App />)
    expect(screen.getByText('かいものリスト')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('買うものを追加')).toBeInTheDocument()
  })

  it('アイテムを追加できる', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('買うものを追加')
    fireEvent.change(input, { target: { value: 'りんご' } })
    fireEvent.submit(input.closest('form'))
    expect(screen.getByText('りんご')).toBeInTheDocument()
  })

  it('Firebase 未設定では共有シートが設定を促す', () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('共有'))
    expect(screen.getByText(/Firebase の設定が必要/)).toBeInTheDocument()
  })
})
