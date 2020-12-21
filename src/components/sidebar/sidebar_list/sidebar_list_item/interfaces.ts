import { ListOption } from '../../interfaces'
import React from 'react'

export interface SideBarListItemProps {
  option: ListOption
  openSideBar: boolean
  className?: string
  tabIndex?: number
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  inset?: boolean
}

export interface SidebarListItemContentProps {
  option: ListOption
  expand: boolean
  inset?: boolean
  id?: string
}
