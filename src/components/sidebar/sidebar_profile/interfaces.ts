import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'

export interface SidebarProfileProps {
  isLoading: boolean
  user?: PublicIdentity
  handleOpenState?: (value: string) => void
  handleDrawerClose?: () => void
}
