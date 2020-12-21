import { ScrollRefData, ScrollState} from './interfaces'
import { useState, useCallback, DependencyList } from 'react'
import { debounce } from 'lodash'
import { SCROLL_DEBOUNCE_DELAY } from '../../../constants'

export const useScrollRef = (deps: DependencyList): ScrollRefData => {
  const [scrollState, setScrollState] = useState<ScrollState>({})
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null)

  const handleScroll: EventListener = (event: Event) => {
    const scrollLeft: number = (event as any).target.scrollLeft
    const scrollWidth: number = (event as any).target.scrollWidth
    const scrollTop: number = (event as any).target.scrollTop
    const scrollHeight: number = (event as any).target.scrollHeight
    const scrollClientWidth: number = (event as any).target.clientWidth
    const scrollClientHeight: number = (event as any).target.clientHeight

    setScrollState({
      scrollLeft,
      scrollWidth,
      scrollTop,
      scrollHeight,
      scrollClientWidth,
      scrollClientHeight,
    })
  }

  const scrollDebouncedCallback = useCallback(debounce(handleScroll, SCROLL_DEBOUNCE_DELAY), [])

  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      const scrollLeft: number = node.scrollLeft
      const scrollWidth: number = node.scrollWidth
      const scrollTop: number = node.scrollTop
      const scrollHeight: number = node.scrollHeight
      const scrollClientWidth: number = node.clientWidth
      const scrollClientHeight: number = node.clientHeight

      node.addEventListener('scroll', scrollDebouncedCallback)

      setScrollState({
        scrollLeft,
        scrollWidth,
        scrollTop,
        scrollHeight,
        scrollClientWidth,
        scrollClientHeight,
      })

      setScrollNode(node)

      return () => {
        node.removeEventListener('scroll', handleScroll)
      }
    }
  }, [...deps, scrollNode])

  return {
    scrollState,
    scrollRef,
    scrollNode,
  }
}
