import React from 'react'
import { Dialog as GlobaliDDialog, PrimaryButton, ButtonState } from 'globalid-react-ui'
import { getString } from '../../../../utils'
import { useStyles } from './styles'
import { DeleteMessageDialogProps } from './interfaces'
import { getConversationTypeFromUrl } from '../chat_message_cards/helpers'
import { useRouteMatch } from 'react-router-dom'

export const DeleteMessageDialog: React.FC<DeleteMessageDialogProps> = ({ handleDelete, open, onExit }: DeleteMessageDialogProps) => {

  const classes = useStyles()
  const { deleteMessageTitle, deleteMessageDescription, buttonText, dialogWrapper } = classes
  const match = useRouteMatch<{ type: string }>()

  const title: string = getConversationTypeFromUrl(match)

  return (
    <GlobaliDDialog
      title={title}
      onExit={onExit}
      open={open}>

      <div className={dialogWrapper}>
        <span className={deleteMessageTitle}>{getString('delete-message-title')}</span>
        <span className={deleteMessageDescription}>{getString('delete-message-description')}</span>
        <div>
          <PrimaryButton buttonState={ButtonState.DEFAULT} onClick={handleDelete}>
            <span className={buttonText}>{getString('delete-message-action')}</span>
          </PrimaryButton>
        </div>
      </div>
    </GlobaliDDialog>
  )
}
