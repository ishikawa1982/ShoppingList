import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App.jsx'

describe('App (ローカルモード)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('クラッシュせず初期画面が表示される', () => {
    render(<App />)
    expect(screen.getByText('かいものリスト')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('買うものを追加')).toBeInTheDocument()
  })

  it('バージョンを画面下部に表示する', () => {
    render(<App />)
    expect(screen.getByText(/^v\d+\.\d+\.\d+$/)).toBeInTheDocument()
  })

  it('アイテムを追加できる', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('買うものを追加')
    fireEvent.change(input, { target: { value: 'りんご' } })
    fireEvent.submit(input.closest('form'))
    expect(screen.getByText('りんご')).toBeInTheDocument()
  })

  it('共有シートを開ける（Firebase 設定済みなら共有開始ボタンを表示）', () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('共有'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /共有を始める/ })).toBeInTheDocument()
  })
})
