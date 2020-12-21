import React, { useState, useRef } from 'react'
import { sendMessageToChannel } from '../../../../utils/messages_utils'
import { useStyles } from './styles'
import { QuickMenuItemProps } from '../../../global/quick_menu/interfaces'
import { OptionsIcon } from '../../../global/icons/options_icon'
import { getString } from '../../../../utils'
import { toastHandler } from './helpers'
import { deleteMessageFromChannel } from '../../../../services/api/messaging_api'
import { MessageData } from '../../../../store/interfaces'
import { QuickMenu } from '../../../global/quick_menu'
import { DeleteMessageDialog } from '../delete_message'
import { CircularProgress } from '@material-ui/core'
import { TrashIcon } from '../../../global/icons/trash_icon'
import { Dispatch } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { setToastSuccess, setToastError } from 'globalid-react-ui'
import { CommonImageMediaType, MessageStateHookResult } from '.'
import { MessageType } from '../interfaces'
import { deleteImageAsset } from '../../../../services/api/file_service_api'
import { getParsedImageMessageContent } from './image_media_helpers'
import { MediaAsset } from '@globalid/messaging-service-sdk/interfaces'

export interface MessageStateHooksProps {
  iAmAuthor: boolean
  message: MessageData
  encryptedChannelSecret?: string
  isHiddenMember?: boolean
  hasOptions?: boolean
}

export interface MessageStateHooksResponse {
  resendingMessage: boolean
  optionsIcon: JSX.Element | null
  resendingCircularProgress: JSX.Element | null
  quickMenu: JSX.Element
  deleteMessageDialog: JSX.Element
  resendMessage: (() => Promise<void>) | undefined
  showUserSettingsIcon(): void
  hideUserSettingsIcon(): void
}

// eslint-disable-next-line complexity
export const useMessageState = ({
  iAmAuthor,
  message,
  encryptedChannelSecret,
  isHiddenMember,
  hasOptions,
} : MessageStateHooksProps): MessageStateHookResult => {

  const [resendingMessage, setResendingMessage] = useState<boolean>(false)
  const [showSettingsIcon, setShowSettingsIcon] = useState<boolean>(false)
  const [messageSettingsOpen, setMessageSettingsOpen] = useState<boolean>(false)
  const [deleteMessageDialogOpen, setDeleteMessageDialogOpen] = useState<boolean>(false)

  const settingsIconElement: React.MutableRefObject<HTMLImageElement | null> = useRef<HTMLImageElement>(null)

  const dispatcher: Dispatch = useDispatch()

  const messageSettingsItems: QuickMenuItemProps[] | undefined = !isHiddenMember ? [
    {
      id: 'delete-message',
      text: getString('delete-message-title'),
      icon: TrashIcon(),
      onClick: () => openDeleteMessageDialog(),
    },
  ] : undefined

  const classes = useStyles({
    me: iAmAuthor,
    deleted: message.deleted,
    errorAdornment: message.errored,
    resending: resendingMessage,
  })

  const deleteMessageAssets = async (): Promise<void> => {
    if (message.type !== MessageType.MEDIA) {
      return
    }
    const parsedMessageContent: CommonImageMediaType | null = getParsedImageMessageContent(message.content)

    if (parsedMessageContent === null || !parsedMessageContent?.assets?.length) {
      return
    }

    const assets: MediaAsset[] = parsedMessageContent.assets as MediaAsset[]

    await Promise.all(assets.map(
      async (asset: MediaAsset): Promise<void> => deleteImageAsset(asset.uuid))
    )
  }

  const deleteMessage = async (message_id: string): Promise<void> => {
    try {
      const response = await deleteMessageFromChannel([message_id])

      await deleteMessageAssets()

      if (response.length > 0) {
        toastHandler(dispatcher, setToastSuccess, getString('delete-message-success-title'), getString('delete-message-success-description'))
      } else {
        toastHandler(dispatcher, setToastError, getString('delete-message-error-title'), getString('delete-message-error-description'))
      }

      closeDeleteMessageDialog()
    } catch (error) {
      toastHandler(dispatcher, setToastError, getString('delete-message-error-title'), getString('delete-message-error-description'))
      closeDeleteMessageDialog()
    }
  }

  const hideUserSettingsIcon = (): void => {
    setShowSettingsIcon(false)
  }

  const showUserSettingsIcon = (): void => {
    if (!iAmAuthor || !hasOptions || resendingMessage) {
      return
    }
    setShowSettingsIcon(true)
  }

  const closeUserSettings = (): void => {
    setMessageSettingsOpen(false)
  }

  const openUserSettings = (): void => {
    setMessageSettingsOpen(true)
  }

  const closeDeleteMessageDialog = (): void => {
    setDeleteMessageDialogOpen(false)
  }

  const openDeleteMessageDialog = (): void => {
    hideUserSettingsIcon()
    closeUserSettings()
    setDeleteMessageDialogOpen(true)
  }

  const resendMessage = async (): Promise<void> => {
    hideUserSettingsIcon()
    setResendingMessage(true)

    await sendMessageToChannel(
      message.parsedContent as string,
      message.channel_id,
      message.author,
      {
        resending: true,
        uuid: message.uuid,
      },
      encryptedChannelSecret,
    )

    setResendingMessage(false)
  }

  const quickMenu: JSX.Element | null = hasOptions ? <QuickMenu
    compact={true}
    items={messageSettingsItems}
    open={messageSettingsOpen}
    cursorAt={settingsIconElement}
    onClose={closeUserSettings}
  />: null

  const deleteMessageDialog: JSX.Element | null = hasOptions ? <DeleteMessageDialog
    open={deleteMessageDialogOpen}
    handleDelete={async () => deleteMessage(message.id as string)}
    onExit={closeDeleteMessageDialog}
    title={'Delete'}
  />: null

  const resendingCircularProgress: JSX.Element | null = resendingMessage
    ? <div className={classes.progressWrapper}>
      <CircularProgress className={classes.circularProgress} size={25} thickness={6}/>
    </div>
    : null

  const optionsIcon: JSX.Element | null = ((showSettingsIcon || messageSettingsOpen) && message.id && !isHiddenMember)
    ? <div data-testid='settings' ref={settingsIconElement} className={classes.settingsIcon} onClick={openUserSettings}>
      {OptionsIcon()}
    </div>
    : null

  return {
    resendingMessage,
    showUserSettingsIcon,
    hideUserSettingsIcon,
    optionsIcon,
    resendingCircularProgress,
    resendMessage: message.errored && !resendingMessage ? resendMessage : undefined,
    quickMenu,
    deleteMessageDialog,
  }
}
