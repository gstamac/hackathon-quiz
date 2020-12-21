import { TooltipProps as TooltipPropsMUI } from '@material-ui/core'

export interface TooltipProps extends Pick<TooltipPropsMUI, 'children' | 'open'> {
  heading: string
  description: string
  enabled?: boolean
  offset?: string
}
