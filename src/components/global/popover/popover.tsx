import React from 'react'
import clsx from 'clsx'
import PopoverMUI from '@material-ui/core/Popover'
import { useStyles } from './styles'
import { PopoverProps } from './interfaces'

export const Popover: React.FC<PopoverProps> = ({
  children,
  className,
  compact = false,
  cursorAt,
  ...properties
}: PopoverProps) => {
  const classes = useStyles()
  const anchorElement: Element | null | undefined = cursorAt?.current

  return <PopoverMUI
    anchorEl={anchorElement}
    className={clsx(
      classes.popoverRoot,
      {[classes.popoverCompactRoot]: compact},
      className
    )}
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...properties}
  >
    {children}
  </PopoverMUI>
}
