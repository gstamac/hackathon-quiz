import React from 'react'
import clsx from 'clsx'
import { CloseButton } from 'globalid-react-ui'
import { Drawer } from '@material-ui/core'
import { BottomDrawerProps } from './interfaces'
import { useStyles } from './styles'

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  children,
  className,
  onClose,
  open,
  title = '',
  ...drawerProps
}: BottomDrawerProps) => {
  const classes = useStyles()

  const getTitle = (): JSX.Element => (
    <div className={classes.bottomDrawerHeader}>
      <div className={classes.bottomDrawerTitle}>
        {title}
      </div>
      <CloseButton handleClick={onClose} className={classes.bottomDrawerCloseButton} />
    </div>
  )

  return (
    <Drawer
      anchor='bottom'
      className={clsx(classes.bottomDrawerRoot, className)}
      elevation={0}
      onClose={onClose}
      open={open}
      variant='temporary'
      {...drawerProps}
    >
      {getTitle()}
      {children}
    </Drawer>
  )
}
