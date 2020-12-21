import {
  useChatMessageHooks,
  areMessagesFromSameAuthor,
  getIsGroupFirstMessage,
  getIsGroupMiddleMessage,
  getIsGroupLastMessage,
  getIsSystemMessage,
  areMessagesFromOtherSides,
  areTimestampSeparatedMessages,
  getTimestamp,
  getAdminSuffix,
} from './message_grouping_hooks'
import { renderHook, RenderHookResult, act } from '@testing-library/react-hooks'
import { messageDataMock } from '../../../../../tests/mocks/messages_mock'
import { publicIdentityMock, randomIdentityMock } from '../../../../../tests/mocks/identity_mock'
import { MuiThemeProvider } from '@material-ui/core'
import { mainTheme } from '../../../../assets/themes'
import React, { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { store } from '../../../../store'
import { ChatMessageHooksProps, ChatMessageHooksResponse, MessageContext } from './interfaces'
import { MessageData } from '../../../../store/interfaces'
import { MessageType } from '../interfaces'
import { getString } from '../../../../utils'

const getTestMessageContext = (message: MessageData = messageDataMock, prevMessage?: MessageData, nextMessage?: MessageData): MessageContext => ({
  prevMessage: prevMessage ?? null,
  message,
  nextMessage: nextMessage ?? null,
})

describe('Message grouping hooks', () => {

  const parsedTimestamp: RegExp = /June 14th, ..:42 pm/

  describe('useChatMessageHooks', () => {

    let renderResult: RenderHookResult<ChatMessageHooksProps, ChatMessageHooksResponse>

    const chatMessageHooksProps: ChatMessageHooksProps = {
      messageContext: getTestMessageContext(),
      me: randomIdentityMock,
      author: publicIdentityMock,
      admin: 'admin',
      hideOwner: false,
    }

    const renderChatHook = async (props: Partial<ChatMessageHooksProps> = chatMessageHooksProps): Promise<void> => {
      await act(async () => {
        renderResult = renderHook(useChatMessageHooks, {
          initialProps: {
            ...chatMessageHooksProps,
            ...props,
          },
          wrapper: ({ children }: PropsWithChildren<{}>) => (
            <MuiThemeProvider theme={mainTheme}>
              <Provider store={store}>
                {children}
              </Provider>
            </MuiThemeProvider>
          ),
        })
      })
    }

    it('should return display name when message is first in a group and I am not the author', async () => {
      await renderChatHook()

      const displayName: JSX.Element | null = renderResult.result.current.displayName

      expect(displayName?.props.children).toContain(publicIdentityMock.gid_name)
    })

    it('should return display name with owner tag when author is owner', async () => {
      await renderChatHook({admin: '6196ffd4-d433-49d2-a658-6ca9122ffe32'})

      const displayName: JSX.Element | null = renderResult.result.current.displayName

      expect(displayName?.props.children).toContain(getString('group-owner'))
    })

    it('should return display name without owner tag when author is owner but is hidden', async () => {
      await renderChatHook({admin: '6196ffd4-d433-49d2-a658-6ca9122ffe32', hideOwner: true})

      const displayName: JSX.Element | null = renderResult.result.current.displayName

      expect(displayName?.props.children).not.toContain(getString('group-owner'))
    })

    it('should return null as display name when message is first in a group and I am the author', async () => {
      await renderChatHook({
        me: publicIdentityMock,
      })

      const displayName: JSX.Element | null = renderResult.result.current.displayName

      expect(displayName).toBeNull()
    })

    it('should return null as display name when message is not first in a group and I am not the author', async () => {
      await renderChatHook({
        messageContext: getTestMessageContext(messageDataMock, messageDataMock),
      })

      const displayName: JSX.Element | null = renderResult.result.current.displayName

      expect(displayName).toBeNull()
    })

    it('should return avatar when message is last in a group and I am not the author', async () => {
      await renderChatHook()

      const avatar: JSX.Element | null = renderResult.result.current.avatar

      expect(avatar?.props.children.props.src).toContain(publicIdentityMock.display_image_url)
    })

    it('should not return avatar when message is last in a group and I am the author', async () => {
      await renderChatHook({
        me: publicIdentityMock,
      })

      const avatar: JSX.Element | null = renderResult.result.current.avatar

      expect(avatar).toBeNull()
    })

    it('should not return avatar when message is not last in a group and I am not the author', async () => {
      await renderChatHook({
        messageContext: getTestMessageContext(messageDataMock, undefined, messageDataMock),
      })

      const avatar: JSX.Element | null = renderResult.result.current.avatar

      expect(avatar).toBeNull()
    })

    it('should return timestamp when there is no previous message', async () => {
      await renderChatHook()

      const timestamp: JSX.Element | null = renderResult.result.current.timestamp

      expect(timestamp?.props.children).toMatch(parsedTimestamp)
    })

    it('should return timestamp when prev message is created more than 15 minutes ago', async () => {
      await renderChatHook({
        messageContext: getTestMessageContext(messageDataMock, {
          ...messageDataMock,
          author: 'not me :D',
          created_at: '2020-06-14T19:25:33.905Z',
        }),
      })

      const timestamp: JSX.Element | null = renderResult.result.current.timestamp

      expect(timestamp?.props.children).toMatch(parsedTimestamp)
    })

    it('should return timestamp as null when prev message is created less than 15 minutes ago and not inside group', async () => {
      await renderChatHook({
        messageContext: getTestMessageContext(messageDataMock, {
          ...messageDataMock,
          author: 'not me :D',
          created_at: '2020-06-14T19:35:33.905Z',
        }),
      })

      const timestamp: JSX.Element | null = renderResult.result.current.timestamp

      expect(timestamp).toBeNull()
    })

    it('should return timestamp as null when prev message inside group', async () => {
      await renderChatHook({
        messageContext: getTestMessageContext(messageDataMock, messageDataMock),
      })

      const timestamp: JSX.Element | null = renderResult.result.current.timestamp

      expect(timestamp).toBeNull()
    })
  })

  describe('areMessagesFromSameAuthor', () => {
    it('should return true when messages have same author', () => {
      expect(areMessagesFromSameAuthor(messageDataMock, messageDataMock)).toEqual(true)
    })

    it('should return false when messages have different author', () => {
      expect(areMessagesFromSameAuthor(messageDataMock, {
        ...messageDataMock,
        author: 'different-author',
      })).toEqual(false)
    })

    it('should return false when second message is null', () => {
      expect(areMessagesFromSameAuthor(messageDataMock, null)).toEqual(false)
    })

    it('should return false when first message is null', () => {
      expect(areMessagesFromSameAuthor(null, messageDataMock)).toEqual(false)
    })
  })

  describe('getIsGroupFirstMessage', () => {
    it('should return true when prev message has different author', () => {
      expect(getIsGroupFirstMessage({
        ...messageDataMock,
        author: 'different-author',
      }, messageDataMock)).toEqual(true)
    })

    it('should return true when prev message is null', () => {
      expect(getIsGroupFirstMessage(null, messageDataMock)).toEqual(true)
    })

    it('should return false when prev message has same author', () => {
      expect(getIsGroupFirstMessage(messageDataMock, messageDataMock)).toEqual(false)
    })
  })

  describe('getIsGroupMiddleMessage', () => {
    it('should return true when prev and next messages have same author', () => {
      expect(getIsGroupMiddleMessage(messageDataMock, messageDataMock, messageDataMock)).toEqual(true)
    })

    it('should return false when prev message has different author', () => {
      expect(getIsGroupMiddleMessage({
        ...messageDataMock,
        author: 'different-author',
      }, messageDataMock, messageDataMock)).toEqual(false)
    })

    it('should return false when next message has different author', () => {
      expect(getIsGroupMiddleMessage(messageDataMock, messageDataMock, {
        ...messageDataMock,
        author: 'different-author',
      })).toEqual(false)
    })

    it('should return false when prev message is null', () => {
      expect(getIsGroupMiddleMessage(null, messageDataMock, messageDataMock)).toEqual(false)
    })

    it('should return false when next message is null', () => {
      expect(getIsGroupMiddleMessage(messageDataMock, messageDataMock, null)).toEqual(false)
    })
  })

  describe('getIsGroupLastMessage', () => {
    it('should return true when next message has different author', () => {
      expect(getIsGroupLastMessage(messageDataMock, {
        ...messageDataMock,
        author: 'different-author',
      })).toEqual(true)
    })

    it('should return true when next message is null', () => {
      expect(getIsGroupLastMessage(messageDataMock, null)).toEqual(true)
    })

    it('should return false when next message has same author', () => {
      expect(getIsGroupLastMessage(messageDataMock, messageDataMock)).toEqual(false)
    })
  })

  describe('getIsSystemMessage', () => {
    it('should return true when prev message is system message', () => {
      expect(getIsSystemMessage({
        ...messageDataMock,
        type: MessageType.SYSTEM,
      })).toEqual(true)
    })

    it('should return false when prev message is null', () => {
      expect(getIsSystemMessage(null)).toEqual(false)
    })

    it('should return false when prev message is not system message', () => {
      expect(getIsSystemMessage(messageDataMock)).toEqual(false)
    })
  })

  describe('areTimestampSeparatedMessages', () => {
    it('should true when prev message is null', () => {
      expect(areTimestampSeparatedMessages(null, messageDataMock)).toEqual(true)
    })

    it('should false when prev message is from the same author', () => {
      expect(areTimestampSeparatedMessages(messageDataMock, messageDataMock)).toEqual(false)
    })

    it('should true when prev message and current messages are more than 15 apart', () => {
      expect(areTimestampSeparatedMessages({
        ...messageDataMock,
        author: 'not-me',
        created_at: '2020-06-14T19:25:33.905Z',
      }, messageDataMock)).toEqual(true)
    })

    it('should false when prev message and current messages are less than 15 apart', () => {
      expect(areTimestampSeparatedMessages({
        ...messageDataMock,
        author: 'not-me',
        created_at: '2020-06-14T19:35:33.905Z',
      }, messageDataMock)).toEqual(false)
    })
  })

  describe('areMessagesFromOtherSides', () => {
    it('should return true when current message author is me and prev message author is not me', () => {
      expect(areMessagesFromOtherSides(messageDataMock, {
        ...messageDataMock,
        author: 'me',
      }, 'me')).toEqual(true)
    })

    it('should return false when prev message author is me and current message author is not me', () => {
      expect(areMessagesFromOtherSides({
        ...messageDataMock,
        author: 'me',
      }, messageDataMock, 'me')).toEqual(true)
    })

    it('should return false when messages are from me as a author', () => {
      expect(areMessagesFromOtherSides(messageDataMock, messageDataMock, messageDataMock.author)).toEqual(false)
    })

    it('should return false when messages are from different author', () => {
      expect(areMessagesFromOtherSides(messageDataMock, messageDataMock, 'random logged in identity')).toEqual(false)
    })
  })

  describe('getTimestamp', () => {
    it('should return true when current message author is me and prev message author is not me', () => {
      expect(getTimestamp(messageDataMock)).toMatch(parsedTimestamp)
    })
  })

  describe('getAdminSuffix', () => {
    it('should return owner string when owner is defined', () => {
      expect(getAdminSuffix('admin', false)).toEqual(` ${getString('group-owner')}`)
    })

    it('should return empty string when owner is defined but hidden', () => {
      expect(getAdminSuffix('admin', true)).toEqual('')
    })

    it('should return empty string when owner is not defined', () => {
      expect(getAdminSuffix(undefined, true)).toEqual('')
    })
  })
})
