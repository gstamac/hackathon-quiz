import { useImageMessageCard } from './use_image_message_card'
import { cleanup } from '@testing-library/react-hooks'
import {
  messageDownloadImageMock,
  messageMediaMock,
  messageMediaWithTextMock,
  messageEncryptedMediaMock,
  messageMediaWithEncryptedTextMock,
} from '../../../../../tests/mocks/messages_mock'
import { UseImageMessageCardHooksProps, UseImageMessageCardHooksResponse } from './interfaces'
import { TestCustomHookType, testCustomHook } from '../../../../../tests/test_utils'
import { MessageType } from '../interfaces'
import { encryptedChannelSecretMock } from '../../../../../tests/mocks/device_key_manager_mocks'
import * as hooks from './use_get_media_data_by_type'
import * as mediaHelpers from './image_media_helpers'

jest.mock('./use_get_media_data_by_type')
jest.mock('./image_media_helpers')

const encryptedChannelSecret: string = encryptedChannelSecretMock

const defaultParams: UseImageMessageCardHooksProps = {
  message: messageDownloadImageMock,
  type: MessageType.MEDIA,
  isMessageMine: true,
  encryptedChannelSecret,
}

const getHookResult: TestCustomHookType<UseImageMessageCardHooksProps, UseImageMessageCardHooksResponse> = (
  testCustomHook(useImageMessageCard, defaultParams, {})
)

describe('Use Image Message Card Hooks', () => {

  const useGetMediaDataByTypeMock: jest.Mock = jest.fn()
  const getMediaDataSetterMock: jest.Mock = jest.fn()
  const getReplaceMediaAssetsMock: jest.Mock = jest.fn()

  const setMediaData: jest.Mock = jest.fn()
  const replaceMediaAssets: jest.Mock = jest.fn()

  beforeEach(() => {
    (<jest.Mock> hooks.useGetMediaDataByType) = useGetMediaDataByTypeMock;
    (<jest.Mock> mediaHelpers.getMediaDataSetter) = getMediaDataSetterMock.mockReturnValue(setMediaData);
    (<jest.Mock> mediaHelpers.getReplaceMediaAssets) = getReplaceMediaAssetsMock.mockReturnValue(replaceMediaAssets)
  })

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  it('should call useGetMediaDataByType hooks with params for unencrypted media without text when message type is MEDIA', async () => {
    await getHookResult({ ...defaultParams, message: messageMediaMock })

    expect(useGetMediaDataByTypeMock).toHaveBeenCalledTimes(1)
    expect(useGetMediaDataByTypeMock).toHaveBeenCalledWith({
      message: messageMediaMock,
      type: MessageType.MEDIA,
      mediaAssets: {},
      isMessageMine: true,
      isTextEncrypted: false,
      isMediaEncrypted: false,
      hasText: false,
      encryptedChannelSecret,
      setMediaData,
      replaceMediaAssets,
    })
  })

  it('should call useGetMediaDataByType hooks with params for unencrypted media with text when message type is MEDIA_WITH_TEXT', async () => {
    await getHookResult({ ...defaultParams, message: messageMediaWithTextMock })

    expect(useGetMediaDataByTypeMock).toHaveBeenCalledTimes(1)
    expect(useGetMediaDataByTypeMock).toHaveBeenCalledWith({
      message: messageMediaWithTextMock,
      type: MessageType.MEDIA_WITH_TEXT,
      mediaAssets: {},
      isMessageMine: true,
      isTextEncrypted: false,
      isMediaEncrypted: false,
      hasText: true,
      encryptedChannelSecret,
      setMediaData,
      replaceMediaAssets,
    })
  })

  it('should call useGetMediaDataByType hooks with params for unencrypted media with encrypted text when message type is MEDIA_WITH_ENCRYPTED_TEXT', async () => {
    await getHookResult({ ...defaultParams, message: messageMediaWithEncryptedTextMock })

    expect(useGetMediaDataByTypeMock).toHaveBeenCalledTimes(1)
    expect(useGetMediaDataByTypeMock).toHaveBeenCalledWith({
      message: messageMediaWithEncryptedTextMock,
      type: MessageType.MEDIA_WITH_ENCRYPTED_TEXT,
      mediaAssets: {},
      isMessageMine: true,
      isTextEncrypted: true,
      isMediaEncrypted: false,
      hasText: true,
      encryptedChannelSecret,
      setMediaData,
      replaceMediaAssets,
    })
  })

  it('should call useGetMediaDataByType hooks with params for encrypted media with encrypted text when message type is ENCRYPTED_MEDIA', async () => {
    await getHookResult({ ...defaultParams, message: messageEncryptedMediaMock })

    expect(useGetMediaDataByTypeMock).toHaveBeenCalledTimes(1)
    expect(useGetMediaDataByTypeMock).toHaveBeenCalledWith({
      message: messageEncryptedMediaMock,
      type: MessageType.ENCRYPTED_MEDIA,
      mediaAssets: {},
      isMessageMine: true,
      isTextEncrypted: true,
      isMediaEncrypted: true,
      hasText: true,
      encryptedChannelSecret,
      setMediaData,
      replaceMediaAssets,
    })
  })
})

