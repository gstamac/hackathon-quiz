import { InternalFormData, setToastError, setToastSuccess } from 'globalid-react-ui'
import { EditChannelDetails } from '../../global/dialogs/edit_channel_dialog/interfaces'
import { formValuesToValues, getString } from '../../../utils'
import { ChannelWithParticipants } from '@globalid/messaging-service-sdk'
import { updateChannel } from '../../../services/api/channels_api'
import { setChannel } from '../../../store/channels_slice/channels_slice'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { UpdateChannelHook, UpdateChannelHookProps } from './interfaces'

export const useChannelUpdate = ({ channelId }: UpdateChannelHookProps): UpdateChannelHook => {
  const dispatch = useDispatch()

  const [editChannelOpen, setEditChannelOpen] = useState<boolean>(false)

  const openChannelEditDialog = (): void => {
    if (editChannelOpen) {
      return
    }

    setEditChannelOpen(true)
  }

  const closeChannelEditDialog = (): void => {
    if (!editChannelOpen) {
      return
    }

    setEditChannelOpen(false)
  }

  const onChannelUpdate
    = async (formData: InternalFormData): Promise<void> => {
      const props: EditChannelDetails = formValuesToValues(formData.values)

      try {
        setEditChannelOpen(false)

        const updatedChannel: ChannelWithParticipants = await updateChannel(channelId, {
          ...props,
          title: props.title === '' ? null : props.title,
        })

        dispatch(setChannel(updatedChannel))

        dispatch(setToastSuccess({
          title: getString('edit-conversation-dialog-success-title'),
          message: getString('edit-conversation-dialog-success-description'),
        }))
      } catch (error) {
        dispatch(setToastError({
          title: getString('edit-conversation-dialog-failure-title'),
          message: getString('something-went-wrong'),
        }))
      }
    }

  return {
    onChannelUpdate,
    openChannelEditDialog,
    closeChannelEditDialog,
    editChannelOpen,
  }
}
