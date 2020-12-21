import { ToggledStateResult, ToggledStateProps } from './interfaces'
import { useState } from 'react'

export const useToggledState = ({
  initialState,
  mounted = true,
  condition,
  command,
}: ToggledStateProps): ToggledStateResult => {

  const [state, setState] = useState<boolean>(initialState)

  const triggerStateToggle = async (): Promise<void> => {
    const evalCondition: boolean = condition?.() ?? true

    if (state === initialState && evalCondition && command) {
      setState(!initialState)
      try {
        await command()
      } catch (err){
        setState(initialState)
      } finally {
        if (mounted) {
          setState(initialState)
        }
      }
    }
  }

  return [ state, triggerStateToggle ]
}
