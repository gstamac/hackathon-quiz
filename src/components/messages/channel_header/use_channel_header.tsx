import { useBooleanState } from '../../../hooks/use_boolean_state'
import { UseChannelHeaderResponse } from './interfaces'

export const useChannelHeader = (): UseChannelHeaderResponse => {
  const [channelSettingsOpen, openChannelSettings, closeChannelSettings] = useBooleanState(false)
  const [membersSidebarOpen, openMembersSidebar, closeMembersSidebar] = useBooleanState(false)

  return {
    openMembersSidebar,
    closeMembersSidebar,
    openChannelSettings,
    closeChannelSettings,
    channelSettingsOpen,
    membersSidebarOpen,
  }
}
