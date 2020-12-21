import React from 'react'
import { Backdrop, Portal } from '@material-ui/core'
import { GlobalidLoader } from '..'
import { useGlobalStyles } from '../../../assets/styles'
import { OverlayProps } from './interfaces'

export const Overlay: React.FC<OverlayProps> = ({isOpen, text}) => {
  const classes = useGlobalStyles()

  return (
    <Portal>
      <Backdrop className={classes.backdrop} open={isOpen}>
        <div className={classes.backdropText}>{text}</div>
        <GlobalidLoader className={classes.backdropSpinner}/>
      </Backdrop>
    </Portal>
  )
}
