import { cleanup, RenderResult } from '@testing-library/react'
import React from 'react'
import ReactTestUtils from 'react-dom/test-utils'
import { fileTokenMock } from '../../../../../tests/mocks/channels_mock'
import { publicIdentityMock, randomIdentityMock } from '../../../../../tests/mocks/identity_mock'
import {
  messageDataMock,
  messageDownloadImageMock,
  messageSendImageMock,
  assetImageMock,
  assetEncryptedImageMock,
} from '../../../../../tests/mocks/messages_mock'
import { act, fireEvent, render, userEvent } from '../../../../../tests/test_utils'
import * as avatar_api from '../../../../services/api/avatar_api'
import * as identity_api from '../../../../services/api/identity_api'
import * as messages_utils from '../../../../utils/messages_utils'
import { store, ThunkDispatch } from '../../../../store'
import { fetchMembers, setFileToken } from '../../../../store/channels_slice/channels_slice'
import { ChannelType, MessageData } from '../../../../store/interfaces'
import * as utils from '../../../../utils'
import { ImageMessageCard } from './image_message_card'
import { BaseMessageCardProps, MessageContext, ImageMessageCardAdornmentProps, ImageMessageCardComponentProps, MediaAssets, ImageComponentState, ImageState, MediaAssetParsedData, UseImageMessageCardHooksResponse, ImageDisplayWrapperProps } from './interfaces'
import * as hooks from './use_image_message_card'
import { GeneralObject } from '../../../../utils/interfaces'
import * as messagingApi from '../../../../services/api/messaging_api'
import * as fileServiceApi from '../../../../services/api/file_service_api'

jest.mock('../../../../services/api/messaging_api')
jest.mock('../../../../services/api/file_service_api')
jest.mock('../../../../utils')
jest.mock('../../../../services/api/avatar_api')
jest.mock('../../../../services/api/identity_api')
jest.mock('../../../../utils/messages_utils')
jest.mock('./use_image_message_card')

const getTestMessageContext = (message: MessageData = messageDownloadImageMock, prevMessage?: MessageData, nextMessage?: MessageData): MessageContext => ({
  prevMessage: prevMessage ?? null,
  message,
  nextMessage: nextMessage ?? null,
})

const { getString } = jest.requireActual('../../../../utils')

