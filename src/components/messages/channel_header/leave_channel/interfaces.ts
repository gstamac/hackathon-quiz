import { DialogProps } from 'globalid-react-ui'

export interface LeaveChannelDialogProps extends DialogProps {
  handleLeaveChannel: () => void
  inProgress: boolean
}

export interface LeaveChannelHookProps {
  channelId: string
}

export interface LeaveChannelHook {
  closeLeaveChannelDialog: () => void
  handleLeaveChannel: () => Promise<void>
  openLeaveChannelDialog: () => void
  leaveChannelInProgress: boolean
  leaveChannelDialogOpen: boolean
}
