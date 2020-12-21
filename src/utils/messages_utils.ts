import { AxiosError } from 'axios'
import { setToastError } from 'globalid-react-ui'
import _ from 'lodash'
import { getValidToken } from '../components/auth'
import { toastHandler } from '../components/messages/messenger_chat/chat_message_cards/helpers'
import {
  createImageData,
  createImagePayload,
  createMessageData,
} from '../components/messages/messenger_chat/message_input/helpers'
import { MAX_IMAGE_RESOLUTION_HEIGHT, MAX_IMAGE_RESOLUTION_WIDTH, NetworkError } from '../constants'
import { createMessagePayload } from '../services/api'
import { uploadImage } from '../services/api/file_service_api'
import { ResendMessageMeta } from '../services/api/interfaces'
import { store } from '../store'
import { addChannelMessage, setFailedChannelMessage } from '../store/messages_slice'
import {
  AddMessageBody,
  AddMessagePayload, MediaAsset,
  Message, MessageContent, MessageTemplateEncryptedText, MessageTemplateText,
  sendMessage,
} from '@globalid/messaging-service-sdk'
import { MessageData } from '../store/interfaces'
import {
  getToastContentForNetworkException,
  isNetworkErrorType,
  loadFile,
  scaleToFitImage,
  validateObjectKeys,
} from './general_utils'
import { v4 } from 'uuid'
import { MessageType } from '../components/messages/messenger_chat/interfaces'
import { deviceKeyManager } from '../init'

export const dispatchFailedChannelMessage = (channelId: string, imageValue: { uuid: string }): void => {
  store.dispatch(setFailedChannelMessage({
    key: channelId,
    value: {
      uuid: imageValue.uuid,
    },
  }))
}

export const storeMessage = (key: string, value: MessageData, resendingMeta?: ResendMessageMeta): void => {
  if (resendingMeta === undefined || !resendingMeta.resending) {
    store.dispatch(addChannelMessage({
      key,
      value,
    }))
  }
}

export const sendMessageToChannel = async (
  newMessage: string,
  channelId: string,
  gid_uuid: string,
  resendingMeta?: ResendMessageMeta,
  encryptedChannelSecret?: string,
): Promise<boolean> => {
  const token: string = await getValidToken()

  const messageValue: MessageData =
    createMessageData(newMessage, channelId, gid_uuid, resendingMeta, encryptedChannelSecret)

  storeMessage(channelId, messageValue, resendingMeta)

  try {

    const messagePayload: AddMessagePayload =
      await createMessagePayload(newMessage, messageValue.uuid, encryptedChannelSecret)

    const messageBody: AddMessageBody = {
      message: messagePayload,
      channels: [channelId],
    }

    const sentMessage: Message[] = await sendMessage(token, messageBody)

    if (_.isEmpty(sentMessage)) {
      throw new Error('Error sending message')
    }

  } catch (error) {
    handleIfNetworkError(error)
    store.dispatch(setFailedChannelMessage({
      key: channelId,
      value: {
        uuid: messageValue.uuid,
      },
    }))

    return false

  }

  return true
}
// eslint-disable-next-line max-lines-per-function
export const sendImageToChannel = async (
  image: File,
  channelId: string,
  gid_uuid: string,
  resendingMeta?: ResendMessageMeta,
): Promise<string | undefined> => {
  const token: string = await getValidToken()

  const imageBase64: string = await loadFile(image)

  const assetUuid: string = v4()

  const imageValue: MessageData =
    createImageData(assetUuid, imageBase64, channelId, gid_uuid, resendingMeta)

  storeMessage(channelId, imageValue, resendingMeta)
  try {

    const scaledImage: File = await scaleToFitImage(image, MAX_IMAGE_RESOLUTION_WIDTH, MAX_IMAGE_RESOLUTION_HEIGHT)

    const asset: MediaAsset = await uploadImage(assetUuid, channelId, scaledImage)

    const imagePayload: AddMessagePayload =
      createImagePayload(asset, imageValue.uuid)

    const messageBody: AddMessageBody = {
      message: imagePayload,
      channels: [channelId],
    }

    const sentMessages: Message[] = await sendMessage(token, messageBody)

    if (_.isEmpty(sentMessages)) {
      throw new Error('Error sending message')
    }
    const sentMessage: MessageData = {
      ...sentMessages[0],
      parsedContent: null,
      errored: false,
    }

    storeMessage(channelId, sentMessage)
  } catch (error) {
    handleIfNetworkError(error)
    dispatchFailedChannelMessage(channelId, imageValue)

    return undefined
  }

  return assetUuid
}

const handleIfNetworkError = (error: AxiosError): void => {
  const networkErrorResponse = error.response?.data

  if (isNetworkErrorType(networkErrorResponse)) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const { title, message } = getToastContentForNetworkException(<NetworkError> networkErrorResponse.message)

    toastHandler(
      store.dispatch,
      setToastError,
      title ?? '',
      message,
    )
  }
}

const textMessageContentValidationKeys: string[] = ['text']

export const getMessageContent = (message: MessageContent): MessageTemplateText | null => {
  try {
    const parsedContent: MessageTemplateText = JSON.parse(message.content)

    validateObjectKeys(parsedContent, textMessageContentValidationKeys)

    return parsedContent
  } catch (error) {
    return null
  }
}

const encryptedTextMessageContentValidationKeys: string[] = ['ciphertext', 'encryption_header']

export const getEncryptedMessageContent = (message: MessageContent): MessageTemplateEncryptedText | null => {
  try {
    const parsedContent: MessageTemplateEncryptedText = JSON.parse(message.content)

    validateObjectKeys(parsedContent, encryptedTextMessageContentValidationKeys)

    return parsedContent
  } catch (error) {
    return null
  }
}

export const getMessageCardContent = async (
  message: MessageContent,
  encryptedChannelSecret?: string
): Promise<string | null> => {
  try {
    if (encryptedChannelSecret !== undefined && message.type === MessageType.ENCRYPTED_TEXT) {
      const encryptedContent: MessageTemplateEncryptedText | null = getEncryptedMessageContent(message)

      const decryptedContentText: string | null = (encryptedContent === null) ? null :
        await deviceKeyManager.decrypt(encryptedChannelSecret, encryptedContent)

      return decryptedContentText
    }

    if (message.type === MessageType.TEXT || message.type === MessageType.DELETED || message.type === MessageType.SYSTEM) {
      const content: MessageTemplateText | null = getMessageContent(message)

      const contentText: string | null = (content === null) ? null : content.text

      return contentText
    }

    return null
  } catch (error) {
    return null
  }
}
