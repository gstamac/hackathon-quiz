import { RosterType } from 'amazon-chime-sdk-component-library-react/lib/types'

export type LayoutType = 'standard' | 'featured'

export interface AppStateValue {
  meetingId: string | null
  localUserName: string
  theme: string
  layout: LayoutType
  region: string
  toggleTheme: () => void
  toggleLayout: () => void
  setAppMeetingInfo: (meetingId: string, name: string, region: string) => void
}

export interface NavigationContextType {
  showNavbar: boolean
  showRoster: boolean
  toggleRoster: () => void
  toggleNavbar: () => void
  openRoster: () => void
  closeRoster: () => void
  openNavbar: () => void
  closeNavbar: () => void
}

export interface RosterContextValue {
  roster: RosterType
}
