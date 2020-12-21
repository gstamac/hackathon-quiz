import React from 'react'
import { publicIdentityMock, randomIdentityMock } from '../../../../../tests/mocks/identity_mock'
import {
  messageDataMock,
  messageNotDelieveredMock,
  messageTextContentMock,
} from '../../../../../tests/mocks/messages_mock'
import { act, cleanup, fireEvent, render, RenderResult, userEvent } from '../../../../../tests/test_utils'
import * as avatarApi from '../../../../services/api/avatar_api'
import * as identityApi from '../../../../services/api/identity_api'
import * as messagingApi from '../../../../services/api/messaging_api'
import * as messages_utils from '../../../../utils/messages_utils'
import { store, ThunkDispatch } from '../../../../store'
import { fetchMembers } from '../../../../store/channels_slice/channels_slice'
import { ChannelType, MessageData } from '../../../../store/interfaces'
import { getString } from '../../../../utils'
import { MessageContext, MessageDataParsed, TextMessageCardProps } from './interfaces'
import { TextMessageCard } from './text_message_card'

jest.mock('../../../../services/api/avatar_api')
jest.mock('../../../../services/api/identity_api')
jest.mock('../../../../services/api/messaging_api')
jest.mock('../../../../utils/messages_utils')

const getTestMessageContext = (message: MessageDataParsed = messageDataMock, prevMessage?: MessageData, nextMessage?: MessageData): MessageContext<MessageDataParsed> => ({
  prevMessage: prevMessage ?? null,
  message,
  nextMessage: nextMessage ?? null,
})

