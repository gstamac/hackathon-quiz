import { PopoverProps } from '../popover/interfaces'

export interface QuickMenuItemProps {
  id: string
  disabled?: boolean
  hidden?: boolean
  icon?: JSX.Element
  onClick?: UFn<void> | UFn<UFn<void>>
  text: string | JSX.Element
}

export interface QuickMenuProps extends Omit<PopoverProps, 'children' | 'onClose'> {
  items?: QuickMenuItemProps[]
  onClose?: () => void
  title?: string
}
