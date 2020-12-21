import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { render, act } from '../../../../tests/test_utils'
import * as messaging_api from '../../../services/api/messaging_api'
import { store, ThunkDispatch } from '../../../store'
import { getChannelResponseMock, get1on1ChannelResponseMock } from '../../../../tests/mocks/channels_mocks'
import { getChannelMessagesResponseMock, messageTextContentMock, messageMock, messageEncryptedMock, messageDownloadImageMock } from '../../../../tests/mocks/messages_mock'
import { identityMock, publicIdentityMock, randomIdentityMock, personalChatIdentityMock } from '../../../../tests/mocks/identity_mock'
import { ChatMessages } from './chat_messages'
import { setMembers, setChannel, setMemberIds, setFileToken } from '../../../store/channels_slice/channels_slice'
import { Message, MessageSeen, MessagesWithPaginationMeta, PaginationMetaParams } from '@globalid/messaging-service-sdk'
import { setChannelMessages, removeChannelMessages, setTyping } from '../../../store/messages_slice'
import { multiChannelWithThreeMembersMock, fileTokenMock, oneOnOneChannelMock } from '../../../../tests/mocks/channels_mock'
import { contentMock } from '../../../../tests/mocks/device_key_manager_mocks'
import { deviceKeyManager } from '../../../init'
import { Typing } from '@globalid/messaging-service-sdk/interfaces'
import { MESSAGES_PER_PAGE } from '../../../constants'

jest.mock('../../../services/api/messaging_api')
jest.mock('../../../init')

jest.mock('../../../constants', () => ({
  ...jest.requireActual<{}>('../../../constants'),
  INITIAL_MESSAGES_COUNT: 50,
}))

Element.prototype.scrollTo = () => ({})

const extendMessageMock = (message: Message, meta?: PaginationMetaParams): {
  data: {
      messages: Message[]
      message_seen: MessageSeen | null
  }
  meta: PaginationMetaParams
} => ({
  data: {
    ...getChannelMessagesResponseMock.data,
    messages: [
      ...getChannelMessagesResponseMock.data.messages,
      message,
    ],
  },
  meta: meta ?? ({
    total: 50,
    per_page: 50,
    page: 1,
  }),
})

