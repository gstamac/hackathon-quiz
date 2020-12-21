import { RouteProps } from 'react-router-dom'
import { RedirectOnSignOut } from '../../utils/interfaces'

export interface RouteWithLayoutProps extends RouteProps {
  layout: React.ComponentType
  isPrivate?: boolean
  redirectOnSignOut?: RedirectOnSignOut
  layoutProps?: {
    headerTitle: string
    headerFullwidth: boolean
  }
}
