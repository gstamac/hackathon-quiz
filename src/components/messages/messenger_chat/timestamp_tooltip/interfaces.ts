import { TooltipProps } from '@material-ui/core'

export interface TimestampTooltipProps extends Pick<TooltipProps, 'children'> {
  timestamp: string
  messageIsMine: boolean
  showAvatar?: boolean
}
