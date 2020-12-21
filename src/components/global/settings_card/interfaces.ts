import { QuickMenuItemProps } from '../quick_menu/interfaces'
import { ReactChild } from 'react'

export interface SettingsCardProps {
  menuItems: QuickMenuItemProps[] | undefined
  title: string
  middleText: ReactChild
  description?: string
  isDialogOpen: boolean
}
