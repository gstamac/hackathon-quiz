import { useMessageState, MessageStateHooksProps } from './use_message_state'
import {
  messageDataMock,
  messageMediaMock,
  messageMock,
  messageNotDelieveredMock,
} from '../../../../../tests/mocks/messages_mock'
import { act, HookResult } from '@testing-library/react-hooks'
import * as messagingApi from '../../../../services/api/messaging_api'
import * as fileServiceApi from '../../../../services/api/file_service_api'
import * as helpers from './helpers'
import * as messages_utils from '../../../../utils/messages_utils'
import { setToastSuccess, setToastError } from 'globalid-react-ui'
import * as redux from 'react-redux'
import { getString } from '../../../../utils'
import { CommonImageMediaType, MessageStateHookResult } from './interfaces'
import { getParsedImageMessageContent } from './image_media_helpers'
import { testCustomHook, TestCustomHookType } from '../../../../../tests/test_utils'

jest.mock('../../../../services/api/messaging_api')
jest.mock('../../../../services/api/file_service_api')
jest.mock('./helpers')

describe('Message state hooks', () => {
  const deleteMessageFromChannelMock: jest.Mock = jest.fn()
  const deleteImageAssetMock: jest.Mock = jest.fn()
  const toastHandlerMock: jest.Mock = jest.fn()
  const useDispatcherMock: jest.Mock = jest.fn()
  const dispatcherMock: jest.Mock = jest.fn()
  const sendMessageToChannelMock: jest.Mock = jest.fn()

  beforeAll(async () => {
    (messagingApi.deleteMessageFromChannel as jest.Mock) = deleteMessageFromChannelMock;
    (fileServiceApi.deleteImageAsset as jest.Mock) = deleteImageAssetMock;
    (helpers.toastHandler as jest.Mock) = toastHandlerMock;
    (redux.useDispatch as jest.Mock) = useDispatcherMock;
    (messages_utils.sendMessageToChannel as jest.Mock) = sendMessageToChannelMock
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    useDispatcherMock.mockReturnValue(dispatcherMock)
    toastHandlerMock.mockReturnValue({})
  })

  const messageStateHooksProps: MessageStateHooksProps = {
    hasOptions: true,
    iAmAuthor: true,
    message: messageDataMock,
    encryptedChannelSecret: 'string',
    isHiddenMember: false,
  }

  const renderChatHook: TestCustomHookType<MessageStateHooksProps, MessageStateHookResult>
   = testCustomHook(useMessageState, messageStateHooksProps, {})

  describe('useMessageStateHooks', () => {
    it('should open and close delete message dialog',async () => {
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook(messageStateHooksProps)

      await act(async () => {
        renderResult.current.quickMenu?.props.items[0].onClick()
      })

      expect(renderResult.current.deleteMessageDialog?.props.open).toEqual(true)

      await act(async () => {
        renderResult.current.deleteMessageDialog?.props.onExit()
      })

      expect(renderResult.current.deleteMessageDialog?.props.open).toEqual(false)
    })

    it('should handle delete message and show success toast',async () => {
      deleteMessageFromChannelMock.mockResolvedValue([messageMock])
      const renderResult: HookResult<MessageStateHookResult> =
      await renderChatHook(messageStateHooksProps)

      await act(async () => {
        renderResult.current.deleteMessageDialog?.props.handleDelete()
      })

      expect(deleteMessageFromChannelMock).toHaveBeenCalledWith([messageDataMock.id])
      expect(toastHandlerMock).toHaveBeenCalledWith(
        dispatcherMock,
        setToastSuccess,
        getString('delete-message-success-title'),
        getString('delete-message-success-description')
      )
    })

    it('should handle delete media message and show success toast',async () => {
      deleteMessageFromChannelMock.mockResolvedValue([messageMediaMock])
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook({ ...messageStateHooksProps, message: messageMediaMock})

      await act(async () => {
        renderResult.current.deleteMessageDialog?.props.handleDelete()
      })

      const parsedMessageContent: CommonImageMediaType = getParsedImageMessageContent(messageMediaMock.content) as CommonImageMediaType

      expect(deleteMessageFromChannelMock).toHaveBeenCalledWith([messageMediaMock.id])
      expect(deleteImageAssetMock).toHaveBeenCalledWith(parsedMessageContent.assets[0].uuid)
      expect(toastHandlerMock).toHaveBeenCalledWith(
        dispatcherMock,
        setToastSuccess,
        getString('delete-message-success-title'),
        getString('delete-message-success-description')
      )
    })

    it('should handle delete message and show error toast when empty response',async () => {
      deleteMessageFromChannelMock.mockResolvedValue([])
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook(messageStateHooksProps)

      await act(async () => {
        renderResult.current.deleteMessageDialog?.props.handleDelete()
      })

      expect(deleteMessageFromChannelMock).toHaveBeenCalledWith([messageDataMock.id])
      expect(toastHandlerMock).toHaveBeenCalledWith(
        dispatcherMock,
        setToastError,
        getString('delete-message-error-title'),
        getString('delete-message-error-description')
      )
    })

    it('should handle delete message and show error toast when delete throws error',async () => {
      deleteMessageFromChannelMock.mockRejectedValue(new Error())
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook(messageStateHooksProps)

      await act(async () => {
        renderResult.current.deleteMessageDialog?.props.handleDelete()
      })

      expect(deleteMessageFromChannelMock).toHaveBeenCalledWith([messageDataMock.id])
      expect(toastHandlerMock).toHaveBeenCalledWith(
        dispatcherMock,
        setToastError,
        getString('delete-message-error-title'),
        getString('delete-message-error-description')
      )
    })

    it('Should show and hide user settings',async () => {
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook(messageStateHooksProps)

      await act(async () => {
        renderResult.current.showUserSettingsIcon()
      })

      expect(renderResult.current.optionsIcon).not.toBeNull()

      await act(async () => {
        renderResult.current.hideUserSettingsIcon()
      })

      expect(renderResult.current.optionsIcon).toBeNull()
    })

    it('should resend message',async () => {
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook({ ...messageStateHooksProps, message: messageNotDelieveredMock })

      await act(async () => {
        await renderResult.current.resendMessage?.()
      })

      expect(sendMessageToChannelMock).toHaveBeenCalledWith(
        messageNotDelieveredMock.parsedContent,
        messageNotDelieveredMock.channel_id,
        messageNotDelieveredMock.author,
        {
          resending: true,
          uuid: messageNotDelieveredMock.uuid,
        },
        messageStateHooksProps.encryptedChannelSecret)
    })

    it('should not show user settings when you are not author',async () => {
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook({ ...messageStateHooksProps, iAmAuthor: false })

      await act(async () => {
        renderResult.current.showUserSettingsIcon()
      })

      expect(renderResult.current.optionsIcon).toBeNull()
    })

    it('Should open quickMenu onClick from optionsIcon',async () => {
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook(messageStateHooksProps)

      await act(async () => {
        renderResult.current.showUserSettingsIcon()
      })

      expect(renderResult.current.optionsIcon).not.toBeNull()

      await act(async () => {
        renderResult.current.optionsIcon?.props.onClick()
      })

      expect(renderResult.current.quickMenu?.props.open).toBe(true)
    })

    it('Should not return optionsIcon when isHiddenMember props is true', async () => {
      const renderResult: HookResult<MessageStateHookResult> =
       await renderChatHook(messageStateHooksProps)

      expect(renderResult.current.optionsIcon).toBeNull()
    })
  })
})
