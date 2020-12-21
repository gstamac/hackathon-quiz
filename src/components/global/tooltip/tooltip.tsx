import React from 'react'
import TooltipMUI from '@material-ui/core/Tooltip'
import { TooltipProps } from './interfaces'

import { useStyles } from './styles'

export const Tooltip: React.FC<TooltipProps> = (properties: TooltipProps) => {
  const classes = useStyles()
  const { heading, description, enabled, children, open, offset } = properties

  return <TooltipMUI
    open={open}
    arrow
    classes={{ tooltip: classes.tooltip, arrow: classes.tooltipArrow }}
    title={
      enabled ?
        <div>
          <div className={classes.tooltipHeading}>{heading}</div>
          <div className={classes.tooltipDescription}>{description}</div>
        </div>
        :
        ''
    }
    PopperProps={{
      popperOptions: {
        modifiers: {
          offset: {
            enabled: true,
            offset: offset ?? '0px, -7px',
          },
        },
      },
    }}
  >
    {children}
  </TooltipMUI>
}

