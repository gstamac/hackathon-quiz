import React from 'react'
import { publicIdentityMock, randomIdentityMock } from '../../../../../tests/mocks/identity_mock'
import {
  messageDataMock,
  messageNotDelieveredMock,
} from '../../../../../tests/mocks/messages_mock'
import {
  act,
  fireEvent,
  render,
  RenderResult,
  userEvent,
} from '../../../../../tests/test_utils'
import * as avatarApi from '../../../../services/api/avatar_api'
import * as identityApi from '../../../../services/api/identity_api'
import * as messagingApi from '../../../../services/api/messaging_api'
import * as messages_utils from '../../../../utils/messages_utils'
import { store, ThunkDispatch } from '../../../../store'
import { fetchMembers } from '../../../../store/channels_slice/channels_slice'
import { ChannelType, MessageData } from '../../../../store/interfaces'
import { getString } from '../../../../utils'
import { BaseMessageCardProps, MessageContext, MessageDataParsed } from './interfaces'
import { MessageContextController } from './message_context_controller'
import { mocked } from 'ts-jest/utils'

jest.mock('../../../../services/api/avatar_api')
jest.mock('../../../../services/api/identity_api')
jest.mock('../../../../services/api/messaging_api')
jest.mock('../../../../utils/messages_utils')

const getTestMessageContext = (message: MessageDataParsed = messageDataMock, prevMessage?: MessageData, nextMessage?: MessageData): MessageContext<MessageDataParsed> => ({
  prevMessage: prevMessage ?? null,
  message,
  nextMessage: nextMessage ?? null,
})

describe('MessageContextController', () => {
  let renderResult: RenderResult

  const getAvatarMock: jest.Mock = mocked(avatarApi.getAvatar)
  const getIdentitiesListMock: jest.Mock = mocked(identityApi.getIdentitiesList)
  const deleteMessageMock: jest.Mock = mocked(messagingApi.deleteMessageFromChannel)
  const sendMessageMock: jest.Mock = mocked(messages_utils.sendMessageToChannel)

  const props: BaseMessageCardProps = {
    me: publicIdentityMock,
    author: randomIdentityMock,
    admin: publicIdentityMock.gid_uuid,
    messageContext: getTestMessageContext(),
    channelType: ChannelType.PERSONAL,
    seen: false,
    hideOwner: false,
    isHiddenMember: false,
    hasOptions: true,
  }
  const message: string = 'Test child'
  const renderTextMessage = async (partialProps?: Partial<BaseMessageCardProps>): Promise<void> => {
    await act(async () => {
      renderResult = render(<MessageContextController {...{
        ...props,
        ...partialProps,
      }} >{message}
      </MessageContextController>)
    })
  }

  beforeAll(async () => {
    getIdentitiesListMock.mockResolvedValue([randomIdentityMock, publicIdentityMock])
    getAvatarMock.mockResolvedValue('avatar-uuid')

    await (store.dispatch as ThunkDispatch)(fetchMembers({
      channel_id: 'channel_id',
      member_ids: [randomIdentityMock.gid_uuid, publicIdentityMock.gid_uuid],
    }))
  })

  it('should render child message component (by me)', async () => {
    await renderTextMessage()

    const text: Element = renderResult.getByText(message)

    expect(text).toBeDefined()
  })

  it('should not render child message component with quick menu options when hasOptions is undefined', async () => {
    await renderTextMessage({ hasOptions: undefined })

    const text: Element | null = renderResult.queryByText(message)

    expect(text).not.toBeNull()

    act(() => {
      fireEvent.mouseEnter(text as Element)
    })

    const settingIcon: Element | null = renderResult.queryByTestId('settings')

    expect(settingIcon).toBeNull()
  })

  it('should render child message component (by me) with Delivered adornment', async () => {
    await renderTextMessage()

    const text: Element = renderResult.getByText(message)
    const delivered: Element = renderResult.getByText('Delivered')

    expect(text).toBeDefined()
    expect(delivered).toBeDefined()
  })

  it('should render child message component (by me) with Seen adornment', async () => {
    await renderTextMessage({
      seen: true,
    })

    const text: Element = renderResult.getByText(message)
    const seen: Element = renderResult.getByText('Seen')

    expect(text).toBeDefined()
    expect(seen).toBeDefined()
  })

  it('should render child message component (by others), avatar and display name', async () => {
    await renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        author: randomIdentityMock.gid_uuid,
      }),
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(randomIdentityMock.display_name)
    const text: Element = renderResult.getByText(message)

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(text).toBeDefined()
  })

  it('should render child message component (by others & owner) and display name', async () => {
    await renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        author: randomIdentityMock.gid_uuid,
      }),
      admin: randomIdentityMock.gid_uuid,
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(`${randomIdentityMock.display_name} ${getString('group-owner')}`)
    const text: Element = renderResult.getByText(message)

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(text).toBeDefined()
  })

  it('should render child message component admin without owner tag', async () => {
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
    const text: Element = renderResult.getByText(message)
    const ownerTag: Element | null = renderResult.queryByText(getString('group-owner'))

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(text).toBeDefined()
    expect(ownerTag).toBeNull()
  })

  it('should show settings icon when user hovers over his message', async () => {
    await renderTextMessage()

    const text: Element = renderResult.getByText(message)

    expect(text).toBeDefined()

    act(() => {
      fireEvent.mouseEnter(text)
    })

    const settingIcon: Element = renderResult.getByTestId('settings')

    expect(settingIcon).toBeDefined()
  })

  it('should open quickmenu with delete message option', async () => {
    await renderTextMessage()

    const text: Element = renderResult.getByText(message)

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

    const text: Element = renderResult.getByText(message)

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

    const text: Element = renderResult.getByText(message)

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
      const text: Element = renderResult.getByText(message)

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
