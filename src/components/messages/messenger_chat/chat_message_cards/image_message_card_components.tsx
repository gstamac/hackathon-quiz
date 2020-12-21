import React, { useCallback } from 'react'
import {
  ImageDisplayWrapperProps,
  ImageMessageCardComponentProps,
  MediaAssetParsedData,
  GetImagesFromMediaAssetsProps,
} from './interfaces'
import ReactLinkify from 'react-linkify'

import { CircularProgress } from '@material-ui/core'
import { linkComponentDecorator } from './helpers'
import { isEmpty } from 'lodash'

type ComponentType = {
    wrapperProps: ImageDisplayWrapperProps
    isSending?: boolean
    onLoadAction?: () => void
    onErrorAction: () => void
    onClickAction?: () => Promise<void>
    showImage?: boolean
    loadingError?: boolean
}

const LoadingComponent: React.FC<ComponentType> = ({
  wrapperProps,
  onLoadAction,
  onErrorAction,
}) => (
  <div className={`${wrapperProps.relative} ${wrapperProps.placeholderBackground}`} data-testid='loading-component'>
    {wrapperProps.imageSrc && <div className={wrapperProps.imageGridContainer}>
      <img
        className={wrapperProps.imageStyling}
        src={wrapperProps.imageSrc}
        onLoad={onLoadAction}
        onError={onErrorAction}
        alt={'download_image'}
      />
    </div>}
    <div className={wrapperProps.infoIconForeground}>
      <CircularProgress className={wrapperProps.circularProgress} size={25} thickness={6} />
    </div>
  </div>
)

const ErrorComponent: React.FC<ComponentType> = ({
  wrapperProps,
  showImage = false,
  loadingError,
  onErrorAction,
  onClickAction,
}) => (
  <div className={`${wrapperProps.relative} ${wrapperProps.background}`} onClick={onClickAction} data-testid='error-component'>
    {showImage && wrapperProps.imageSrc && !loadingError && <div className={wrapperProps.imageGridContainer}>
      <img
        className={wrapperProps.imageStyling}
        src={wrapperProps.imageSrc}
        onError={onErrorAction}
        alt={'download_image'}
      />
    </div>}
    <div className={wrapperProps.infoIconForeground}>
      <img src={wrapperProps.warningIcon} />
    </div>
  </div>
)

export const ImageComponent: React.FC<ComponentType> = ({
  wrapperProps,
  isSending,
  onLoadAction,
  onErrorAction,
  onClickAction,
}) => {

  const imageElement = (altText: string): JSX.Element =>
    <div className={wrapperProps.imageGridContainer}>
      <img
        className={wrapperProps.imageStyling}
        src={wrapperProps.imageSrc}
        onLoad={onLoadAction}
        onError={onErrorAction}
        onClick={onClickAction}
        alt={altText}
      />
    </div>

  if (isSending) {
    return (
      <div className={wrapperProps.relative}>
        {imageElement('sent_image')}
        <div className={wrapperProps.imageLoadingContent}>
          <CircularProgress className={wrapperProps.circularProgress} size={25} thickness={6} />
        </div>
      </div>
    )
  }

  return imageElement('download_image')
}

const getImagesFromMediaAssets = ({
  imageComponentStates,
  mediaAssets,
  isLoadingError,
  onRetry,
  isSending,
  downloadLoadedHandling,
  downloadErrorHandling,
  handleOnClickFullImageOpen,
}: GetImagesFromMediaAssetsProps): JSX.Element[] => (
  Object.keys(mediaAssets).reduce((images: JSX.Element[], assetUuid: string) => {
    const asset: MediaAssetParsedData | undefined = mediaAssets[assetUuid]

    const onRetryMedia = async (): Promise<void> => onRetry(assetUuid)
    const onDownloadLoaded = (): void | null => downloadLoadedHandling(assetUuid)
    const onDownloadError = (): void => downloadErrorHandling(assetUuid)
    const onClickFullImageOpen = async (): Promise<void> => handleOnClickFullImageOpen(assetUuid)

    if (asset !== undefined && asset.styleWrapperProps !== undefined) {

      if (imageComponentStates[assetUuid]?.showLoading) {
        return [...images,
          <LoadingComponent
            key={`${assetUuid}-loading`}
            wrapperProps={asset.styleWrapperProps}
            onLoadAction={onDownloadLoaded}
            onErrorAction={onDownloadError}
          />]
      }

      if (imageComponentStates[assetUuid]?.showError) {
        return [...images,
          <ErrorComponent
            key={`${assetUuid}-error`}
            wrapperProps={asset.styleWrapperProps}
            showImage={imageComponentStates[assetUuid]?.showImage ?? false}
            loadingError={isLoadingError}
            onErrorAction={onDownloadError}
            onClickAction={onRetryMedia}
          />]
      }

      if (imageComponentStates[assetUuid]?.showImage) {
        return [...images,
          <ImageComponent
            key={`${assetUuid}-image`}
            wrapperProps={asset.styleWrapperProps}
            isSending={isSending}
            onLoadAction={onDownloadLoaded}
            onErrorAction={onDownloadError}
            onClickAction={onClickFullImageOpen} />]
      }
    }

    return images
  }, [])
)

export const ImageMessageCardComponent: React.FC<ImageMessageCardComponentProps> = ({
  gridStyle,
  containerStyle,
  textStyle,
  text,
  ...props
}: ImageMessageCardComponentProps) => {

  const getImages: () => JSX.Element[] = useCallback(
    () => getImagesFromMediaAssets(props),
    [props.isLoadingError, props.isSending, props.mediaAssets, props.imageComponentStates]
  )

  return (
    <div className={containerStyle}>
      {text !== undefined && !isEmpty(text.trim()) && <div className={textStyle}>
        <ReactLinkify componentDecorator={linkComponentDecorator}>
          {text}
        </ReactLinkify>
      </div>}
      <div className={gridStyle}>
        { getImages() }
      </div>
    </div>
  )
}
