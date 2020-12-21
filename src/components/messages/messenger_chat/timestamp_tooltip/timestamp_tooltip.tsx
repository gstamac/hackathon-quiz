import React from 'react'
import { Tooltip } from '@material-ui/core'
import { useStyles, TimestampTooltipProps } from '.'
import clsx from 'clsx'

export const TimestampTooltip: React.FC<TimestampTooltipProps> = ({
  timestamp,
  messageIsMine,
  showAvatar,
  children,
}: TimestampTooltipProps): JSX.Element => {

  const {
    tooltipStyle,
    tooltipPopperArrow,
    arrow,
    tooltipPopper,
    tooltipPopperLeft,
  } = useStyles({ showAvatar })

  return (
    <Tooltip
      title={timestamp}
      data-testid={'add-channel-tooltip'}
      classes={{
        tooltip: tooltipStyle,
        popperArrow: tooltipPopperArrow,
        arrow: arrow,
        popper: clsx({
          [tooltipPopper]: true,
          [tooltipPopperLeft]: !messageIsMine,
        }),
      }}
      arrow
      placement={messageIsMine ? 'top-end' : showAvatar ? 'left-end' : 'left'}
      PopperProps={{
        container: document.querySelector('.messages-content'),
      }}
    >
      {children}
    </Tooltip>
  )
}
