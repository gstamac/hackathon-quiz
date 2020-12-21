import {
  FileToken,
  MediaAsset,
  EncryptedMediaAsset,
  MessageEncryptionHeader,
  MessageTemplateEncryptedMedia,
  MessageTemplateEncryptedText,
  MessageTemplateMedia,
  MessageTemplateMediaWithEncryptedText,
} from '@globalid/messaging-service-sdk'
import { getImageFromAws, getString } from '../../../../utils'
import {
  CommonImageMediaType,
  ImageMessageContentTemplate,
  MediaAssets,
  ImageState,
  GetImageWrapperStylesParams,
  ImageDisplayWrapperProps,
  ImageComponentStates,
  MediaAssetParsedData,
  MessageCardStylesType,
  SetMediaDataParams,
  GetDownloadImageHandlerParams,
  ReplaceMediaAssetsParams,
  AssetWithIndex,
} from './interfaces'
import { SetStateAction } from 'react'
import warningIcon from '../../../../assets/icons/warning_icon.svg'
import warningIconGray from '../../../../assets/icons/warning_icon_gray.svg'
import { deviceKeyManager } from '../../../../init'
import { isNil } from 'lodash'
import clsx from 'clsx'

export const retrieveSmallThumbnail = (asset: MediaAsset | null): string | null =>
  asset?.thumbnails.small ?? null

export const retrieveMediumThumbnail = (asset: MediaAsset | null): string | null => asset?.thumbnails.medium ?? null

export const retrieveOriginalMedia = (asset: MediaAsset | null): string | null => asset?.url ?? null

export const retrieveEncryptedThumbnail = async (
  asset: EncryptedMediaAsset | null,
  numberOfImages: number,
  encryptedChannelSecret: string,
  encryptionHeader: MessageEncryptionHeader,
): Promise<string | null> => {
  if (asset === null) {
    return null
  }

  const encryptedContent: MessageTemplateEncryptedText = {
    ciphertext: numberOfImages === 1
      ? asset.thumbnails.medium.ciphertext
      : asset.thumbnails.small.ciphertext,
    encryption_header: encryptionHeader,
  }

  return deviceKeyManager.decrypt(encryptedChannelSecret, encryptedContent)
}

export const retrieveEncryptedMediumThumbnail = async (
  asset: EncryptedMediaAsset | null,
  encryptedChannelSecret: string,
  encryptionHeader: MessageEncryptionHeader,
): Promise<string | null> => {
  if (asset === null) {
    return null
  }

  const encryptedContent: MessageTemplateEncryptedText = {
    ciphertext: asset.thumbnails.medium.ciphertext,
    encryption_header: encryptionHeader,
  }

  return deviceKeyManager.decrypt(encryptedChannelSecret, encryptedContent)
}

export const retrieveEncryptedOriginalMedia = async (
  asset: EncryptedMediaAsset | null,
  encryptedChannelSecret: string,
  encryptionHeader: MessageEncryptionHeader,
): Promise<string | null> => {
  if (asset === null) {
    return null
  }

  const encryptedContent: MessageTemplateEncryptedText = {
    ciphertext: asset.url.ciphertext,
    encryption_header: encryptionHeader,
  }

  return deviceKeyManager.decrypt(encryptedChannelSecret, encryptedContent)
}

export const retrieveImageFile = (parsedContent: string): File => {
  const base64Image: string = JSON.parse(parsedContent).assets[0].thumbnail
  const fileType: string = base64Image.slice(base64Image.indexOf(':') + 1, base64Image.indexOf(';'))
  const byteString: string = atob(base64Image.split(',')[1])
  const arrayBuffer: Uint8Array = new Uint8Array(new ArrayBuffer(byteString.length))

  for (let i = 0; i < byteString.length; i += 1) {
    arrayBuffer[i] = byteString.charCodeAt(i)
  }
  const newFile: File = <File> (new Blob([arrayBuffer], { type: fileType }))

  return newFile
}

