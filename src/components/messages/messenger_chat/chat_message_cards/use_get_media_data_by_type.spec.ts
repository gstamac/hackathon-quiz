import { cleanup, HookResult } from '@testing-library/react-hooks'
import {
  messageMediaMock,
  assetImageMock,
  assetEncryptedImageMock,
} from '../../../../../tests/mocks/messages_mock'
import { UseImageMessageCardHooksResponse, GetMediaByTypeParams, MediaListViewType, MediaAssets, ImageState, MediaAssetParsedData } from './interfaces'
import { TestCustomHookType, testCustomHook, actHook } from '../../../../../tests/test_utils'
import { MessageType } from '../interfaces'
import { encryptedChannelSecretMock } from '../../../../../tests/mocks/device_key_manager_mocks'
import * as mediaHelpers from './image_media_helpers'
import * as dialogUtils from '../../../../utils/dialog_utils'
import * as messagesUtils from '../../../../utils/messages_utils'
import { useGetMediaDataByType } from './use_get_media_data_by_type'
import { fileTokenMock } from '../../../../../tests/mocks/channels_mock'
import { store } from '../../../../store'
import { setFileToken } from '../../../../store/channels_slice/channels_slice'
import { MessageEncryptionHeader } from '@globalid/messaging-service-sdk'

jest.mock('../../../../utils/dialog_utils')
jest.mock('../../../../utils/messages_utils')
jest.mock('./image_media_helpers')

