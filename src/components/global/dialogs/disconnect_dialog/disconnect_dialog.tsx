import { StyledDialog } from '../styled_dialog'
import React from 'react'
import { useStyles } from './style'
import { DialogProps } from '../interfaces'
import { signOut, getString } from '../../../../utils'
import { PrimaryButton, ButtonState } from 'globalid-react-ui'
import { RedirectOnSignOut } from '../../../../utils/interfaces'
import { useDispatch } from 'react-redux'
import { ThunkDispatch } from '../../../../store'

export const DisconnectDialog: React.FC<DialogProps> = ({
  open,
  handleOpenState,
}: DialogProps) => {
  const classes = useStyles()
  const {
    disconnectQuestion,
    disconnectInfo,
    disconnectButtonWrapper,
    buttonText,
  } = classes

  const dispatch: ThunkDispatch = useDispatch()

  return (
    <StyledDialog
      open={open}
      handleOpenState={handleOpenState}
      name='disconnect'
    >
      <div>
        <div className={disconnectQuestion}>
          {getString('disconnect-title')}
        </div>
        <div className={disconnectInfo}>
          {getString('disconnect-description')}
        </div>
        <div className={disconnectButtonWrapper}>
          <PrimaryButton buttonState={ButtonState.DEFAULT} onClick={async () => signOut(dispatch, RedirectOnSignOut.LANDING_PAGE)}>
            <span className={buttonText}>{getString('disconnect-message-action')}</span>
          </PrimaryButton>
        </div>
      </div>
    </StyledDialog>
  )
}
