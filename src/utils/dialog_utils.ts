import { FileToken, MediaAsset, EncryptedMediaAsset, MessageEncryptionHeader } from '@globalid/messaging-service-sdk'
import { getPrettyTimestamp, getImageFromAws } from '.'
import { setFullImageView } from '../store/image_slice'
import { Dispatch } from '@reduxjs/toolkit'
import { MessageData } from '../store/interfaces'
import { retrieveMediumThumbnail, retrieveOriginalMedia, retrieveEncryptedMediumThumbnail, retrieveEncryptedOriginalMedia } from '../components/messages/messenger_chat/chat_message_cards/image_media_helpers'

export const handleFullImageOpen = (
  message: MessageData,
  asset: MediaAsset | null,
  fileToken: FileToken,
  dispatcher: Dispatch,
): void => {

  const timestamp: string = getPrettyTimestamp(message.created_at)

  const imageThumbnail: string | null = retrieveMediumThumbnail(asset)
  const imageOriginal: string | null = retrieveOriginalMedia(asset)

  if (imageThumbnail === null || imageOriginal === null) {
    return
  }

  dispatcher(setFullImageView({
    title: timestamp,
    thumbnail: getImageFromAws(imageThumbnail, fileToken),
    original: getImageFromAws(imageOriginal, fileToken),
  }))
}

export const handleFullEncryptedImageOpen = async (
  message: MessageData,
  asset: EncryptedMediaAsset | null,
  encryptedChannelSecret: string,
  encryptionHeader: MessageEncryptionHeader,
  fileToken: FileToken,
  dispatcher: Dispatch,
): Promise<void> => {

  const timestamp: string = getPrettyTimestamp(message.created_at)

  const imageThumbnail: string | null = await retrieveEncryptedMediumThumbnail(
    asset,
    encryptedChannelSecret,
    encryptionHeader
  )
  const imageOriginal: string | null = await retrieveEncryptedOriginalMedia(
    asset,
    encryptedChannelSecret,
    encryptionHeader
  )

  if (imageThumbnail === null || imageOriginal === null) {
    return
  }

  dispatcher(setFullImageView({
    title: timestamp,
    thumbnail: getImageFromAws(imageThumbnail, fileToken),
    original: getImageFromAws(imageOriginal, fileToken),
  }))
}
