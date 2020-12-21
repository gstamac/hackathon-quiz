/* eslint-disable complexity */
import { sendImageToChannel, hasParsedText } from '../../../../utils'
import {
  UseImageMessageCardHooksResponse,
  GetMediaByTypeParams,
  MediaAssetParsedData,
  CommonImageMediaType,
  ImageMessageContentTemplate,
  MediaAssetTemplate,
  ImageState,
  ImageComponentStates,
  AssetWithIndex,
} from './interfaces'
import {
  FileToken,
  MessageTemplateMedia,
  MessageTemplateEncryptedMedia,
  MessageTemplateMediaWithEncryptedText,
  MediaAsset,
  EncryptedMediaAsset,
  MessageEncryptionHeader,
} from '@globalid/messaging-service-sdk'
import { ImageDisplayWrapperProps } from '.'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from 'RootType'
import { useStyles } from './styles'
import { handleFullImageOpen, handleFullEncryptedImageOpen } from '../../../../utils/dialog_utils'
import useAsyncEffect from 'use-async-effect'
import {
  getParsedImageMessageContent,
  getImageMessageTemplateContent,
  getMediaText,
  getStylesWrapperProps,
  retrieveImageFile,
  getImageComponentState,
  getImagesCount,
  getAssetByUuid,
  getMediaErrorAdornment,
  getDownloadImageHandler,
} from './image_media_helpers'
import { Dispatch } from '@reduxjs/toolkit'

