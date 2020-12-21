import { ListOption } from '../interfaces'

export interface OpenState {
  openMoreOptions: boolean
  openSideBar: boolean
  openGetAppModal: boolean
}

export interface SidebarListProps {
  isLoggedIn: boolean
  options: ListOption[]
  openState: OpenState
  isMobileOrTablet: boolean
  handleOpenState: (value: string, menuItem?: ListOption) => void
}
