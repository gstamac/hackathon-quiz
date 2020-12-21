import { setToastError } from 'globalid-react-ui'
import React, { useState } from 'react'
import { Dialog } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import CloseIconLink from '../../../../assets/icons/close-white-icon.svg'
import { getString } from '../../../../utils'
import { GlobalidLoader } from '../../../global/loading'
import { FullImageDialogProps } from './interfaces'
import { useStyles } from './styles'
import clsx from 'clsx'

export const FullImageDialog: React.FC<FullImageDialogProps> = (
  { open, title, thumbnail, original, onExit }: FullImageDialogProps) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [isOriginalImageLoaded, setOriginalImageLoaded] = useState<boolean>(false)

  const closeDialogAndTriggerErrorToaster = (): void => {
    onExit()
    dispatch(setToastError({
      title: getString('messages-full-image-toast-error-title'),
      message: getString('messages-full-image-toast-error-message'),
    }))
  }

  const handleOriginalImageLoad = (): void => {
    setOriginalImageLoaded(true)
  }

  return (
    <Dialog
      open={open}
      classes={{ paper: classes.dialogPaper }}
      className={classes.imageDialog}
      fullScreen={true}
      fullWidth={true}
      onClose={onExit}
    >
      <div className={classes.imageHeader}>
        <span className={classes.imageTitle}>{title}</span>
        <img
          className={classes.icon}
          src={CloseIconLink}
          onClick={onExit}
          alt={'close'}
        />
      </div>
      <div className={classes.imageContainer} onClick={onExit}>
        <div className={classes.imageBackground} onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event.stopPropagation()}
          data-testid={'image-background'}>
          {!isOriginalImageLoaded && <img
            className={clsx(classes.image, classes.imageThumbnail)}
            src={thumbnail}
            alt={'thumbnail'}
            onError={closeDialogAndTriggerErrorToaster}
          />}
          <img
            className={clsx(
              classes.image,
              isOriginalImageLoaded ? classes.noOpacity : classes.displayNone
            )}
            src={original}
            alt={'original'}
            onLoad={handleOriginalImageLoad}
            onError={closeDialogAndTriggerErrorToaster}
          />
          {!isOriginalImageLoaded && <div className={classes.imageLoader}>
            <GlobalidLoader/>
          </div>}
        </div>
      </div>
    </Dialog>
  )
}
