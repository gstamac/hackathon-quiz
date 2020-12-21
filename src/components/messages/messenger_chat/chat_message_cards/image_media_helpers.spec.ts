// eslint-disable-next-line max-classes-per-file, @typescript-eslint/no-extraneous-class
import {
  retrieveSmallThumbnail,
  retrieveImageFile,
  retrieveMediumThumbnail,
  retrieveOriginalMedia,
  retrieveEncryptedMediumThumbnail,
  retrieveEncryptedOriginalMedia,
  retrieveThumbnailLink,
  getParsedImageMessageContent,
  getImageMessageTemplateContent,
  getMediaDataSetter,
  getReplaceMediaAssets,
  getImagesCount,
  getMediaText,
  topLeftImageIsCurved,
  topRightImageIsCurved,
  bottomLeftImageIsCurved,
  bottomRightImageIsCurved,
  getImageBorderStyle,
  getImageComponentState,
  getAssetByUuid,
  getMediaErrorAdornment,
} from './image_media_helpers'
import { assetImageMock, assetEncryptedImageMock } from '../../../../../tests/mocks/messages_mock'
import { avatarMock } from '../../../../../tests/mocks/avatar_mocks'
import { deviceKeyManager } from '../../../../init'
import { encryptedChannelSecretMock } from '../../../../../tests/mocks/device_key_manager_mocks'
import { MessageEncryptionHeader, MediaAsset, EncryptedMediaAsset } from '@globalid/messaging-service-sdk'
import * as utils from '../../../../utils'
import { fileTokenMock } from '../../../../../tests/mocks/channels_mock'
import {
  CommonImageMediaType,
  MediaListViewType,
  ImageMessageContentTemplate,
  SetMediaDataParams,
  ImageState,
  MediaAssets,
  ReplaceMediaAssetsParams,
  MediaAssetParsedData,
  MediaAssetTemplate,
  MessageCardStylesType,
} from './interfaces'

jest.mock('../../../../init')
jest.mock('../../../../utils')