describe('Chat messages tests', () => {

  describe('Group chat container tests', () => {

    let renderResult: RenderResult

    const getChannelMessagesMock: jest.Mock = jest.fn()

    const renderChatMessages = async (messagesWithSeen: MessagesWithPaginationMeta = getChannelMessagesResponseMock): Promise<void> => {
      await (store.dispatch as ThunkDispatch)(setChannel(getChannelResponseMock))

      await (store.dispatch as ThunkDispatch)(setChannelMessages({
        key: getChannelResponseMock.id,
        value: messagesWithSeen,
      }))

      await act(async () => {
        renderResult = render(<ChatMessages
          showOwner={true}
          isHiddenMember={false}
          me={publicIdentityMock}
          channelId={getChannelResponseMock.id}
        />)
      })
    }

    beforeAll(async () => {
      await (store.dispatch as ThunkDispatch)(setChannel(getChannelResponseMock))
      store.dispatch(setMembers([identityMock]));
      (messaging_api.getChannelMessages as jest.Mock) = getChannelMessagesMock

      getChannelMessagesMock.mockResolvedValue(getChannelMessagesResponseMock)
      await (store.dispatch as ThunkDispatch)(setChannelMessages({
        key: getChannelResponseMock.id,
        value: getChannelMessagesResponseMock,
      }))
    })

    afterEach(() => {
      cleanup()
      jest.resetAllMocks()
      store.dispatch(removeChannelMessages(getChannelResponseMock.id))
    })

    it('should call getChannelMessages on mount', async () => {
      await renderChatMessages(extendMessageMock(messageMock))
      expect(getChannelMessagesMock).toHaveBeenCalledWith(
        getChannelResponseMock.id,
        { page: 1, per_page: MESSAGES_PER_PAGE }
      )
    })

    it('should render begginning of history message', async () => {

      await renderChatMessages(extendMessageMock(messageMock))

      const beginningOfHistoryMessage: Element = renderResult.getByText('This is the beginning of the group channel history')

      expect(beginningOfHistoryMessage).toBeDefined()
    })

    it('should render text message', async () => {

      await renderChatMessages()

      const message: Element = renderResult.getByText(messageTextContentMock)

      expect(message).toBeDefined()
    })

    it('should render system message', async () => {

      const systemMessage: string = 'system message'
      const systemMessageContent: string = JSON.stringify({
        text: systemMessage,
      })

      await renderChatMessages(extendMessageMock({
        ...messageMock,
        type: 'SYSTEM',
        content: systemMessageContent,
        id: '1',
      }))

      const message: Element = renderResult.getByText(systemMessage)

      expect(message).toBeDefined()
    })

    it('should render your deleted message', async () => {

      const deletedMessage: string = 'Message was deleted by X'
      const deletedMessageContent: string = JSON.stringify({
        text: deletedMessage,
      })

      await renderChatMessages(extendMessageMock({
        ...messageMock,
        type: 'DELETED',
        deleted_by: publicIdentityMock.gid_uuid,
        content: deletedMessageContent,
        id: '2',
      }))

      const message: Element = renderResult.getByText(deletedMessage)

      expect(message).toBeDefined()
    })

    it('should render users deleted message', async () => {

      const deletedMessage: string = 'Message was deleted by X'
      const deletedMessageContent: string = JSON.stringify({
        text: deletedMessage,
      })

      await renderChatMessages(extendMessageMock({
        ...messageMock,
        type: 'DELETED',
        content: deletedMessageContent,
        id: '3',
      }))

      const message: Element = renderResult.getByText(deletedMessage)

      expect(message).toBeDefined()
    })

    it('should render message if author is not a participant', async () => {
      const textMessage: string = 'system message'
      const textMessageContent: string = JSON.stringify({
        text: textMessage,
      })

      await renderChatMessages(extendMessageMock({
        ...messageMock,
        content: textMessageContent,
        author: 'unknown-author',
        id: '4',
      }))

      const message: Element | null = renderResult.queryByText(textMessage)

      expect(message).not.toBeNull()
    })

    it('should render unsupported message card', async () => {
      const textMessage: string = 'system message'
      const textMessageContent: string = JSON.stringify({
        text: textMessage,
      })

      await renderChatMessages(extendMessageMock({
        ...messageMock,
        type: 'CARD_DUAL_VIEW',
        content: textMessageContent,
        id: '5',
      }))

      const message: Element | null = renderResult.queryByText(textMessage)
      const unsupportedMessageTip: Element = renderResult.getByText('View this message on your mobile device')

      expect(message).toBeNull()
      expect(unsupportedMessageTip).toBeDefined()
    })

    it('should render beginning of history message for group messages', async () => {

      await renderChatMessages(extendMessageMock(messageMock))

      const beginningOfHistoryMessage: Element = renderResult.getByText('This is the beginning of the group channel history')

      expect(beginningOfHistoryMessage).toBeDefined()
    })
  })

  describe('Multiple person chat container tests', () => {

    let renderResult: RenderResult

    const getChannelMessagesMock: jest.Mock = jest.fn()
    const decryptMock: jest.Mock = jest.fn()

    const renderChatMessages = async (messagesWithSeen: MessagesWithPaginationMeta = getChannelMessagesResponseMock): Promise<void> => {
      await (store.dispatch as ThunkDispatch)(setChannelMessages({
        key: multiChannelWithThreeMembersMock.id,
        value: messagesWithSeen,
      }))

      store.dispatch(setFileToken({
        key: multiChannelWithThreeMembersMock.id,
        value: fileTokenMock,
      }))

      await act(async () => {
        renderResult = render(<ChatMessages
          showOwner={true}
          isHiddenMember={false}
          me={personalChatIdentityMock}
          channelId={multiChannelWithThreeMembersMock.id}
        />)
      })
    }

    beforeAll(async () => {
      await (store.dispatch as ThunkDispatch)(setChannel(multiChannelWithThreeMembersMock))
      store.dispatch(setMembers([identityMock, randomIdentityMock]))
      store.dispatch(setMemberIds([identityMock.gid_uuid, randomIdentityMock.gid_uuid]))
      store.dispatch(setFileToken({
        key: '33130',
        value: fileTokenMock,
      }));
      (messaging_api.getChannelMessages as jest.Mock) = getChannelMessagesMock;
      (deviceKeyManager.decrypt as jest.Mock) = decryptMock

      getChannelMessagesMock.mockResolvedValue(getChannelMessagesResponseMock)
      await (store.dispatch as ThunkDispatch)(setChannelMessages({
        key: get1on1ChannelResponseMock.id,
        value: getChannelMessagesResponseMock,
      }))
    })

    beforeEach(() => {
      decryptMock.mockResolvedValue(contentMock)

      store.dispatch(removeChannelMessages(multiChannelWithThreeMembersMock.id))
    })

    afterEach(() => {
      cleanup()
      jest.resetAllMocks()
    })

    it('should render beginning of history message for multiple person chat', async () => {

      await renderChatMessages(extendMessageMock(messageMock))

      const beginningOfHistoryMessage: Element = renderResult.getByText(`This is the beginning of your chat history with ${identityMock.gid_name}, ${randomIdentityMock.gid_name}, ...`)

      expect(beginningOfHistoryMessage).toBeDefined()

      const e2eMessage: Element = renderResult.getByText('All your messages in this chat are private and protected by end-to-end encryption.')

      expect(e2eMessage).toBeDefined()

      const moreLink: Element = renderResult.getByText('Click to learn more')

      expect(moreLink).toBeDefined()
    })

    it('should render encrypted messages', async () => {
      await renderChatMessages(extendMessageMock(messageEncryptedMock))

      const message: Element = renderResult.getByText(contentMock)

      expect(message).toBeDefined()
    })

    it('should render image messages', async () => {
      await renderChatMessages(extendMessageMock(messageDownloadImageMock as Message))

      const image: Element = renderResult.getByAltText('download_image')

      expect(image).toBeDefined()
    })
  })

  describe('1on1 chat container tests', () => {

    let renderResult: RenderResult

    const getChannelMessagesMock: jest.Mock = jest.fn()
    const decryptMock: jest.Mock = jest.fn()

    const renderChatMessages = async (messagesWithSeen: MessagesWithPaginationMeta = getChannelMessagesResponseMock): Promise<void> => {
      await (store.dispatch as ThunkDispatch)(setChannelMessages({
        key: oneOnOneChannelMock.id,
        value: messagesWithSeen,
      }))

      store.dispatch(setFileToken({
        key: oneOnOneChannelMock.id,
        value: fileTokenMock,
      }))

      await act(async () => {
        renderResult = render(<ChatMessages
          showOwner={true}
          isHiddenMember={false}
          me={personalChatIdentityMock}
          channelId={oneOnOneChannelMock.id}
        />)
      })
    }

    beforeAll(async () => {
      await (store.dispatch as ThunkDispatch)(setChannel(oneOnOneChannelMock))
      store.dispatch(setMembers([identityMock, randomIdentityMock]))
      store.dispatch(setMemberIds([identityMock.gid_uuid, randomIdentityMock.gid_uuid]))
      store.dispatch(setFileToken({
        key: '33130',
        value: fileTokenMock,
      }));
      (messaging_api.getChannelMessages as jest.Mock) = getChannelMessagesMock;
      (deviceKeyManager.decrypt as jest.Mock) = decryptMock

      getChannelMessagesMock.mockResolvedValue(getChannelMessagesResponseMock)
      await (store.dispatch as ThunkDispatch)(setChannelMessages({
        key: get1on1ChannelResponseMock.id,
        value: getChannelMessagesResponseMock,
      }))
    })

    beforeEach(() => {
      decryptMock.mockResolvedValue(contentMock)

      store.dispatch(removeChannelMessages(oneOnOneChannelMock.id))
    })

    afterEach(() => {
      cleanup()
      jest.resetAllMocks()
    })

    it('should render beginning of history message for multiple person chat', async () => {

      await renderChatMessages(extendMessageMock(messageMock))

      const beginningOfHistoryMessage: Element = renderResult.getByText(`This is the beginning of your chat history with ${identityMock.gid_name}`)

      expect(beginningOfHistoryMessage).toBeDefined()

      const e2eMessage: Element = renderResult.getByText('All your messages in this chat are private and protected by end-to-end encryption.')

      expect(e2eMessage).toBeDefined()

      const moreLink: Element = renderResult.getByText('Click to learn more')

      expect(moreLink).toBeDefined()
    })

    it('should render typing message and then dissapear', async () => {
      jest.useFakeTimers()
      await renderChatMessages(extendMessageMock(messageMock))

      const typing: Typing = {
        channel_id: oneOnOneChannelMock.id,
        author: randomIdentityMock.gid_uuid,
        started_at: (new Date()).toISOString(),
      }

      await act(async () => {
        store.dispatch(setTyping(typing))
      })

      let typingElem: Element | null = renderResult.queryByTestId('typing-animation')

      expect(typingElem).not.toBeNull()

      jest.runAllTimers()

      typingElem = renderResult.queryByTestId('typing-animation')
      expect(typingElem).toBeNull()
    })
  })
})