export const retrieveThumbnailLink = async <T extends MediaAsset | EncryptedMediaAsset>(
  token: FileToken,
  asset: MediaAsset | EncryptedMediaAsset,
  numberOfImages: number,
  encryptedChannelSecret?: string,
  encryptionHeader?: MessageEncryptionHeader,
): Promise<string | undefined> => {
  if (encryptedChannelSecret !== undefined && encryptionHeader !== undefined) {
    const encryptedThumbnailLink: string | null = await retrieveEncryptedThumbnail(
      <T extends EncryptedMediaAsset ? EncryptedMediaAsset : null> asset,
      numberOfImages,
      encryptedChannelSecret,
      encryptionHeader,
    )

    if (encryptedThumbnailLink === null) {
      return
    }

    return getImageFromAws(encryptedThumbnailLink, token)
  }

  const thumbnailLink: string | null = retrieveSmallThumbnail(
    <T extends MediaAsset ? MediaAsset : null> asset
  )

  if (thumbnailLink === null) {
    return
  }

  return getImageFromAws(thumbnailLink, token)
}

export const getParsedImageMessageContent = (content: string): CommonImageMediaType | null => {
  try {
    const parsedMediaContent: CommonImageMediaType = JSON.parse(content)

    return parsedMediaContent
  } catch (err) {
    return null
  }
}

export const getImageMessageTemplateContent = (content: string | null | undefined): ImageMessageContentTemplate | null => {
  if (!content) {
    return null
  }
  try {
    const parsedMediaContentTemplate: ImageMessageContentTemplate = JSON.parse(content)

    return parsedMediaContentTemplate
  } catch (err) {
    return null
  }
}

export const getMediaDataSetter = (setMediaAssets: React.Dispatch<SetStateAction<MediaAssets>>) => ({
  assetUuid,
  ...params
}: SetMediaDataParams): void => setMediaAssets((prev: MediaAssets) => {
  const prevAsset: MediaAssetParsedData | undefined = prev[assetUuid]

  if (prevAsset !== undefined) {
    return {
      ...prev,
      [assetUuid]: {
        ...prevAsset,
        ...params,
      },
    }
  }

  return {
    ...prev,
    [assetUuid]: {
      ...params,
      imageState: params.imageState ?? ImageState.LOADING,
    },
  }
})

export const getReplaceMediaAssets = (setMediaAssets: React.Dispatch<SetStateAction<MediaAssets>>) => ({
  oldAssetUuid,
  newAssetUuid,
}: ReplaceMediaAssetsParams): void => setMediaAssets((prev: MediaAssets) => {
  const prevAsset: MediaAssetParsedData | undefined = prev[oldAssetUuid]

  if (prevAsset !== undefined) {
    return {
      [newAssetUuid]: {
        ...prevAsset,
        imageState: ImageState.LOADING,
      },
      [oldAssetUuid]: undefined,
    }
  }

  return prev
})

export const getImagesCount = (
  parsedMessageContent: CommonImageMediaType | null,
  parsedMessageContentTemplate: ImageMessageContentTemplate | null
): number => {
  if (parsedMessageContentTemplate !== null) {
    return parsedMessageContentTemplate.assets.length
  }
  if (parsedMessageContent !== null) {
    return parsedMessageContent.assets.length
  }

  return 0
}

export const getMediaText = async (
  hasText: boolean,
  isTextEncrypted: boolean,
  parsedMessageContent: CommonImageMediaType | null,
  parsedMessageContentTemplate: ImageMessageContentTemplate | null,
  encryptedChannelSecret?: string,
): Promise<string | null> => {
  if (!hasText) {
    return null
  }

  const parsedContent: MessageTemplateMedia | null = <MessageTemplateMedia | null> parsedMessageContent
  const parsedEncryptedContent: MessageTemplateMediaWithEncryptedText | null =
    <MessageTemplateMediaWithEncryptedText | null> parsedMessageContent

  if (parsedMessageContentTemplate?.text !== undefined) {
    return parsedMessageContentTemplate.text
  } else if (!isTextEncrypted && parsedContent?.text !== undefined) {
    return parsedContent.text
  } else if (
    isTextEncrypted &&
    parsedMessageContent !== null &&
    encryptedChannelSecret !== undefined &&
    parsedEncryptedContent?.text?.ciphertext !== undefined
  ) {
    const ciphertext: string = parsedEncryptedContent.text.ciphertext

    const encryptionHeader: MessageEncryptionHeader = (<MessageTemplateEncryptedMedia> parsedMessageContent)
      .encryption_header

    const encryptedTextTemplate: MessageTemplateEncryptedText = {
      ciphertext,
      encryption_header: encryptionHeader,
    }

    return deviceKeyManager.decrypt(encryptedChannelSecret, encryptedTextTemplate)
  }

  return null
}

