import React from 'react'
import { ImageMessageCardComponent } from './image_message_card_components'
import { RenderResult, render } from '../../../../../tests/test_utils'
import { ImageMessageCardComponentProps, ImageDisplayWrapperProps, ImageComponentState, MediaAssetParsedData, ImageState, MediaAssets } from './interfaces'
import { assetImageMock, assetEncryptedImageMock } from '../../../../../tests/mocks/messages_mock'
import { GeneralObject } from '../../../../utils/interfaces'
import { act } from 'react-dom/test-utils'

describe('Image Message Card Components', () => {

  let renderResult: RenderResult

  const onRetrySendMock: jest.Mock = jest.fn()
  const onRetryMock: jest.Mock = jest.fn()
  const downloadLoadedHandlingMock: jest.Mock = jest.fn()
  const downloadErrorHandlingMock: jest.Mock = jest.fn()
  const handleOnClickFullImageOpenMock: jest.Mock = jest.fn()

  const defaultAssetUuid: string = assetImageMock.uuid

  const styleWrapperProps: ImageDisplayWrapperProps = {
    imageContainer: 'imageContainer',
    imageGridContainer: 'imageGridContainer',
    imageLoadingContent: 'imageLoadingContent',
    imageMessageContent: 'imageMessageContent',
    imageStyling: 'imageStyling',
    infoIconForeground: 'string',
    imageSrc: 'imageSrc',
    background: 'background',
    circularProgress: 'circularProgress',
    relative: 'relative',
    warningIcon: 'warningIcon',
    placeholderBackground: 'placeholderBackground',
  }

  const mediaAssetParsed: MediaAssetParsedData = {
    index: 0,
    imageState: ImageState.LOADED,
    mediaAsset: assetImageMock,
    encryptedMediaAsset: assetEncryptedImageMock,
    styleWrapperProps,
  }

  const initialImageComponentState: ImageComponentState = {
    showError: false,
    showImage: false,
    showLoading: false,
  }

  const mediaAssets: MediaAssets = {
    [defaultAssetUuid]: mediaAssetParsed,
  }

  const imageComponentStates: GeneralObject<ImageComponentState> = {
    [defaultAssetUuid]: initialImageComponentState,
  }

  const componentProps: ImageMessageCardComponentProps = {
    text: undefined,
    containerStyle: 'containerStyle',
    gridStyle: 'gridStyle',
    textStyle: 'textStyle',
    mediaAssets,
    imageComponentStates,
    isLoadingError: false,
    isSending: false,
    onRetrySend: onRetrySendMock,
    onRetry: onRetryMock,
    downloadLoadedHandling: downloadLoadedHandlingMock,
    downloadErrorHandling: downloadErrorHandlingMock,
    handleOnClickFullImageOpen: handleOnClickFullImageOpenMock,
  }

  const getImageMessageCardComponentProps = (
    assetUuid: string = defaultAssetUuid,
    imageComponentState: ImageComponentState,
    props?: Partial<ImageMessageCardComponentProps>
  ): ImageMessageCardComponentProps => ({
    ...componentProps,
    imageComponentStates: {
      [assetUuid]: imageComponentState,
    },
    ...props,
  })

  const renderComponent = (imageComponentState: Partial<ImageComponentState>, props?: Partial<ImageMessageCardComponentProps>): void => {
    act(() => {
      renderResult = render(<ImageMessageCardComponent {...getImageMessageCardComponentProps(defaultAssetUuid, {
        ...initialImageComponentState,
        ...imageComponentState,
      }, props)} />)
    })
  }

  it('should render loading component when showLoading is passed as true in imageComponentState', () => {
    renderComponent({
      showLoading: true,
    })

    expect(renderResult.queryByTestId('loading-component')).not.toBeNull()
  })
  it('should render image component when showImage is passed as true in imageComponentState', () => {
    renderComponent({
      showImage: true,
    })

    expect(renderResult.queryByAltText('download_image')).not.toBeNull()
  })
  it('should render error component when showError is passed as true in imageComponentState', () => {
    renderComponent({
      showError: true,
    })

    expect(renderResult.queryByTestId('error-component')).not.toBeNull()
  })
  it('should render multiple image components', () => {
    renderComponent({
      showImage: true,
    }, {
      mediaAssets: {
        assetUuid1: mediaAssetParsed,
        assetUuid2: mediaAssetParsed,
        assetUuid3: mediaAssetParsed,
      },
      imageComponentStates: {
        assetUuid1: { ...initialImageComponentState, showImage: true },
        assetUuid2: { ...initialImageComponentState, showImage: true },
        assetUuid3: { ...initialImageComponentState, showImage: true },
      },
    })

    expect(renderResult.queryAllByAltText('download_image')).toHaveLength(3)
  })
})
