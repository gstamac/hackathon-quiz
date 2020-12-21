import { isEmpty } from 'lodash'
import {
  UseImageMessageCardHooksResponse,
  UseImageMessageCardHooksProps,
  GetMediaByTypeParams,
  MediaAssets,
  MessageMediaType,
} from './interfaces'
import { useState, useCallback } from 'react'
import { MessageType } from '../interfaces'
import { getMediaDataSetter, getReplaceMediaAssets } from './image_media_helpers'
import { useGetMediaDataByType } from './use_get_media_data_by_type'

export const useImageMessageCard = ({
  message,
  isMessageMine,
  encryptedChannelSecret,
  renderAvatar,
}: UseImageMessageCardHooksProps): UseImageMessageCardHooksResponse => {

  const type: MessageMediaType = <MessageMediaType> message.type

  const messageHasText = useCallback((): boolean =>
    (type === MessageType.MEDIA_WITH_TEXT &&
      JSON.parse(message.content).text !== undefined &&
      !isEmpty(JSON.parse(message.content).text.trim())
    ) || (
      (type === MessageType.MEDIA_WITH_ENCRYPTED_TEXT || type === MessageType.ENCRYPTED_MEDIA) &&
      JSON.parse(message.content).text.ciphertext !== undefined
    ), [message.content, type])

  const isTextEncrypted: boolean = type === MessageType.MEDIA_WITH_ENCRYPTED_TEXT || type === MessageType.ENCRYPTED_MEDIA
  const isMediaEncrypted: boolean = type === MessageType.ENCRYPTED_MEDIA
  const hasText: boolean = messageHasText()

  const [mediaAssets, setMediaAssets] = useState<MediaAssets>({})

  const params: GetMediaByTypeParams = {
    message,
    type,
    renderAvatar,
    mediaAssets,
    isMessageMine,
    isTextEncrypted,
    isMediaEncrypted,
    hasText,
    encryptedChannelSecret,
    setMediaData: getMediaDataSetter(setMediaAssets),
    replaceMediaAssets: getReplaceMediaAssets(setMediaAssets),
  }

  return useGetMediaDataByType(params)
}