export const topLeftImageIsCurved = (
  index: number,
  hasText: boolean,
): boolean => index === 0 && !hasText

export const topRightImageIsCurved = (
  index: number,
  numberOfImages: number,
  hasText: boolean,
): boolean => numberOfImages < 3
  ? index === numberOfImages - 1 && !hasText
  : index === 2 && !hasText

export const bottomLeftImageIsCurved = (
  index: number,
  numberOfImages: number,
): boolean => numberOfImages < 4
  ? index === 0
  : numberOfImages < 7
    ? index === 3
    : index === 6

export const bottomRightImageIsCurved = (
  index: number,
  numberOfImages: number,
): boolean => numberOfImages < 4
  ? index === numberOfImages - 1
  : numberOfImages < 7
    ? index === 5
    : index === 8

export const getImageBorderStyle = (
  {
    imageTopLeftBorder,
    imageTopRightBorder,
    imageBottomLeftBorder,
    imageBottomRightBorder,
  }: MessageCardStylesType,
  index: number,
  numberOfImages: number,
  hasText: boolean,
): string => clsx({
  [imageTopLeftBorder]: topLeftImageIsCurved(index, hasText),
  [imageTopRightBorder]: topRightImageIsCurved(index, numberOfImages, hasText),
  [imageBottomLeftBorder]: bottomLeftImageIsCurved(index, numberOfImages),
  [imageBottomRightBorder]: bottomRightImageIsCurved(index, numberOfImages),
})

// eslint-disable-next-line complexity
export const getStylesWrapperProps = ({
  classes,
  imageLink,
  hasLoaded,
  hasErrored,
  isLoading,
  isMessageMine,
  index,
  numberOfImages,
  hasText,
}: GetImageWrapperStylesParams): ImageDisplayWrapperProps => {
  const imageBorderStyle: string = getImageBorderStyle(classes, index, numberOfImages, hasText)

  return ({
    imageContainer: `${classes.imageContainer} ${hasLoaded && (isLoading || hasErrored) ? classes.transparent : ''}`,
    imageGridContainer: `${clsx(classes.imageGridContainer, imageBorderStyle) } ${hasLoaded && (isLoading || hasErrored) ? classes.transparent : ''}`,
    imageLoadingContent: classes.imageLoadingContent,
    imageMessageContent: classes.imageMessageContent,
    imageSrc: imageLink,
    infoIconForeground: clsx({
      [classes.imageBackground]: (!hasLoaded && isLoading) || (hasLoaded && hasErrored),
      [classes.transparent]: (!hasLoaded && isLoading) || (hasLoaded && hasErrored),
    }, imageBorderStyle, classes.infoIconForeground),
    background: clsx({
      [classes.placeholderBackground]: !hasLoaded,
      [classes.imageBackground]: hasLoaded,
    }, imageBorderStyle),
    placeholderBackground: clsx(classes.placeholderBackground, imageBorderStyle),
    circularProgress: classes.circularProgress,
    relative: classes.relative,
    imageStyling: hasLoaded ? classes.imageContainer : classes.imageHidden,
    warningIcon: isMessageMine ? warningIcon : warningIconGray,
  })
}

