import React from 'react'
import { PopoverProps as PopoverPropsMUI } from '@material-ui/core/Popover'

export interface PopoverProps extends Omit<
  PopoverPropsMUI, | 'anchorOrigin' | 'elevation' | 'getContentAnchorEl' | 'transformOrigin'
> {
  compact?: boolean
  cursorAt?: React.RefObject<Element | HTMLButtonElement |null>
  anchorEl?: Element | HTMLButtonElement | HTMLDivElement | null
}
