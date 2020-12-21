import { useState } from 'react'
import { BooleanState } from './interfaces'

export const useBooleanState = (initialState: boolean): BooleanState => {
  const [boolean, setBoolean] = useState<boolean>(initialState)

  const setTrue = (): void => {
    setBoolean(true)
  }

  const setFalse = (): void => {
    setBoolean(false)
  }

  return [
    boolean,
    setTrue,
    setFalse,
  ]
}
