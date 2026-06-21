import { useCallback, useRef, useState } from 'react'

const LONG_PRESS_MS = 500
const MOVE_CANCEL_PX = 8
const GAP_PX = 8 // .items の gap

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function useLongPressDrag(listRef, count, onReorder) {
  const [dragState, setDragState] = useState({
    active: false,
    fromIndex: -1,
    overIndex: -1,
    dragY: 0,
  })

  // Mutable refs（イベントハンドラ内で最新値を読むため）
  const activeRef = useRef(false)
  const fromRef = useRef(-1)
  const overRef = useRef(-1)
  const startYRef = useRef(0)
  const stepRef = useRef(0)
  const lastYRef = useRef(0)
  const countRef = useRef(count)
  countRef.current = count

  const pressTimer = useRef(null)
  const downPos = useRef({ x: 0, y: 0 })
  const moveCancelled = useRef(false)
  const rafScheduled = useRef(false)

  const onReorderRef = useRef(onReorder)
  onReorderRef.current = onReorder

  // 一度だけ生成する安定ハンドラ
  const moveRef = useRef(null)
  const upRef = useRef(null)
  const cancelRef = useRef(null)

  const cleanup = useRef(() => {
    document.removeEventListener('pointermove', moveRef.current)
    document.removeEventListener('pointerup', upRef.current)
    document.removeEventListener('pointercancel', cancelRef.current)
  }).current

  const reset = useRef(() => {
    clearTimeout(pressTimer.current)
    pressTimer.current = null
    cleanup()
    activeRef.current = false
    fromRef.current = -1
    overRef.current = -1
    setDragState({ active: false, fromIndex: -1, overIndex: -1, dragY: 0 })
  }).current

  if (!moveRef.current) {
    moveRef.current = (e) => {
      lastYRef.current = e.clientY

      // ドラッグ開始前：8px 超の移動でキャンセル（スクロール優先）
      if (!activeRef.current) {
        if (moveCancelled.current) return
        const dx = e.clientX - downPos.current.x
        const dy = e.clientY - downPos.current.y
        if (Math.sqrt(dx * dx + dy * dy) > MOVE_CANCEL_PX) {
          moveCancelled.current = true
          clearTimeout(pressTimer.current)
          pressTimer.current = null
        }
        return
      }

      // ドラッグ中：rAF でスロットルして state 更新
      e.preventDefault()
      if (rafScheduled.current) return
      rafScheduled.current = true
      requestAnimationFrame(() => {
        rafScheduled.current = false
        if (!activeRef.current) return
        const dragY = lastYRef.current - startYRef.current
        const step = stepRef.current || 1
        const over = clamp(
          fromRef.current + Math.round(dragY / step),
          0,
          Math.max(0, countRef.current - 1),
        )
        overRef.current = over
        setDragState({ active: true, fromIndex: fromRef.current, overIndex: over, dragY })
      })
    }

    upRef.current = () => {
      const wasActive = activeRef.current
      const from = fromRef.current
      const over = overRef.current
      reset()
      if (wasActive) {
        // ドラッグ直後の click（タップ編集）を1回だけ握りつぶす
        const suppress = (ev) => {
          ev.stopPropagation()
          ev.preventDefault()
          document.removeEventListener('click', suppress, true)
        }
        document.addEventListener('click', suppress, true)
        setTimeout(() => document.removeEventListener('click', suppress, true), 350)

        if (over >= 0 && over !== from) {
          onReorderRef.current(from, over)
        }
      }
    }

    cancelRef.current = () => {
      reset()
    }
  }

  const getItemProps = useCallback(
    (index) => {
      const onPointerDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        moveCancelled.current = false
        downPos.current = { x: e.clientX, y: e.clientY }
        lastYRef.current = e.clientY

        document.addEventListener('pointermove', moveRef.current, { passive: false })
        document.addEventListener('pointerup', upRef.current)
        document.addEventListener('pointercancel', cancelRef.current)

        pressTimer.current = setTimeout(() => {
          // 行ピッチ（gap 込み）を実測
          const children = listRef.current ? Array.from(listRef.current.children) : []
          let step = 0
          if (children.length > 1) {
            step = children[1].getBoundingClientRect().top - children[0].getBoundingClientRect().top
          } else if (children.length === 1) {
            step = children[0].getBoundingClientRect().height + GAP_PX
          }
          stepRef.current = step
          startYRef.current = lastYRef.current
          activeRef.current = true
          fromRef.current = index
          overRef.current = index
          setDragState({ active: true, fromIndex: index, overIndex: index, dragY: 0 })
        }, LONG_PRESS_MS)
      }

      if (!dragState.active) {
        return { onPointerDown, 'data-draggable': 'true', style: undefined, className: '' }
      }

      const { fromIndex, overIndex, dragY } = dragState
      const step = stepRef.current

      if (index === fromIndex) {
        return {
          onPointerDown,
          'data-draggable': 'true',
          className: ' item--dragging',
          style: {
            transform: `translateY(${dragY}px) scale(1.03)`,
            transition: 'none',
            zIndex: 20,
            position: 'relative',
          },
        }
      }

      let shift = 0
      if (fromIndex < overIndex && index > fromIndex && index <= overIndex) shift = -step
      else if (fromIndex > overIndex && index >= overIndex && index < fromIndex) shift = step

      return {
        onPointerDown,
        'data-draggable': 'true',
        className: '',
        style: {
          transform: `translateY(${shift}px)`,
          transition: 'transform 0.18s ease',
        },
      }
    },
    [dragState, listRef],
  )

  return { dragState, getItemProps }
}
