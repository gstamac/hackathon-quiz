import React from 'react'
import { ListHeaderProps } from './interfaces'
import { useStyles } from './styles'

export const ListHeader: React.FC<ListHeaderProps> = ({
  title,
}: ListHeaderProps) => {
  const classes = useStyles()

  return (
    <div className={classes.listHeaderPadding}>
      <div className={classes.title}>
        {title}
      </div>
    </div>
  )
}