export const getImageComponentState = (
  mediaAssets: MediaAssets,
  isSendingError: boolean
): ImageComponentStates => (
  Object.keys(mediaAssets).reduce((imageComponentStates: ImageComponentStates, assetUuid: string) => {
    const asset: MediaAssetParsedData | undefined = mediaAssets[assetUuid]

    if (asset !== undefined) {
      const { imageState, imageSrc } = asset

      const showLoading: boolean = imageState === ImageState.LOADING
      const showError: boolean = imageState === ImageState.ERROR || isSendingError
      const showImage: boolean = (!showError || isSendingError) && !isNil(imageSrc)

      return {
        ...imageComponentStates,
        [assetUuid]: {
          showLoading,
          showError,
          showImage,
        },
      }
    }

    return imageComponentStates
  }, {})
)

export const getAssetByUuid = (
  assetUuid: string,
  parsedMessageContent: CommonImageMediaType | null,
  isMediaEncrypted: boolean,
): AssetWithIndex | undefined => (
  isMediaEncrypted
    ? (<MessageTemplateEncryptedMedia | null> parsedMessageContent)?.assets.reduce((
      assetWithIndex: AssetWithIndex | undefined,
      asset: EncryptedMediaAsset,
      index: number,
    ) => asset.uuid === assetUuid ? {
      asset,
      index,
    } : assetWithIndex, undefined)
    : (<MessageTemplateMedia | MessageTemplateMediaWithEncryptedText | null> parsedMessageContent)?.assets.reduce((
      assetWithIndex: AssetWithIndex | undefined,
      asset: MediaAsset,
      index: number,
    ) => asset.uuid === assetUuid ? {
      asset,
      index,
    } : assetWithIndex, undefined)
)

export const getMediaErrorAdornment = (
  isResending: boolean,
  isSendingError: boolean,
  mediaAssets: MediaAssets,
  latestAssetUuid?: string,
  latestState?: ImageState
): string | undefined => {
  if (isResending) {
    return
  }

  if (isSendingError) {
    return getString('image-message-send-failed')
  }

  const isDownloadError: boolean = Object.keys(mediaAssets).some(
    (assetUuid: string) => {
      const mediaAsset: MediaAssetParsedData | undefined = mediaAssets[assetUuid]

      return latestAssetUuid !== undefined && assetUuid === latestAssetUuid && latestState !== undefined
        ? latestState === ImageState.ERROR
        : mediaAsset?.imageState === ImageState.ERROR
    }
  )

  if (isDownloadError) {
    return getString('image-message-download-failed')
  }
}

// eslint-disable-next-line max-lines-per-function
export const getDownloadImageHandler = ({
  classes,
  fileToken,
  setMediaData,
  isMediaEncrypted,
  numberOfImages,
  encryptedChannelSecret,
  encryptionHeader,
  text,
  isMessageMine,
}: GetDownloadImageHandlerParams) => async (
  isMounted: () => boolean,
  asset: EncryptedMediaAsset | MediaAsset,
  index: number,
): Promise<void> => {

  if (fileToken !== undefined) {
    const awsImageLink: string | undefined = (
      await retrieveThumbnailLink(
        fileToken,
        asset,
        numberOfImages,
        isMediaEncrypted ? encryptedChannelSecret : undefined,
        isMediaEncrypted ? encryptionHeader : undefined,
      )
    )

    const styleWrapperProps: ImageDisplayWrapperProps = getStylesWrapperProps({
      classes,
      imageLink: awsImageLink,
      hasLoaded: false,
      hasErrored: false,
      isLoading: true,
      isMessageMine,
      index,
      numberOfImages,
      hasText: text !== undefined,
    })

    if (isMounted()) {
      setMediaData({
        assetUuid: asset.uuid,
        imageSrc: awsImageLink,
        imageState: ImageState.LOADING,
        styleWrapperProps,
        mediaAsset: !isMediaEncrypted ? <MediaAsset> asset : undefined,
        encryptedMediaAsset: isMediaEncrypted ? <EncryptedMediaAsset> asset : undefined,
        index,
      })
    }
  }
}
