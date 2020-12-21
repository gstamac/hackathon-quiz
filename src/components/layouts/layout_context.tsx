import React from 'react'
import { RouteComponentProps } from 'react-router-dom'

export type LayoutState = {
  title?: string
  content: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>
  contentProps: RouteComponentProps<{ [x: string]: string | undefined }>
  titleFullwidth?: boolean
  isPrivate: boolean
  isLoading: boolean
  isLoggedIn: boolean
  isBrowserNotificationsPromptVisible: boolean
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export const LayoutContext = React.createContext<LayoutState | undefined>(undefined)

export const useLayoutState = (): LayoutState | undefined => React.useContext(LayoutContext)
