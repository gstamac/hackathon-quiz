import React from 'react'
import { useDividerStyles } from './styles'

export const MessageDivider: React.FC = () => {

  const classes = useDividerStyles()

  return <div className={classes.divider} />
}
