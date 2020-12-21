import { ButtonState, Dialog as GlobaliDDialog, PrimaryButton } from 'globalid-react-ui'
import React from 'react'
import { getString } from '../../../../utils'
import { LeaveChannelDialogProps } from './interfaces'
import { useStyles } from './styles'

export const LeaveChannelDialog: React.FC<LeaveChannelDialogProps> = ({ handleLeaveChannel, open, onExit, inProgress }: LeaveChannelDialogProps) => {
  const classes = useStyles()
  const { leaveChannelTitle, leaveChannelDescription, buttonText, dialogWrapper } = classes

  const buttonState: ButtonState = inProgress ? ButtonState.INPROGRESS : ButtonState.DEFAULT

  return (
    <GlobaliDDialog
      title={getString('leave-channel-header-title')}
      onExit={onExit}
      open={open}>
      <div className={dialogWrapper}>
        <span className={leaveChannelTitle}>{getString('leave-channel-title')}</span>
        <span className={leaveChannelDescription}>{getString('leave-channel-description')}</span>
        <div>
          <PrimaryButton buttonState={buttonState} onClick={handleLeaveChannel}>
            <span className={buttonText}>{getString('leave-channel-action')}</span>
          </PrimaryButton>
        </div>
      </div>
    </GlobaliDDialog>
  )
}

