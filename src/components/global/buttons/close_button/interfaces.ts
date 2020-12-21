import { ReactNode } from 'react'

export interface CloseButtonProps {
  handleClick?: () => void
  children?: ReactNode
  className?: string
}