describe('Image message card', () => {
  let renderResult: RenderResult

  const getAvatarMock: jest.Mock = jest.fn()
  const getIdentitiesListMock: jest.Mock = jest.fn()
  const sendImageToChannelMock: jest.Mock = jest.fn()
  const getImageFromAwsMock: jest.Mock = jest.fn()
  const setTokenMock: jest.Mock = jest.fn()

  const deleteMessageFromChannelMock: jest.Mock = jest.fn()
  const deleteImageAssetMock: jest.Mock = jest.fn()

  const onAdornmentClickMock: jest.Mock = jest.fn()
  const onRetrySendMock: jest.Mock = jest.fn()
  const onRetryMock: jest.Mock = jest.fn()
  const downloadLoadedHandlingMock: jest.Mock = jest.fn()
  const downloadErrorHandlingMock: jest.Mock = jest.fn()
  const handleOnClickFullImageOpenMock: jest.Mock = jest.fn()

  const assetUuid: string = assetImageMock.uuid

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
    imageState: ImageState.LOADING,
    mediaAsset: assetImageMock,
    encryptedMediaAsset: assetEncryptedImageMock,
    styleWrapperProps,
  }

  const imageComponentState: ImageComponentState = {
    showError: false,
    showImage: false,
    showLoading: true,
  }

  const mediaAssets: MediaAssets = {
    [assetUuid]: mediaAssetParsed,
  }

  const imageComponentStates: GeneralObject<ImageComponentState> = {
    [assetUuid]: imageComponentState,
  }

  const adornmentProps: ImageMessageCardAdornmentProps = {
    resending: false,
    errorMessage: undefined,
    onAdornmentClick: onAdornmentClickMock,
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

  const imageHookData: UseImageMessageCardHooksResponse = {
    classes: {},
    adornmentProps,
    componentProps,
  }

  const useImageMessageCardHooksMock: jest.Mock = jest.fn()

  const props: BaseMessageCardProps = {
    me: publicIdentityMock,
    author: randomIdentityMock,
    admin: publicIdentityMock.gid_uuid,
    messageContext: getTestMessageContext(messageDownloadImageMock, messageDataMock, messageDataMock),
    channelType: ChannelType.PERSONAL,
    seen: false,
    hideOwner: false,
  }

  const renderImageMessage = async (partialProps?: Partial<BaseMessageCardProps>): Promise<void> => {
    await act(async () => {
      renderResult = render(<ImageMessageCard {...{
        ...props,
        ...partialProps,
      }} />)
    })
  }

  beforeEach(async () => {
    (utils.setAccessToken as jest.Mock) = setTokenMock;
    (messagingApi.deleteMessageFromChannel as jest.Mock) = deleteMessageFromChannelMock;
    (fileServiceApi.deleteImageAsset as jest.Mock) = deleteImageAssetMock;
    (utils.getString as jest.Mock) = getString;
    (avatar_api.getAvatar as jest.Mock) = getAvatarMock;
    (identity_api.getIdentitiesList as jest.Mock) = getIdentitiesListMock;
    (messages_utils.sendImageToChannel as jest.Mock) = sendImageToChannelMock;
    (utils.getImageFromAws as jest.Mock) = getImageFromAwsMock;

    (hooks.useImageMessageCard as jest.Mock) = useImageMessageCardHooksMock

    getIdentitiesListMock.mockResolvedValue([randomIdentityMock, publicIdentityMock])
    getAvatarMock.mockResolvedValue('avatar-uuid')
    getImageFromAwsMock.mockReturnValue('https://dev-messaging-files.global.id/36894/37a9424c-30fb-4530-b105-30dcba119d8d_small.png')

    store.dispatch(setFileToken({
      key: '33130',
      value: fileTokenMock,
    }))

    await (store.dispatch as ThunkDispatch)(fetchMembers({
      channel_id: 'channel_id',
      member_ids: [randomIdentityMock.gid_uuid, publicIdentityMock.gid_uuid],
    }))

    useImageMessageCardHooksMock.mockReturnValue(imageHookData)
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render image message and call downloadLoadedHandlingMock on load', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
    })
    await renderImageMessage()

    const loadingElem: HTMLElement = renderResult.getByTestId('loading-component')
    const image: HTMLElement = renderResult.getByAltText('download_image')

    expect(loadingElem).not.toBeNull()
    expect(image).not.toBeNull()

    ReactTestUtils.Simulate.load(image)

    expect(downloadLoadedHandlingMock).toHaveBeenCalledTimes(1)
  })

  it('should render image message and call downloadErrorHandlingMock on load', async () => {
    await renderImageMessage()

    const loadingElem: HTMLElement = renderResult.getByTestId('loading-component')
    const image: HTMLElement = renderResult.getByAltText('download_image')

    expect(loadingElem).not.toBeNull()
    expect(image).not.toBeNull()

    ReactTestUtils.Simulate.error(image)

    expect(downloadErrorHandlingMock).toHaveBeenCalledTimes(1)
  })

  it('should render error download bubble with image when state is ERROR', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        imageComponentStates: {
          [assetUuid]: {
            showError: true,
            showImage: true,
            showLoading: false,
          },
        },
        mediaAssets: {
          [assetUuid]: {
            ...mediaAssetParsed,
            imageState: ImageState.ERROR,
          },
        },
      },
    })

    await renderImageMessage({
      messageContext: getTestMessageContext({
        ...messageSendImageMock,
        author: randomIdentityMock.gid_uuid,
      }),
    })

    const image: HTMLElement = renderResult.getByAltText('download_image')
    const errorElem: HTMLElement = renderResult.getByTestId('error-component')

    expect(image).not.toBeNull()
    expect(errorElem).not.toBeNull()
  })

  it('should render loading bubble with image on loading', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        imageComponentStates: {
          [assetUuid]: {
            showError: false,
            showImage: true,
            showLoading: true,
          },
        },
        mediaAssets: {
          [assetUuid]: {
            ...mediaAssetParsed,
            imageState: ImageState.LOADING,
          },
        },
      },
    })

    await renderImageMessage()

    const loadingElem: HTMLElement = renderResult.getByTestId('loading-component')
    const image: HTMLElement = renderResult.getByAltText('download_image')

    expect(loadingElem).not.toBeNull()
    expect(image).not.toBeNull()
  })

  it('should render loading bubble without image on loading', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        imageComponentStates: {
          [assetUuid]: {
            showError: false,
            showImage: true,
            showLoading: true,
          },
        },
        mediaAssets: {
          [assetUuid]: {
            ...mediaAssetParsed,
            imageState: ImageState.LOADING,
            styleWrapperProps: {
              ...styleWrapperProps,
              imageSrc: undefined,
            },
          },
        },
      },
    })

    await renderImageMessage()

    const loadingElem: HTMLElement = renderResult.getByTestId('loading-component')
    const image: HTMLElement | null = renderResult.queryByAltText('download_image')

    expect(loadingElem).not.toBeNull()
    expect(image).toBeNull()
  })

  it('should render image message send (by me)', async () => {

    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        isSending: true,
        imageComponentStates: {
          [assetUuid]: {
            showError: false,
            showImage: true,
            showLoading: false,
          },
        },
      },
    })

    await renderImageMessage()

    const imageCard: HTMLElement = renderResult.getByAltText('sent_image')

    expect(imageCard).not.toBeNull()
  })

  it('should render image message send (by me) with Delivered adornment', async () => {

    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        isSending: true,
        imageComponentStates: {
          [assetUuid]: {
            showError: false,
            showImage: true,
            showLoading: false,
          },
        },
      },
    })

    await renderImageMessage({
      messageContext: getTestMessageContext({
        ...messageSendImageMock,
        author: publicIdentityMock.gid_uuid,
      }),
    })

    const imageCard: HTMLElement = renderResult.getByAltText('sent_image')

    await act(async () => {
      ReactTestUtils.Simulate.load(imageCard)
    })

    const delivered: HTMLElement | null = renderResult.queryByText(getString('msg-delivered'))

    expect(imageCard).not.toBeNull()
    expect(delivered).not.toBeNull()
  })

  it('should render image message send (by me) with Seen adornment', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        isSending: true,
        imageComponentStates: {
          [assetUuid]: {
            showError: false,
            showImage: true,
            showLoading: false,
          },
        },
      },
    })

    await renderImageMessage({
      seen: true,
      messageContext: getTestMessageContext({
        ...messageSendImageMock,
        author: publicIdentityMock.gid_uuid,
      }),
    })

    const imageCard: HTMLElement = renderResult.getByAltText('sent_image')

    await act(async () => {
      ReactTestUtils.Simulate.load(imageCard)
    })

    const seen: HTMLElement | null = renderResult.queryByText(getString('msg-seen'))

    expect(imageCard).not.toBeNull()
    expect(seen).not.toBeNull()
  })

  it('should render error bubble for failed send', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        isSending: true,
        imageComponentStates: {
          [assetUuid]: {
            showError: true,
            showImage: true,
            showLoading: false,
          },
        },
      },
    })

    await renderImageMessage({
      messageContext: getTestMessageContext({
        ...messageSendImageMock,
        author: publicIdentityMock.gid_uuid,
        errored: true,
      }),
    })

    const errorElem: HTMLElement = renderResult.getByTestId('error-component')

    expect(errorElem).not.toBeNull()
  })

  it('should resend image and on retry show image with progress bar', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        isSending: true,
        imageComponentStates: {
          [assetUuid]: {
            showError: true,
            showImage: true,
            showLoading: false,
          },
        },
      },
    })

    sendImageToChannelMock.mockResolvedValue([messageSendImageMock])

    await renderImageMessage({
      messageContext: getTestMessageContext({
        ...messageSendImageMock,
        author: publicIdentityMock.gid_uuid,
        errored: true,
      }),
    })

    const errorElem: HTMLElement = renderResult.getByTestId('error-component')

    await act(async () => {
      userEvent.click(errorElem)
    })

    expect(onRetryMock).toHaveBeenCalledTimes(1)
  })

  it('should show settings icon when user hovers over his message', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        isSending: false,
        mediaAssets: {
          [assetUuid]: {
            ...mediaAssetParsed,
            imageState: ImageState.LOADED,
            styleWrapperProps: {
              ...styleWrapperProps,
              imageSrc: 'mediaAssetsUrl',
            },
          },
        },
        imageComponentStates: {
          [assetUuid]: {
            showError: false,
            showImage: true,
            showLoading: false,
          },
        },
      },
    })

    await renderImageMessage()

    const text: Element = renderResult.getByAltText('download_image')

    expect(text).toBeDefined()

    act(() => {
      fireEvent.mouseEnter(text)
    })

    const settingIcon: Element = renderResult.getByTestId('settings')

    expect(settingIcon).toBeDefined()
  })

  it('should open quickmenu with delete message option', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        isSending: false,
        mediaAssets: {
          [assetUuid]: {
            ...mediaAssetParsed,
            imageState: ImageState.LOADED,
            styleWrapperProps: {
              ...styleWrapperProps,
              imageSrc: 'mediaAssetsUrl',
            },
          },
        },
        imageComponentStates: {
          [assetUuid]: {
            showError: false,
            showImage: true,
            showLoading: false,
          },
        },
      },
    })

    await renderImageMessage()

    const text: Element = renderResult.getByAltText('download_image')

    act(() => {
      fireEvent.mouseEnter(text)
    })

    const settingIcon: Element = renderResult.getByTestId('settings')

    act(() => {
      userEvent.click(settingIcon)
    })

    const menu: Element = renderResult.getByRole('list')
    const menuItems: Element[] = renderResult.getAllByRole('menuitem')
    const menuItemText: Element = renderResult.getByText(getString('delete-message-title'))

    expect(menu).toBeDefined()
    expect(menuItems).toHaveLength(1)
    expect(menuItemText).toBeDefined()
  })

  it('should open delete message dialog and call an api to delete the message', async () => {
    useImageMessageCardHooksMock.mockReturnValue({
      ...imageHookData,
      componentProps: {
        ...componentProps,
        isSending: false,
        mediaAssets: {
          [assetUuid]: {
            ...mediaAssetParsed,
            imageState: ImageState.LOADED,
            styleWrapperProps: {
              ...styleWrapperProps,
              imageSrc: 'mediaAssetsUrl',
            },
          },
        },
        imageComponentStates: {
          [assetUuid]: {
            showError: false,
            showImage: true,
            showLoading: false,
          },
        },
      },
    })

    await renderImageMessage()

    const text: Element = renderResult.getByAltText('download_image')

    act(() => {
      fireEvent.mouseEnter(text)
    })

    const settingIcon: Element = renderResult.getByTestId('settings')

    act(() => {
      userEvent.click(settingIcon)
    })

    const menuItemText: Element = renderResult.getByText(getString('delete-message-title'))

    act(() => {
      userEvent.click(menuItemText)
    })

    const dialog: Element = renderResult.getByRole('dialog')
    const description: Element = renderResult.getByText(getString('delete-message-description'))
    const button: Element = renderResult.getByRole('button')

    expect(dialog).toBeDefined()
    expect(description).toBeDefined()
    expect(button).toBeDefined()

    await act(async () => {
      userEvent.click(button)
    })

    expect(deleteMessageFromChannelMock).toHaveBeenCalled()
    expect(deleteImageAssetMock).toHaveBeenCalled()
  })
})