describe('image media helpers tests', () => {

  const encryptionHeader: MessageEncryptionHeader = {
    enc: 'enc',
    iv: 'iv',
  }

  const getImageFromAwsMock: jest.Mock = jest.fn()
  const getStringMock: jest.Mock = jest.fn()
  const decryptMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (<jest.Mock> deviceKeyManager.decrypt) = decryptMock;
    (<jest.Mock> utils.getImageFromAws) = getImageFromAwsMock;
    (<jest.Mock> utils.getString) = getStringMock
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('retrieveThumbnail', () => {
    it('should return small thumbnail when there are more assets', () => {
      expect(retrieveSmallThumbnail(assetImageMock, 2)).toStrictEqual(assetImageMock.thumbnails.small)
    })

    it('should return undefined', () => {
      expect(retrieveSmallThumbnail(null, 1)).toBeNull()
    })
  })

  describe('retrieveMediumThumbnail', () => {
    it('should return medium thumbnail', () => {
      expect(retrieveMediumThumbnail(assetImageMock)).toStrictEqual(assetImageMock.thumbnails.medium)
    })

    it('should return undefined', () => {
      expect(retrieveMediumThumbnail(null)).toBeNull()
    })
  })

  describe('retrieveOriginalMedia', () => {
    it('should return original asset', () => {
      expect(retrieveOriginalMedia(assetImageMock)).toStrictEqual(assetImageMock.url)
    })

    it('should return undefined', () => {
      expect(retrieveOriginalMedia(null)).toBeNull()
    })
  })

  describe('retrieveEncryptedMediumThumbnail', () => {
    const decrypted: string = 'decrypted'

    it('should return decrypted medium thumbnail', async () => {
      decryptMock.mockResolvedValue(decrypted)

      expect(await retrieveEncryptedMediumThumbnail(
        assetEncryptedImageMock,
        encryptedChannelSecretMock,
        encryptionHeader,
      )).toEqual(decrypted)
    })

    it('should return undefined', async () => {
      decryptMock.mockResolvedValue(null)

      expect(await retrieveEncryptedMediumThumbnail(
        null,
        encryptedChannelSecretMock,
        encryptionHeader,
      )).toBeNull()
    })
  })

  describe('retrieveEncryptedOriginalMedia', () => {
    const decrypted: string = 'decrypted'

    it('should return decrypted original thumbnail', async () => {
      decryptMock.mockResolvedValue(decrypted)

      expect(await retrieveEncryptedOriginalMedia(
        assetEncryptedImageMock,
        encryptedChannelSecretMock,
        encryptionHeader,
      )).toEqual(decrypted)
    })

    it('should return undefined', async () => {
      decryptMock.mockResolvedValue(null)

      expect(await retrieveEncryptedOriginalMedia(
        null,
        encryptedChannelSecretMock,
        encryptionHeader,
      )).toBeNull()
    })
  })

  describe('retrieveImageFile', () => {
    const parsedContent: string = JSON.stringify({ assets: [{
      uuid: 'test',
      thumbnail: avatarMock,
    }] })

    it('should create image file out of base64 content', () => {
      const file: File = retrieveImageFile(parsedContent)

      expect(file).toBeDefined()
      expect(file).not.toBeNull()
    })
  })

  describe('retrieveThumbnailLink', () => {

    const awsImage: string = 'awsImage'
    const decrypted: string = 'decrypted'

    beforeEach(() => {
      getImageFromAwsMock.mockResolvedValue(awsImage)
      decryptMock.mockResolvedValue(decrypted)
    })

    it('should return unencrypted thumbnail from aws', async () => {
      expect(await retrieveThumbnailLink<MediaAsset>(
        fileTokenMock,
        assetImageMock,
        1,
      )).toEqual(awsImage)
    })

    it('should return encrypted thumbnail from aws for encrypted data', async () => {
      expect(await retrieveThumbnailLink<EncryptedMediaAsset>(
        fileTokenMock,
        assetEncryptedImageMock,
        1,
        encryptedChannelSecretMock,
        encryptionHeader,
      )).toEqual(awsImage)
    })
  })

  describe('getParsedImageMessageContent', () => {

    const parsedContent: CommonImageMediaType = {
      list_view_type: MediaListViewType.Vertical,
      assets: [],
    }

    it('should return parsed image message content', () => {
      expect(getParsedImageMessageContent(JSON.stringify(parsedContent))).toEqual(parsedContent)
    })

    it('should return null', () => {
      expect(getParsedImageMessageContent('{ wrong object }')).toBeNull()
    })
  })

  describe('getImageMessageTemplateContent', () => {

    const parsedContent: ImageMessageContentTemplate = {
      assets: [],
    }

    it('should return parsed image message content', () => {
      expect(getImageMessageTemplateContent(JSON.stringify(parsedContent))).toEqual(parsedContent)
    })

    it('should return null', () => {
      expect(getImageMessageTemplateContent('{ wrong object }')).toBeNull()
    })
  })

  describe('getMediaDataSetter', () => {

    const setMediaAssets: jest.Mock = jest.fn()

    it('should call setMediaAssets with new params and imageState.LOADING as default', () => {
      const setMediaData = getMediaDataSetter(setMediaAssets)
      const params: SetMediaDataParams = {
        assetUuid: 'assetUuid',
        index: 0,
      }

      setMediaData(params)

      expect(setMediaAssets).toHaveBeenCalledTimes(1)

      const anonymousFunction: Function = setMediaAssets.mock.calls[0][0]

      expect(anonymousFunction({})).toEqual({
        assetUuid: {
          index: 0,
          imageState: ImageState.LOADING,
        },
      })
    })

    it('should call setMediaAssets with new params', () => {
      const setMediaData = getMediaDataSetter(setMediaAssets)
      const params: SetMediaDataParams = {
        assetUuid: 'assetUuid',
        index: 0,
        imageState: ImageState.LOADED,
        imageSrc: 'imageSrc',
      }

      setMediaData(params)

      expect(setMediaAssets).toHaveBeenCalledTimes(1)

      const anonymousFunction: Function = setMediaAssets.mock.calls[0][0]

      expect(anonymousFunction({})).toEqual({
        assetUuid: {
          index: 0,
          imageState: ImageState.LOADED,
          imageSrc: 'imageSrc',
        },
      })
    })

    it('should call setMediaAssets with new params and old data', () => {
      const setMediaData = getMediaDataSetter(setMediaAssets)
      const params: SetMediaDataParams = {
        assetUuid: 'assetUuid',
        index: 0,
        imageState: ImageState.LOADED,
        imageSrc: 'imageSrc',
      }

      const prevObject: MediaAssets = {
        assetUuid2: {
          index: 1,
          imageState: ImageState.ERROR,
          imageSrc: 'imageSrc',
        },
      }

      setMediaData(params)

      expect(setMediaAssets).toHaveBeenCalledTimes(1)

      const anonymousFunction: Function = setMediaAssets.mock.calls[0][0]

      expect(anonymousFunction(prevObject)).toEqual({
        ...prevObject,
        assetUuid: {
          index: 0,
          imageState: ImageState.LOADED,
          imageSrc: 'imageSrc',
        },
      })
    })

    it('should call setMediaAssets with new params from old data', () => {
      const setMediaData = getMediaDataSetter(setMediaAssets)
      const params: SetMediaDataParams = {
        assetUuid: 'assetUuid',
        index: 0,
        imageState: ImageState.LOADED,
      }

      const prevObject: MediaAssets = {
        assetUuid: {
          index: 0,
          imageState: ImageState.ERROR,
          imageSrc: 'imageSrc',
        },
      }

      setMediaData(params)

      expect(setMediaAssets).toHaveBeenCalledTimes(1)

      const anonymousFunction: Function = setMediaAssets.mock.calls[0][0]

      expect(anonymousFunction(prevObject)).toEqual({
        assetUuid: {
          index: 0,
          imageState: ImageState.LOADED,
          imageSrc: 'imageSrc',
        },
      })
    })
  })

  describe('getReplaceMediaAssets', () => {

    const setMediaAssets: jest.Mock = jest.fn()

    const mediaAsset: MediaAssetParsedData = {
      index: 1,
      imageState: ImageState.ERROR,
      imageSrc: 'imageSrc',
    }

    it('should call setMediaAssets with prev state when old asset is not found', () => {
      const replaceMediaAssets = getReplaceMediaAssets(setMediaAssets)
      const params: ReplaceMediaAssetsParams = {
        oldAssetUuid: 'oldAssetUuid',
        newAssetUuid: 'newAssetUuid',
      }

      replaceMediaAssets(params)

      expect(setMediaAssets).toHaveBeenCalledTimes(1)

      const anonymousFunction: Function = setMediaAssets.mock.calls[0][0]

      const prevState: MediaAssets = {
        randomAssetUuid: mediaAsset,
      }

      expect(anonymousFunction(prevState)).toEqual(prevState)
    })

    it('should call setMediaAssets with replaces asset when old asset is found', () => {
      const replaceMediaAssets = getReplaceMediaAssets(setMediaAssets)
      const params: ReplaceMediaAssetsParams = {
        oldAssetUuid: 'oldAssetUuid',
        newAssetUuid: 'newAssetUuid',
      }

      replaceMediaAssets(params)

      expect(setMediaAssets).toHaveBeenCalledTimes(1)

      const anonymousFunction: Function = setMediaAssets.mock.calls[0][0]

      const prevState: MediaAssets = {
        oldAssetUuid: mediaAsset,
      }

      expect(anonymousFunction(prevState)).toEqual({
        newAssetUuid: {
          ...mediaAsset,
          imageState: ImageState.LOADING,
        },
      })
    })
  })

  describe('getImagesCount', () => {
    it('should return the amount of images in parsedContentTemplate if present', () => {

      const mediaAssetTemplate: MediaAssetTemplate = {
        uuid: 'uuid',
        thumbnail: 'thumbnail',
      }

      const parsedMessageContentTemplate: ImageMessageContentTemplate = {
        assets: [mediaAssetTemplate, mediaAssetTemplate],
      }

      expect(getImagesCount(null, parsedMessageContentTemplate)).toEqual(2)
    })

    it('should return the amount of images in parsedContent if template is not present', () => {

      const parsedMessageContent: CommonImageMediaType = {
        list_view_type: MediaListViewType.Vertical,
        assets: [assetImageMock, assetImageMock, assetImageMock],
      }

      expect(getImagesCount(parsedMessageContent, null)).toEqual(3)
    })

    it('should return 0 when parsed content and template are null', () => {

      expect(getImagesCount(null, null)).toEqual(0)
    })
  })

  describe('getMediaText', () => {
    const parsedText: string = 'parsedText'
    const text: string = 'text'
    const ciphertext: string = 'ciphertext'

    const mediaAssetTemplate: MediaAssetTemplate = {
      uuid: 'uuid',
      thumbnail: 'thumbnail',
    }

    const parsedMessageContent: CommonImageMediaType = {
      text,
      list_view_type: MediaListViewType.Vertical,
      assets: [assetImageMock, assetImageMock, assetImageMock],
      encryption_header: encryptionHeader,
    }

    const parsedMessageContentWithEncryptedText: CommonImageMediaType = {
      text: {
        ciphertext,
      },
      list_view_type: MediaListViewType.Vertical,
      assets: [assetEncryptedImageMock, assetEncryptedImageMock, assetEncryptedImageMock],
      encryption_header: encryptionHeader,
    }

    const parsedMessageContentTemplate: ImageMessageContentTemplate = {
      text: parsedText,
      assets: [mediaAssetTemplate, mediaAssetTemplate],
    }

    it('should return text when its present in parsed content template', async () => {

      expect(await getMediaText(
        true,
        false,
        parsedMessageContent,
        parsedMessageContentTemplate,
        encryptedChannelSecretMock,
      )).toEqual(parsedText)
    })

    it('should return unencrypted text when its present in parsed content', async () => {

      expect(await getMediaText(
        true,
        false,
        parsedMessageContent,
        null,
        encryptedChannelSecretMock,
      )).toEqual(text)
    })

    it('should return decrypted text when its present in parsed content and encrypted', async () => {
      const decryptedText: string = 'decryptedText'

      decryptMock.mockResolvedValue(decryptedText)

      expect(await getMediaText(
        true,
        true,
        parsedMessageContentWithEncryptedText,
        null,
        encryptedChannelSecretMock,
      )).toEqual(decryptedText)

      expect(decryptMock).toHaveBeenCalledTimes(1)
      expect(decryptMock).toHaveBeenCalledWith(encryptedChannelSecretMock, {
        ciphertext,
        encryption_header: encryptionHeader,
      })
    })

    it('should null when content doesn\'t have text', async () => {
      expect(await getMediaText(
        false,
        true,
        parsedMessageContent,
        parsedMessageContentTemplate,
        encryptedChannelSecretMock,
      )).toBeNull()
    })

    it('should null when parsed content and template are null', async () => {
      expect(await getMediaText(
        true,
        false,
        null,
        null,
        encryptedChannelSecretMock,
      )).toBeNull()
    })
  })

  describe('topLeftImageIsCurved', () => {
    it('should return true when image index is 0 and has no text', () => {
      expect(topLeftImageIsCurved(0, false)).toEqual(true)
    })
    it('should return false when image index is 0 and has text', () => {
      expect(topLeftImageIsCurved(0, true)).toEqual(false)
    })
    it('should return true when image index is not 0 and has no text', () => {
      expect(topLeftImageIsCurved(1, false)).toEqual(false)
    })
  })

  describe('topRightImageIsCurved', () => {
    it('should return true when image index is in the top right corner when number of images is less than 4 and has no text', () => {
      expect(topRightImageIsCurved(1, 2, false)).toEqual(true)
    })
    it('should return false when image index is in the top right corner when number of images is less than 4 and has text', () => {
      expect(topRightImageIsCurved(1, 2, true)).toEqual(false)
    })
    it('should return false when image index is not in top right corner when number of images is less than 4 and has no text', () => {
      expect(topRightImageIsCurved(0, 2, false)).toEqual(false)
    })
    it('should return true when image index is in the top right corner when number of images is more than 4 and has no text', () => {
      expect(topRightImageIsCurved(2, 6, false)).toEqual(true)
    })
    it('should return false when image index is in the top right corner when number of images is more than 4 and has text', () => {
      expect(topRightImageIsCurved(2, 6, true)).toEqual(false)
    })
    it('should return false when image index is not in top right corner when number of images is less than 7 and has no text', () => {
      expect(topRightImageIsCurved(1, 6, false)).toEqual(false)
    })
  })

  describe('bottomLeftImageIsCurved', () => {
    it('should return true when image index is in the bottom left corner when number of images is less than 4', () => {
      expect(bottomLeftImageIsCurved(0, 2)).toEqual(true)
    })
    it('should return true when image index is not in the bottom left corner when number of images is less than 4', () => {
      expect(bottomLeftImageIsCurved(1, 2)).toEqual(false)
    })
    it('should return true when image index is in the bottom left corner when number of images is more than 3 and less than 7', () => {
      expect(bottomLeftImageIsCurved(3, 6)).toEqual(true)
    })
    it('should return false when image index is in the bottom left corner when number of images is more than 3 and less than 7', () => {
      expect(bottomLeftImageIsCurved(4, 6)).toEqual(false)
    })
    it('should return true when image index is in the bottom left corner when number of images is more than 6', () => {
      expect(bottomLeftImageIsCurved(6, 8)).toEqual(true)
    })
    it('should return false when image index is in the bottom left corner when number of images is more than 6', () => {
      expect(bottomLeftImageIsCurved(7, 8)).toEqual(false)
    })
  })

  describe('bottomRightImageIsCurved', () => {
    it('should return true when image index is in the bottom right corner when number of images is less than 4', () => {
      expect(bottomRightImageIsCurved(1, 2)).toEqual(true)
    })
    it('should return true when image index is not in the bottom right corner when number of images is less than 4', () => {
      expect(bottomRightImageIsCurved(0, 2)).toEqual(false)
    })
    it('should return true when image index is in the bottom right corner when number of images is more than 3 and less than 7', () => {
      expect(bottomRightImageIsCurved(5, 6)).toEqual(true)
    })
    it('should return false when image index is in the bottom right corner when number of images is more than 3 and less than 7', () => {
      expect(bottomRightImageIsCurved(4, 6)).toEqual(false)
    })
    it('should return true when image index is in the bottom right corner when number of images is more than 6', () => {
      expect(bottomRightImageIsCurved(8, 9)).toEqual(true)
    })
    it('should return false when image index is in the bottom right corner when number of images is more than 6', () => {
      expect(bottomRightImageIsCurved(7, 9)).toEqual(false)
    })
  })

  describe('getImageBorderStyle', () => {
    const styles: MessageCardStylesType = {
      imageTopLeftBorder: 'imageTopLeftBorder',
      imageTopRightBorder: 'imageTopRightBorder',
      imageBottomLeftBorder: 'imageBottomLeftBorder',
      imageBottomRightBorder: 'imageBottomRightBorder',
    }

    it('should return appropriate joined styles', () => {
      expect(getImageBorderStyle(styles, 0, 1, false)).toEqual(
        'imageTopLeftBorder imageTopRightBorder imageBottomLeftBorder imageBottomRightBorder'
      )
    })
  })

  describe('getImageComponentState', () => {

    const mediaAsset: MediaAssetParsedData = {
      index: 1,
      imageState: ImageState.ERROR,
      imageSrc: 'imageSrc',
    }

    it('should return states based on mediaAssets when its not sending and state is ERROR', () => {
      const mediaAssets: MediaAssets = {
        assetUuid: mediaAsset,
      }

      expect(getImageComponentState(mediaAssets, false)).toEqual({
        assetUuid: {
          showLoading: false,
          showError: true,
          showImage: false,
        },
      })
    })

    it('should return states based on mediaAssets when its sending and state is ERROR', () => {
      const mediaAssets: MediaAssets = {
        assetUuid: mediaAsset,
      }

      expect(getImageComponentState(mediaAssets, true)).toEqual({
        assetUuid: {
          showLoading: false,
          showError: true,
          showImage: true,
        },
      })
    })

    it('should return states based on mediaAssets when its sending and state is LOADED', () => {
      const mediaAssets: MediaAssets = {
        assetUuid: {
          ...mediaAsset,
          imageState: ImageState.LOADED,
        },
      }

      expect(getImageComponentState(mediaAssets, true)).toEqual({
        assetUuid: {
          showLoading: false,
          showError: true,
          showImage: true,
        },
      })
    })

    it('should return states based on mediaAssets when not sending and state is LOADING', () => {
      const mediaAssets: MediaAssets = {
        assetUuid: {
          ...mediaAsset,
          imageState: ImageState.LOADING,
        },
      }

      expect(getImageComponentState(mediaAssets, false)).toEqual({
        assetUuid: {
          showLoading: true,
          showError: false,
          showImage: true,
        },
      })
    })
  })

  describe('getAssetByUuid', () => {

    const text: string = 'text'

    const parsedMessageContent: CommonImageMediaType = {
      text,
      list_view_type: MediaListViewType.Vertical,
      assets: [assetImageMock],
      encryption_header: encryptionHeader,
    }

    it('should return asset with index', () => {
      expect(getAssetByUuid(assetImageMock.uuid, parsedMessageContent, false)).toEqual({
        index: 0,
        asset: assetImageMock,
      })
    })
  })

  describe('getMediaErrorAdornment', () => {

    const mediaAsset: MediaAssetParsedData = {
      index: 1,
      imageState: ImageState.ERROR,
      imageSrc: 'imageSrc',
    }

    const mediaAssets: MediaAssets = {
      assetUuid: mediaAsset,
    }

    const messageMock: string = 'message'

    beforeEach(() => {
      getStringMock.mockReturnValue(messageMock)
    })

    it('should return undefined when resending', () => {
      expect(getMediaErrorAdornment(
        true,
        false,
        mediaAssets,
      )).toBeUndefined()
    })

    it('should return sending error message when its a sending error', () => {

      expect(getMediaErrorAdornment(
        false,
        true,
        mediaAssets,
      )).toEqual(messageMock)
      expect(getStringMock).toHaveBeenCalledWith('image-message-send-failed')
    })

    it('should return download error when at least one mediaAsset has state ERROR', () => {
      expect(getMediaErrorAdornment(
        false,
        false,
        mediaAssets,
      )).toEqual(messageMock)
      expect(getStringMock).toHaveBeenCalledWith('image-message-download-failed')
    })

    it('should return download error when at least one mediaAsset has state ERROR including latest one', () => {
      const cleanMediaAssets: MediaAssets = {
        assetUuid: {
          ...mediaAsset,
          imageState: ImageState.LOADED,
        },
      }

      expect(getMediaErrorAdornment(
        false,
        false,
        cleanMediaAssets,
        'assetUuid',
        ImageState.ERROR
      )).toEqual(messageMock)
      expect(getStringMock).toHaveBeenCalledWith('image-message-download-failed')
    })

    it('should return undefined when none of mediaAssets have state ERROR', () => {
      const cleanMediaAssets: MediaAssets = {
        assetUuid: {
          ...mediaAsset,
          imageState: ImageState.LOADED,
        },
      }

      expect(getMediaErrorAdornment(
        false,
        false,
        cleanMediaAssets,
      )).toBeUndefined()
    })
  })
})
