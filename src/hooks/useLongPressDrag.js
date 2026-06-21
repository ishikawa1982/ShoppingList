import { useCallback, useRef, useState } from 'react'

const LONG_PRESS_MS = 500
const MOVE_CANCEL_PX = 8

export function useLongPressDrag(listRef, onReorder) {
  const [dragState, setDragState] = useState({ active: false, fromIndex: -1, overIndex: -1 })

  // Mutable state refs to avoid stale closures in event handlers
  const activeRef = useRef(false)
  const fromRef = useRef(-1)
  const overRef = useRef(-1)
  const pressTimer = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })
  const moveCancelled = useRef(false)
  const onReorderRef = useRef(onReorder)
  onReorderRef.current = onReorder

  // Stable handler refs — initialized once
  const moveRef = useRef(null)
  const upRef = useRef(null)
  const cancelRef = useRef(null)

  const getOverIndex = useRef((clientY) => {
    if (!listRef.current) return -1
    const children = Array.from(listRef.current.children)
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect()
      if (clientY < rect.top + rect.height / 2) return i
    }
    return Math.max(0, children.length - 1)
  }).current

  const cleanupRef = useRef(() => {
    document.removeEventListener('pointermove', moveRef.current)
    document.removeEventListener('pointerup', upRef.current)
    document.removeEventListener('pointercancel', cancelRef.current)
  }).current

  if (!moveRef.current) {
    moveRef.current = (e) => {
      if (!activeRef.current) {
        if (moveCancelled.current) return
        const dx = e.clientX - startPos.current.x
        const dy = e.clientY - startPos.current.y
        if (Math.sqrt(dx * dx + dy * dy) > MOVE_CANCEL_PX) {
          moveCancelled.current = true
          clearTimeout(pressTimer.current)
          pressTimer.current = null
        }
        return
      }
      const over = getOverIndex(e.clientY)
      if (over !== overRef.current) {
        overRef.current = over
        setDragState({ active: true, fromIndex: fromRef.current, overIndex: over })
      }
    }

    upRef.current = (e) => {
      const wasActive = activeRef.current
      const from = fromRef.current
      clearTimeout(pressTimer.current)
      pressTimer.current = null
      cleanupRef()
      activeRef.current = false
      fromRef.current = -1
      overRef.current = -1
      setDragState({ active: false, fromIndex: -1, overIndex: -1 })
      if (wasActive) {
        const over = getOverIndex(e.clientY)
        if (over >= 0 && over !== from) {
          onReorderRef.current(from, over)
        }
      }
    }

    cancelRef.current = () => {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
      cleanupRef()
      activeRef.current = false
      fromRef.current = -1
      overRef.current = -1
      setDragState({ active: false, fromIndex: -1, overIndex: -1 })
    }
  }

  const getItemProps = useCallback((index) => {
    const isDragging = dragState.active && dragState.fromIndex === index
    const isOver =
      dragState.active &&
      dragState.overIndex === index &&
      dragState.fromIndex !== index

    const onPointerDown = (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      moveCancelled.current = false
      startPos.current = { x: e.clientX, y: e.clientY }

      document.addEventListener('pointermove', moveRef.current)
      document.addEventListener('pointerup', upRef.current)
      document.addEventListener('pointercancel', cancelRef.current)

      pressTimer.current = setTimeout(() => {
        activeRef.current = true
        fromRef.current = index
        overRef.current = index
        setDragState({ active: true, fromIndex: index, overIndex: index })
      }, LONG_PRESS_MS)
    }

    const extraClass = (isDragging ? ' item--dragging' : '') + (isOver ? ' item--drag-over' : '')

    return { onPointerDown, 'data-draggable': 'true', extraClass }
  }, [dragState])

  return { dragState, getItemProps }
}
