import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Dispatch } from '@reduxjs/toolkit'
import { LeaveChannelResponse } from '@globalid/messaging-service-sdk'
import { leaveFromChannel } from '../../../../services/api/channels_api'
import { toastHandler } from '../../messenger_chat/chat_message_cards/helpers'
import { setToastError, setToastSuccess } from 'globalid-react-ui'
import { getString } from '../../../../utils'
import { LeaveChannelHook, LeaveChannelHookProps } from './interfaces'

export const useLeaveConversationHook = ({ channelId }: LeaveChannelHookProps): LeaveChannelHook => {

  const [leaveChannelDialogOpen, setLeaveChannelDialogOpen] = useState<boolean>(false)
  const [leaveChannelInProgress, setLeaveChannelInProgress] = useState<boolean>(false)

  const dispatch: Dispatch = useDispatch()

  const closeLeaveChannelDialog = (): void => {
    setLeaveChannelDialogOpen(false)
  }

  const openLeaveChannelDialog = (): void => {
    setLeaveChannelDialogOpen(true)
  }

  const handleLeaveChannel = async (): Promise<void> => {
    setLeaveChannelInProgress(true)

    try {
      const response: LeaveChannelResponse = await leaveFromChannel(channelId)

      if (response.deleted) {
        toastHandler(dispatch, setToastSuccess, getString('leave-channel-success-title'), getString('leave-channel-success-description'))
      } else {
        toastHandler(dispatch, setToastError, getString('leave-channel-error-title'), getString('leave-channel-error-description'))
      }
    } catch (error) {
      toastHandler(dispatch, setToastError, getString('leave-channel-error-title'), getString('leave-channel-error-description'))
    }

    setLeaveChannelInProgress(false)
    closeLeaveChannelDialog()
  }

  return {
    handleLeaveChannel,
    openLeaveChannelDialog,
    leaveChannelDialogOpen,
    leaveChannelInProgress,
    closeLeaveChannelDialog,
  }
}
