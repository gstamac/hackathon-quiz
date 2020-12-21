import React from 'react'
import { useStyles } from './style'

import { ListOption } from '../../interfaces'

export const LinkComponentWrapper: React.FC<ListOption> = (props: React.PropsWithChildren<ListOption>) => {
  const { children, onClick } = props
  const classes = useStyles()

  return <div className={classes.listItemWrapper} onClick={onClick}>{children}</div>
}
