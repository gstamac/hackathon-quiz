import { useState, useCallback } from 'react'
import { CoupledScrollContextData } from './interfaces'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCoupledScrollContextRef = (deps: any[]): CoupledScrollContextData => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, deps)

  return {
    ref,
    isVisible,
  }
}