// eslint-disable-next-line max-lines-per-function
export const useGetMediaDataByType = ({
  message,
  mediaAssets,
  isMessageMine,
  isTextEncrypted,
  isMediaEncrypted,
  hasText,
  replaceMediaAssets,
  setMediaData,
  encryptedChannelSecret,
  renderAvatar,
}: GetMediaByTypeParams): UseImageMessageCardHooksResponse => {

  const parsedMessageContent: CommonImageMediaType | null = getParsedImageMessageContent(message.content)
  const parsedMessageContentTemplate: ImageMessageContentTemplate | null = (
    getImageMessageTemplateContent(message.parsedContent)
  )

  const encryptionHeader: MessageEncryptionHeader | undefined = isMediaEncrypted
    ? (<MessageTemplateEncryptedMedia | null> parsedMessageContent)?.encryption_header
    : undefined

  const dispatch: Dispatch = useDispatch()

  const numberOfImages: number = getImagesCount(parsedMessageContent, parsedMessageContentTemplate)

  const [errorMessage, setErrorMessage] = useState<string>()
  const [isResending, setIsResending] = useState<boolean>(false)
  const [text, setText] = useState<string | undefined>()

  const hasError: boolean = errorMessage !== undefined

  const fileToken: FileToken | undefined =
    useSelector((root: RootState) => root.channels.fileTokens[message.channel_id])

  const classes = useStyles({
    me: isMessageMine,
    deleted: message.deleted,
    resending: isResending,
    receiving: false,
    errorAdornment: hasError,
    numberOfImages,
    renderAvatar,
  })

  const handleDownloadBatch = async (): Promise<void> => {
    await Promise.all(Object.values(mediaAssets).map(async (mediaAssetParsed: MediaAssetParsedData | undefined) => {
      if (mediaAssetParsed !== undefined && mediaAssetParsed.imageState === ImageState.ERROR) {
        if (!isMediaEncrypted && mediaAssetParsed.mediaAsset !== undefined) {
          await handleDownloadImage(() => true, mediaAssetParsed.mediaAsset, mediaAssetParsed.index,)
        } else if (!isMediaEncrypted && mediaAssetParsed.encryptedMediaAsset !== undefined) {
          await handleDownloadImage(() => true, mediaAssetParsed.encryptedMediaAsset, mediaAssetParsed.index)
        }
      }
    }))
  }

  const handleDownloadImage = getDownloadImageHandler({
    classes,
    fileToken,
    setMediaData,
    isMediaEncrypted,
    numberOfImages,
    encryptedChannelSecret,
    encryptionHeader,
    text,
    isMessageMine,
  })

  // eslint-disable-next-line max-lines-per-function
  const handleMediaData = async (isMounted: () => boolean): Promise<void> => {
    const messageText: string | null = await getMediaText(
      hasText,
      isTextEncrypted,
      parsedMessageContent,
      parsedMessageContentTemplate,
      encryptedChannelSecret
    )

    if (hasParsedText(messageText) && isMounted()) {
      setText(messageText)
    }

    if (parsedMessageContentTemplate !== null && numberOfImages > 0) {
      parsedMessageContentTemplate.assets.forEach((asset: MediaAssetTemplate, index: number) => {
        const imageLink: string = asset.thumbnail

        const styleWrapperProps: ImageDisplayWrapperProps = getStylesWrapperProps({
          classes,
          imageLink,
          hasLoaded: false,
          hasErrored: false,
          isLoading: true,
          isMessageMine,
          index,
          numberOfImages,
          hasText: hasParsedText(messageText),
        })

        if (isMounted()) {
          setMediaData({
            assetUuid: asset.uuid,
            imageSrc: imageLink,
            styleWrapperProps,
            index,
          })
        }
      })

    } else if (parsedMessageContent !== null && numberOfImages > 0 && fileToken !== undefined) {
      if (isMediaEncrypted) {
        await Promise.all((<MessageTemplateEncryptedMedia> parsedMessageContent).assets.map(async (
          asset: EncryptedMediaAsset,
          index: number
        ) => {
          await handleDownloadImage(isMounted, asset, index)
        }))
      } else {
        await Promise.all((
          <MessageTemplateMedia | MessageTemplateMediaWithEncryptedText> parsedMessageContent
        ).assets.map(async (asset: MediaAsset, index: number) => {
          await handleDownloadImage(isMounted, asset, index)
        }))
      }
    }
  }

  useAsyncEffect(handleMediaData, [message.content, fileToken, text])

  const isSendingError: boolean = message.errored

  const downloadErrorHandling = (assetUuid: string): void => {
    const asset: MediaAssetParsedData | undefined = mediaAssets[assetUuid]

    if (asset !== undefined) {
      setMediaData({
        assetUuid,
        imageState: ImageState.ERROR,
        index: asset.index,
      })
      setErrorMessage(getMediaErrorAdornment(isResending, isSendingError, mediaAssets, assetUuid, ImageState.ERROR))
    }
  }

  useEffect(() => {
    if (isSendingError) {
      setErrorMessage(getMediaErrorAdornment(isResending, isSendingError, mediaAssets))
    }
  }, [isSendingError])

  const downloadLoadedHandling = (assetUuid: string): void => {
    const asset: MediaAssetParsedData | undefined = mediaAssets[assetUuid]

    if (asset !== undefined && !isSendingError) {
      const styleWrapperProps: ImageDisplayWrapperProps = getStylesWrapperProps({
        classes,
        imageLink: asset.imageSrc,
        hasLoaded: true,
        hasErrored: false,
        isLoading: false,
        isMessageMine,
        index: asset.index,
        numberOfImages,
        hasText: hasParsedText(text),
      })

      setMediaData({
        assetUuid,
        imageState: ImageState.LOADED,
        styleWrapperProps,
        index: asset.index,
      })
      setErrorMessage(getMediaErrorAdornment(isResending, isSendingError, mediaAssets, assetUuid, ImageState.LOADED))
    }
  }

  const resetImageState = (assetUuid: string): void => {

    const asset: MediaAssetParsedData | undefined = mediaAssets[assetUuid]

    if (asset !== undefined) {
      setMediaData({
        assetUuid,
        imageState: ImageState.LOADING,
        index: asset.index,
      })
      setErrorMessage(getMediaErrorAdornment(isResending, isSendingError, mediaAssets,assetUuid, ImageState.LOADING))
    }
  }

  const onRetry = async (assetUuid: string): Promise<void> => isSendingError
    ? retrySendImage()
    : retryDownloadImage(assetUuid)

  const onAdornmentClick = async (): Promise<void> => isSendingError
    ? retrySendImage()
    : handleDownloadBatch()

  const retryDownloadImage = async (assetUuid: string): Promise<void> => {
    if (!isSendingError) {
      resetImageState(assetUuid)

      const assetWithIndex: AssetWithIndex | undefined = getAssetByUuid(
        assetUuid,
        parsedMessageContent,
        isMediaEncrypted,
      )

      if (assetWithIndex !== undefined) {
        await handleDownloadImage(() => true, assetWithIndex.asset, assetWithIndex.index)
      }
    }
  }

  const retrySendImage = async (): Promise<void> => {
    const assetUuid: string = Object.keys(mediaAssets)[0]
    const asset: MediaAssetParsedData | undefined = mediaAssets[assetUuid]

    if (isSendingError && isMessageMine && message.parsedContent && asset !== undefined) {
      resetImageState(assetUuid)
      setIsResending(true)
      const resendFile: File = retrieveImageFile(message.parsedContent)

      const newAssetUuid: string | undefined = await sendImageToChannel(
        resendFile,
        message.channel_id,
        message.author,
        {
          resending: true,
          uuid: message.uuid,
        }
      )

      setIsResending(false)

      if (newAssetUuid === undefined) {
        setMediaData({
          assetUuid,
          imageState: ImageState.ERROR,
          index: asset.index,
        })
        setErrorMessage(getMediaErrorAdornment(isResending, true, mediaAssets, assetUuid, ImageState.ERROR))
      } else {
        replaceMediaAssets({ oldAssetUuid: assetUuid, newAssetUuid})
        setErrorMessage(getMediaErrorAdornment(isResending, false, mediaAssets))
      }
    }
  }

  const handleOnClickFullImageOpen = async (assetUuid: string): Promise<void> => {
    const asset: MediaAssetParsedData | undefined = mediaAssets[assetUuid]

    if (
      fileToken
      && asset !== undefined
      && isMediaEncrypted
      && encryptedChannelSecret !== undefined
      && parsedMessageContent !== null
    ) {
      await handleFullEncryptedImageOpen(
        message,
        asset.encryptedMediaAsset ?? null,
        encryptedChannelSecret,
        (<MessageTemplateEncryptedMedia> parsedMessageContent).encryption_header,
        fileToken,
        dispatch
      )
    } else if (fileToken && asset !== undefined) {
      handleFullImageOpen(message, asset.mediaAsset ?? null, fileToken, dispatch)
    }
  }

  const imageComponentStates: ImageComponentStates
    = getImageComponentState(mediaAssets, isSendingError)

  return {
    classes,
    adornmentProps: {
      resending: isResending,
      onAdornmentClick,
      errorMessage,
    },
    componentProps: {
      text,
      containerStyle: classes.mediaMessageContainer,
      gridStyle: classes.mediaContainer,
      textStyle: classes.mediaMessageTextContainer,
      mediaAssets,
      isSending: isResending,
      imageComponentStates,
      isLoadingError: hasError && !isSendingError,
      onRetrySend: retrySendImage,
      onRetry,
      downloadLoadedHandling,
      downloadErrorHandling,
      handleOnClickFullImageOpen,
    },
  }
}

