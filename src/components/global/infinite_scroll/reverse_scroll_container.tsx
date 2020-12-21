import React, { useRef, useEffect, useMemo } from 'react'
import { TScrollContainer } from 'react-virtuoso'
import { useStyles } from './styles'
import clsx from 'clsx'
import { ReverseScrollContainerProps } from './interfaces'
import { KeyEvent } from '../../../constants'

type WheelEvent = HTMLElementEvent<HTMLDivElement, 'scroll'> & { wheelDelta?: number, deltaY?: number}

const fetchDelta = ({wheelDelta, deltaY}: WheelEvent): number =>
  wheelDelta !== undefined && wheelDelta !== 0 ? wheelDelta : deltaY !== undefined ? - deltaY * 50 : 0

export const ReverseScrollContainer: TScrollContainer = ({
  className,
  style,
  reportScrollTop,
  children,
}: React.PropsWithChildren<ReverseScrollContainerProps>) => {

  const elRef = useRef<HTMLDivElement>(null)

  let ticking: boolean = false
  const updateScrollTop = (event: WheelEvent | KeyboardEvent, delta: number): void => {
    if (elRef.current){
      const newPosition: number = elRef.current.scrollTop + delta

      if (newPosition !== elRef.current.scrollTop) {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            elRef.current?.scrollTo({
              top: newPosition,
              behavior: 'auto',
            })
            ticking = false
          })
          ticking = true
        }
      }
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }
  }
  const innerDiv: Element | undefined = elRef.current?.children[0].children[0]

  const isScrollable = useMemo<boolean>(() => {
    if (elRef.current && innerDiv)
    {
      return elRef.current.clientHeight < innerDiv?.scrollHeight
    }

    return true
  }, [elRef.current?.clientHeight, innerDiv?.scrollHeight])

  useEffect(() => {
    if (elRef.current){
      elRef.current.addEventListener('wheel', onScroll as any)
      elRef.current.addEventListener('keydown', onKeyDown as any)
    }

    return () => {
      if (elRef.current != null) {
        elRef.current.removeEventListener('wheel', onScroll as any)
        elRef.current.removeEventListener('keydown', onKeyDown as any)
      }
    }
  }, [elRef.current])

  const onKeyDown = (event: HTMLElementEvent<HTMLDivElement, 'keydown'>): void => {
    let delta: number = 0
    const deltaStep: number = 100

    switch (event.key) {
    case KeyEvent.Down:
    case KeyEvent.ArrowDown:
      delta = -deltaStep
      break
    case KeyEvent.Up:
    case KeyEvent.ArrowUp:
      delta = deltaStep
      break
    default:
      break
    }
    if (delta !== 0)
    {
      updateScrollTop(event, delta)
    }
  }

  const onScroll = (event: WheelEvent): void => {
    const delta: number = fetchDelta(event)

    updateScrollTop(event, delta)
  }

  const classes = useStyles({})

  return (
    <div
      data-testid={'scroll-container'}
      key={'reverse-scroll-container'}
      ref={elRef}
      style={{
        ...style,
        transform: 'translate3d(0,0,0) scaleY(-1)',
      }}
      tabIndex={0}
      onScroll={(e: any) => {
        reportScrollTop(e.target.scrollTop)
      }}
      className={clsx({
        [classes.topPosition]: !isScrollable,
      }, className)}
    >
      {children}
    </div>
  )
}
