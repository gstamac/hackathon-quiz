import { ReactNode } from 'react'

export interface RightSidebarProps {
  title: string | JSX.Element
  children: ReactNode
  open: boolean
  onExit (): void
  className?: string
  closeSidebarIcon?: RightSidebarIconType
  closeSidebarAction?: () => void
}

export enum RightSidebarIconType {
  CLOSE = 'close',
  BACK = 'back'
}

export interface RightSidebarSwitchContentItem extends Omit<RightSidebarProps, 'children' | 'open' | 'onExit' | 'className'> {
  content: JSX.Element
}

export interface RightSidebarSwitchContent {
  [key: string]: RightSidebarSwitchContentItem
}