describe('Text message card', () => {
  let renderResult: RenderResult

  const getAvatarMock: jest.Mock = jest.fn()
  const getIdentitiesListMock: jest.Mock = jest.fn()
  const deleteMessageMock: jest.Mock = jest.fn()
  const sendMessageMock: jest.Mock = jest.fn()

  const props: TextMessageCardProps = {
    me: publicIdentityMock,
    author: randomIdentityMock,
    admin: publicIdentityMock.gid_uuid,
    messageContext: getTestMessageContext(),
    channelType: ChannelType.PERSONAL,
    seen: false,
    hideOwner: false,
    isHiddenMember: false,
  }

  const renderTextMessage = async (partialProps?: Partial<TextMessageCardProps>): Promise<void> => {
    await act(async () => {
      renderResult = render(<TextMessageCard {...{
        ...props,
        ...partialProps,
      }} />)
    })
  }

  beforeAll(async () => {
    (avatarApi.getAvatar as jest.Mock) = getAvatarMock;
    (identityApi.getIdentitiesList as jest.Mock) = getIdentitiesListMock;
    (messagingApi.deleteMessageFromChannel as jest.Mock) = deleteMessageMock;
    (messages_utils.sendMessageToChannel as jest.Mock) = sendMessageMock

    getIdentitiesListMock.mockResolvedValue([randomIdentityMock, publicIdentityMock])
    getAvatarMock.mockResolvedValue('avatar-uuid')

    await (store.dispatch as ThunkDispatch)(fetchMembers({
      channel_id: 'channel_id',
      member_ids: [randomIdentityMock.gid_uuid, publicIdentityMock.gid_uuid],
    }))
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render text message (by me) with simple text', async () => {
    await renderTextMessage()

    const text: Element = renderResult.getByText(messageTextContentMock)

    expect(text).toBeDefined()
  })

  it('should render text message (by me) with Delivered adornment', async () => {
    await renderTextMessage()

    const text: Element = renderResult.getByText(messageTextContentMock)
    const delivered: Element = renderResult.getByText('Delivered')

    expect(text).toBeDefined()
    expect(delivered).toBeDefined()
  })

  it('should render text message (by me) with Seen adornment', async () => {
    await renderTextMessage({
      seen: true,
    })

    const text: Element = renderResult.getByText(messageTextContentMock)
    const seen: Element = renderResult.getByText('Seen')

    expect(text).toBeDefined()
    expect(seen).toBeDefined()
  })

  it('should render links in text message', async () => {
    const link: string = 'https://test.link'
    const parsedContent: string = `Msg with link ${link}`

    await renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        content: `{"text": "${parsedContent}"}`,
        parsedContent,
      }),
    })

    const text: Element = renderResult.getByText(/Msg with link.*/)
    const linkElement: Element = renderResult.getByText(link)

    expect(text).toBeDefined()
    expect(linkElement).toBeDefined()
    expect(linkElement?.getAttribute('href')).toEqual(link)
  })

  it('should render text message (by others) with simple text, avatar and display name', async () => {
    await renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        author: randomIdentityMock.gid_uuid,
      }),
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(randomIdentityMock.display_name)
    const text: Element = renderResult.getByText(messageTextContentMock)

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(text).toBeDefined()
  })

  it('should render text message (by others & owner) with simple text and display name', async () => {
    await renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        author: randomIdentityMock.gid_uuid,
      }),
      admin: randomIdentityMock.gid_uuid,
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(`${randomIdentityMock.display_name} ${getString('group-owner')}`)
    const text: Element = renderResult.getByText(messageTextContentMock)

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(text).toBeDefined()
  })

  it('should render text message admin without owner tag', async () => {
    await renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        author: randomIdentityMock.gid_uuid,
      }),
      admin: randomIdentityMock.gid_uuid,
      hideOwner: true,
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(`${randomIdentityMock.display_name}`)
    const text: Element = renderResult.getByText(messageTextContentMock)
    const ownerTag: Element | null = renderResult.queryByText(getString('group-owner'))

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(text).toBeDefined()
    expect(ownerTag).toBeNull()
  })

  it('should show settings icon when user hovers over his message', async () => {
    await renderTextMessage()

    const text: Element = renderResult.getByText(messageTextContentMock)

    expect(text).toBeDefined()

    act(() => {
      fireEvent.mouseEnter(text)
    })

    const settingIcon: Element = renderResult.getByTestId('settings')

    expect(settingIcon).toBeDefined()
  })

  it('should open quickmenu with delete message option', async () => {
    await renderTextMessage()

    const text: Element = renderResult.getByText(messageTextContentMock)

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
    await renderTextMessage()

    const text: Element = renderResult.getByText(messageTextContentMock)

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

    expect(deleteMessageMock).toHaveBeenCalled()
  })

  it('should not render quick menu options when isHiddenMember is true', async () => {
    await renderTextMessage({
      isHiddenMember: true,
    })

    const text: Element = renderResult.getByText(messageTextContentMock)

    act(() => {
      fireEvent.mouseEnter(text)
    })

    const settingIcon: Element | null = renderResult.queryByTestId('settings')

    expect(settingIcon).toBeNull()
  })

  describe('when message is not delivered and can be resent', () => {
    const notDeliveredText: string = 'Not delivered. Click to retry.'

    it('should show error adornment when message is not delivered', async () => {
      await renderTextMessage({
        messageContext: getTestMessageContext(messageNotDelieveredMock),
      })

      const notDeliveredTextElement: Element = renderResult.getByText(notDeliveredText)
      const text: Element = renderResult.getByText(messageTextContentMock)

      expect(notDeliveredTextElement).toBeDefined()
      expect(text).toBeDefined()
    })

    it('call the api when clicking on retry text and show sending message with spinner', async () => {
      await renderTextMessage({
        messageContext: getTestMessageContext(messageNotDelieveredMock),
      })

      const notDeliveredTextElement: Element = renderResult.getByText(notDeliveredText)

      act(() => {
        userEvent.click(notDeliveredTextElement)
      })

      const sendingMessageText: Element | null = renderResult.queryByText('Sending message ...')

      expect(sendingMessageText).toBeDefined()
      expect(sendMessageMock).toHaveBeenCalledTimes(1)
    })
  })
})
