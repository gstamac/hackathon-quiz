import React from 'react'
import { titleStyles, contentStyles, actionStyles, dialogStyles } from './style'
import { StyledDialogProps } from '../interfaces'
import { CloseButton } from '../../buttons'
import { AppStoreButtons } from '../../buttons/app_store_buttons'
import MuiDialogActions from '@material-ui/core/DialogActions'
import MuiDialogContent from '@material-ui/core/DialogContent'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import MuiDialog from '@material-ui/core/Dialog'
import { PrimaryButton, ButtonState } from 'globalid-react-ui'
import { useIsMobileView } from '../../helpers'

export const StyledDialog: React.FC<StyledDialogProps> = (
  props: StyledDialogProps,
) => {
  const {
    open,
    handleOpenState,
    handleClick,
    actionText,
    name,
    children,
    className,
  } = props

  const isMobile: boolean = useIsMobileView()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const DialogTitle = titleStyles(MuiDialogTitle)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const DialogContent = contentStyles(MuiDialogContent)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const DialogActions = actionStyles(MuiDialogActions)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Dialog = dialogStyles(MuiDialog)

  return (
    <Dialog open={open} onClose={handleOpenState} fullScreen={isMobile}>
      <DialogTitle>
        <CloseButton handleClick={handleOpenState} />
      </DialogTitle>
      <DialogContent className={className} dividers={false}>{children}</DialogContent>
      {!(name === 'disconnect') ? (
        <DialogActions>
          {name === 'get-app' ? (
            <AppStoreButtons />
          ) : (
            <PrimaryButton buttonState={ButtonState.DEFAULT} onClick={handleClick}>
              {actionText}
            </PrimaryButton>
          )}
        </DialogActions>
      ) : null}
    </Dialog>
  )
}
