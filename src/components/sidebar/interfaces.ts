export interface ListOption {
  key: string
  text: string
  name: string
  locked: boolean
  href?: string
  onClick?: () => void
  icon?: (() => JSX.Element) | null
  newTab?: boolean
  postIcon?: (() => JSX.Element) | null
  subOptions?: ListOption[]
  canBeActive?: boolean
  bottomOption?: boolean
  index?: number
  notificationMark?: boolean
}
export interface Params {
  isMobileOrTablet?: boolean
  isAppUser: boolean
  color: string
  iconColor: string
  windowInnerHeight: number
  hasUnreadMessages: boolean
}

export interface OpenState {
  openMoreOptions: boolean
  openSideBar: boolean
  openDisconnectModal: boolean
  openGetAppModal: boolean
  openSubMenu: boolean
  transition: boolean
}

export interface SidebarListOptions {
  isLoggedIn: boolean
  options: ListOption[]
  isMobileOrTablet: boolean
  openState: OpenState
}

export type OnSidebarItemClick = (options: ListOption) => void

export interface SidebarSubMenuProps {
  menuItem?: ListOption
  onBack: () => void
  onClick: OnSidebarItemClick
  openState: OpenState
}

export enum SidebarMenuTab {
  PROFILE = 'profile',
  CONTACTS = 'contacts',
  GET_THE_APP = 'get_the_app',
  MORE = 'more',
  MESSAGES = 'messages',
  GROUPS = 'groups',
  WALLET = 'wallet',
  NONE = 'none',
}