describe('Use get media data by type Hooks', () => {

  const getParsedImageMessageContent: jest.Mock = jest.fn()
  const getImageMessageTemplateContent: jest.Mock = jest.fn()
  const getMediaText: jest.Mock = jest.fn()
  const getStylesWrapperProps: jest.Mock = jest.fn()
  const retrieveImageFile: jest.Mock = jest.fn()
  const getImageComponentState: jest.Mock = jest.fn()
  const getImagesCount: jest.Mock = jest.fn()
  const getAssetByUuid: jest.Mock = jest.fn()
  const getMediaErrorAdornment: jest.Mock = jest.fn()
  const getDownloadImageHandler: jest.Mock = jest.fn()

  const sendImageToChannel: jest.Mock = jest.fn()

  const handleFullImageOpen: jest.Mock = jest.fn()
  const handleFullEncryptedImageOpen: jest.Mock = jest.fn()

  const setMediaData: jest.Mock = jest.fn()
  const replaceMediaAssets: jest.Mock = jest.fn()
  const handleDownloadImage: jest.Mock = jest.fn()

  const encryptedChannelSecret: string = encryptedChannelSecretMock

  const defaultParams: GetMediaByTypeParams = {
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
  }

  beforeAll(() => {
    store.dispatch(setFileToken({
      key: messageMediaMock.channel_id,
      value: fileTokenMock,
    }))
  })

  beforeEach(() => {
    (<jest.Mock> mediaHelpers.getParsedImageMessageContent) = getParsedImageMessageContent;
    (<jest.Mock> mediaHelpers.getImageMessageTemplateContent) = getImageMessageTemplateContent;
    (<jest.Mock> mediaHelpers.getMediaText) = getMediaText;
    (<jest.Mock> mediaHelpers.getStylesWrapperProps) = getStylesWrapperProps;
    (<jest.Mock> mediaHelpers.retrieveImageFile) = retrieveImageFile;
    (<jest.Mock> mediaHelpers.getImageComponentState) = getImageComponentState;
    (<jest.Mock> mediaHelpers.getImagesCount) = getImagesCount;
    (<jest.Mock> mediaHelpers.getAssetByUuid) = getAssetByUuid;
    (<jest.Mock> mediaHelpers.getMediaErrorAdornment) = getMediaErrorAdornment;
    (<jest.Mock> mediaHelpers.getDownloadImageHandler) = getDownloadImageHandler.mockReturnValue(handleDownloadImage);

    (<jest.Mock> dialogUtils.handleFullImageOpen) = handleFullImageOpen;
    (<jest.Mock> dialogUtils.handleFullEncryptedImageOpen) = handleFullEncryptedImageOpen;

    (<jest.Mock> messagesUtils.sendImageToChannel) = sendImageToChannel

    getParsedImageMessageContent.mockReturnValue(parsedMessageContent)
    getImageMessageTemplateContent.mockReturnValue(null)
    getImagesCount.mockReturnValue(1)
  })

  const encryptionHeader: MessageEncryptionHeader = {
    enc: 'enc',
    iv: 'iv',
  }

  const parsedMessageContent: object = {
    text: 'text',
    ciphertext: 'ciphertext',
    list_view_type: MediaListViewType.Vertical,
    assets: [assetImageMock],
    encryption_header: encryptionHeader,
  }

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  describe('MEDIA', () => {
    const assetUuid: string = assetImageMock.uuid

    const mediaAssetParsed: MediaAssetParsedData = {
      index: 0,
      imageState: ImageState.LOADING,
      mediaAsset: assetImageMock,
      encryptedMediaAsset: assetEncryptedImageMock,
    }

    const mediaAssets: MediaAssets = {
      [assetUuid]: mediaAssetParsed,
    }

    const defaultParamsByType: GetMediaByTypeParams = {
      ...defaultParams,
      message: messageMediaMock,
      type: MessageType.MEDIA,
      isMessageMine: true,
      isTextEncrypted: false,
      isMediaEncrypted: false,
      hasText: false,
    }

    const getHookResult: TestCustomHookType<GetMediaByTypeParams, UseImageMessageCardHooksResponse> = (
      testCustomHook(useGetMediaDataByType, defaultParamsByType, {})
    )

    it('should download image on load, when there is one image asset', async () => {

      await getHookResult({})

      expect(getParsedImageMessageContent).toHaveBeenCalledTimes(1)
      expect(getImageMessageTemplateContent).toHaveBeenCalledTimes(1)
      expect(getImagesCount).toHaveBeenCalledTimes(1)
      expect(getImageComponentState).toHaveBeenCalledTimes(1)

      expect(handleDownloadImage).toHaveBeenCalledTimes(1)
    })

    it('should download multiple images on load, when there is more than one image asset', async () => {
      getParsedImageMessageContent.mockReturnValue({ ...parsedMessageContent, assets: [assetImageMock, assetImageMock]})
      getImageMessageTemplateContent.mockReturnValue(null)
      getImagesCount.mockReturnValue(2)

      await getHookResult({})

      expect(getParsedImageMessageContent).toHaveBeenCalledTimes(1)
      expect(getImageMessageTemplateContent).toHaveBeenCalledTimes(1)
      expect(getImagesCount).toHaveBeenCalledTimes(1)

      expect(handleDownloadImage).toHaveBeenCalledTimes(2)
    })

    it('should not update asset state when calling returned onDownloadErrorHandling callback if asset is not defined', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')

      const result: HookResult<UseImageMessageCardHooksResponse> = await getHookResult({})

      const onDownloadError = result.current.componentProps.downloadErrorHandling

      await actHook(() => {
        onDownloadError(assetUuid)
      })

      expect(setMediaData).toHaveBeenCalledTimes(0)
      expect(result.current.adornmentProps.errorMessage).toBeUndefined()
    })

    it('should update asset state when calling returned onDownloadErrorHandling callback', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')

      const result: HookResult<UseImageMessageCardHooksResponse> = await getHookResult({ mediaAssets })

      const onDownloadError = result.current.componentProps.downloadErrorHandling

      await actHook(() => {
        onDownloadError(assetUuid)
      })

      expect(setMediaData).toHaveBeenCalledTimes(1)
      expect(setMediaData).toHaveBeenCalledWith({
        assetUuid,
        index: 0,
        imageState: ImageState.ERROR,
      })
      expect(result.current.adornmentProps.errorMessage).toEqual('error message')
    })

    it('should not update asset state when calling returned onDownloadLoadedHandling callback if asset is not defined', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')

      const result: HookResult<UseImageMessageCardHooksResponse> = await getHookResult({})

      const onDownloadLoaded = result.current.componentProps.downloadLoadedHandling

      await actHook(() => {
        onDownloadLoaded(assetUuid)
      })

      expect(getStylesWrapperProps).toHaveBeenCalledTimes(0)
      expect(setMediaData).toHaveBeenCalledTimes(0)
      expect(result.current.adornmentProps.errorMessage).toBeUndefined()
    })

    it('should update asset state when calling returned onDownloadLoadedHandling callback', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')

      const result = await getHookResult({ mediaAssets })

      const onDownloadLoaded = result.current.componentProps.downloadLoadedHandling

      await actHook(() => {
        onDownloadLoaded(assetUuid)
      })

      expect(getStylesWrapperProps).toHaveBeenCalledTimes(1)
      expect(setMediaData).toHaveBeenCalledTimes(1)
      expect(setMediaData).toHaveBeenCalledWith({
        assetUuid,
        index: 0,
        imageState: ImageState.LOADED,
        stylesWrapperProps: undefined,
      })
      expect(result.current.adornmentProps.errorMessage).toEqual('error message')
    })

    it('should retry sending image when there is a sending error and user wants to retry (click on image) - error', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')
      sendImageToChannel.mockResolvedValue(undefined)

      const result = await getHookResult({ message: { ...messageMediaMock, errored: true, parsedContent: 'parsedContent' }, mediaAssets })

      const onRetry = result.current.componentProps.onRetry

      await actHook(async () => {
        await onRetry(assetUuid)
      })

      expect(retrieveImageFile).toHaveBeenCalledTimes(1)
      expect(retrieveImageFile).toHaveBeenCalledWith('parsedContent')
      expect(setMediaData).toHaveBeenCalledTimes(2)
      expect(setMediaData).toHaveBeenCalledWith({
        assetUuid,
        index: 0,
        imageState: ImageState.ERROR,
      })
      expect(sendImageToChannel).toHaveBeenCalledTimes(1)
      expect(result.current.adornmentProps.errorMessage).toEqual('error message')
    })

    it('should retry sending image when there is a sending error and user wants to retry (click on image) - success', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')
      sendImageToChannel.mockResolvedValue('newAssetUuid')

      const result = await getHookResult({ message: { ...messageMediaMock, errored: true, parsedContent: 'parsedContent' }, mediaAssets })

      const onRetry = result.current.componentProps.onRetry

      await actHook(async () => {
        await onRetry(assetUuid)
      })

      expect(retrieveImageFile).toHaveBeenCalledTimes(1)
      expect(retrieveImageFile).toHaveBeenCalledWith('parsedContent')
      expect(setMediaData).toHaveBeenCalledTimes(1)
      expect(replaceMediaAssets).toHaveBeenCalledTimes(1)
      expect(replaceMediaAssets).toHaveBeenCalledWith({
        oldAssetUuid: assetUuid,
        newAssetUuid: 'newAssetUuid',
      })
      expect(sendImageToChannel).toHaveBeenCalledTimes(1)
      expect(result.current.adornmentProps.errorMessage).toEqual('error message')
    })

    it('should download image when there is no sending error and user wants to retry (click on image)', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')
      sendImageToChannel.mockResolvedValue('newAssetUuid')
      getAssetByUuid.mockReturnValue({
        asset: assetImageMock,
        index: 0,
      })

      const result = await getHookResult({ message: { ...messageMediaMock, errored: false }, mediaAssets })

      const onRetry = result.current.componentProps.onRetry

      await actHook(async () => {
        await onRetry(assetUuid)
      })

      expect(setMediaData).toHaveBeenCalledTimes(1)
      expect(handleDownloadImage).toHaveBeenCalledTimes(2)
      expect(handleDownloadImage).toHaveBeenLastCalledWith(expect.any(Function), assetImageMock, 0)
      expect(sendImageToChannel).toHaveBeenCalledTimes(0)
    })

    it('should retry sending image when there is a sending error and user wants to retry (click on adornment) - error', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')
      sendImageToChannel.mockResolvedValue(undefined)

      const result = await getHookResult({ message: { ...messageMediaMock, errored: true, parsedContent: 'parsedContent' }, mediaAssets })

      const onAdornmentClick = result.current.adornmentProps.onAdornmentClick

      await actHook(async () => {
        await onAdornmentClick()
      })

      expect(retrieveImageFile).toHaveBeenCalledTimes(1)
      expect(retrieveImageFile).toHaveBeenCalledWith('parsedContent')
      expect(setMediaData).toHaveBeenCalledTimes(2)
      expect(setMediaData).toHaveBeenCalledWith({
        assetUuid,
        index: 0,
        imageState: ImageState.ERROR,
      })
      expect(sendImageToChannel).toHaveBeenCalledTimes(1)
      expect(result.current.adornmentProps.errorMessage).toEqual('error message')
    })

    it('should retry sending image when there is a sending error and user wants to retry (click on adornment) - success', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')
      sendImageToChannel.mockResolvedValue('newAssetUuid')

      const result = await getHookResult({ message: { ...messageMediaMock, errored: true, parsedContent: 'parsedContent' }, mediaAssets })

      const onAdornmentClick = result.current.adornmentProps.onAdornmentClick

      await actHook(async () => {
        await onAdornmentClick()
      })

      expect(retrieveImageFile).toHaveBeenCalledTimes(1)
      expect(retrieveImageFile).toHaveBeenCalledWith('parsedContent')
      expect(setMediaData).toHaveBeenCalledTimes(1)
      expect(replaceMediaAssets).toHaveBeenCalledTimes(1)
      expect(replaceMediaAssets).toHaveBeenCalledWith({
        oldAssetUuid: assetUuid,
        newAssetUuid: 'newAssetUuid',
      })
      expect(sendImageToChannel).toHaveBeenCalledTimes(1)
      expect(result.current.adornmentProps.errorMessage).toEqual('error message')
    })

    it('should download image when there is no sending error and user wants to retry (click on adornment)', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')
      sendImageToChannel.mockResolvedValue('newAssetUuid')
      getAssetByUuid.mockReturnValue({
        asset: assetImageMock,
        index: 0,
      })

      const result = await getHookResult({
        message: { ...messageMediaMock, errored: false },
        mediaAssets: {
          assetUuid1: { ...mediaAssetParsed, imageState: ImageState.ERROR},
          assetUuid2: { ...mediaAssetParsed, imageState: ImageState.ERROR},
          assetUuid3: { ...mediaAssetParsed, imageState: ImageState.ERROR},
        },
      })

      const onAdornmentClick = result.current.adornmentProps.onAdornmentClick

      await actHook(async () => {
        await onAdornmentClick()
      })

      expect(handleDownloadImage).toHaveBeenCalledTimes(4)
      expect(handleDownloadImage).toHaveBeenLastCalledWith(expect.any(Function), assetImageMock, 0)
      expect(sendImageToChannel).toHaveBeenCalledTimes(0)
    })

    it('should open full image asset', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')
      sendImageToChannel.mockResolvedValue('newAssetUuid')

      const result = await getHookResult({ mediaAssets })

      const handleOnClickFullImageOpen = result.current.componentProps.handleOnClickFullImageOpen

      await actHook(async () => {
        await handleOnClickFullImageOpen(assetUuid)
      })

      expect(handleFullImageOpen).toHaveBeenCalledTimes(1)
      expect(handleFullImageOpen).toHaveBeenCalledWith(
        messageMediaMock,
        assetImageMock,
        fileTokenMock,
        expect.anything()
      )
    })

    it('should open full encrypted image asset', async () => {
      getMediaErrorAdornment.mockReturnValue('error message')
      sendImageToChannel.mockResolvedValue('newAssetUuid')

      const result = await getHookResult({ mediaAssets, isMediaEncrypted: true })

      const handleOnClickFullImageOpen = result.current.componentProps.handleOnClickFullImageOpen

      await actHook(async () => {
        await handleOnClickFullImageOpen(assetUuid)
      })

      expect(handleFullEncryptedImageOpen).toHaveBeenCalledTimes(1)
      expect(handleFullEncryptedImageOpen).toHaveBeenCalledWith(
        messageMediaMock,
        assetEncryptedImageMock,
        encryptedChannelSecret,
        encryptionHeader,
        fileTokenMock,
        expect.anything()
      )
    })
  })
})

