import React from 'react'
import { ListInfoMessageProps } from './interfaces'
import { useStyles } from './styles'

export const ListInfoMessage: React.FC<ListInfoMessageProps> = ({
  message,
}: ListInfoMessageProps) => {
  const classes = useStyles()

  return (
    <div className={classes.listInfoMessageWrapper}>
      <span className={classes.listInfoMessage}>{message}</span>
    </div>
  )
}
