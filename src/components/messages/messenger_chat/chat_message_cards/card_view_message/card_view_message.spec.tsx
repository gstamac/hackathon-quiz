import React from 'react'
import {
  render,
  act,
  cleanup,
  RenderResult,
} from '../../../../../../tests/test_utils'
import { CardViewMessageCard } from './card_view_message'
import { BaseMessageCardProps, ChatMessageHooksResponse, MessageContext } from '../interfaces'
import * as messageGroupingHook from '../message_grouping_hooks'
import { publicIdentityMock, randomIdentityMock } from '../../../../../../tests/mocks/identity_mock'
import { cardViewInvitationMessageMock } from '../../../../../../tests/mocks/messages_mock'
import { ChannelType, MessageData } from '../../../../../store/interfaces'

jest.mock('../message_grouping_hooks')

const getTestMessageContext = (message: MessageData = cardViewInvitationMessageMock, prevMessage?: MessageData, nextMessage?: MessageData): MessageContext => ({
  prevMessage: prevMessage ?? null,
  message,
  nextMessage: nextMessage ?? null,
})

describe('Card view message', () => {
  let renderResult: RenderResult

  const useChatMessageHooksMock: jest.Mock = jest.fn()

  const useChatMessageHookResult: ChatMessageHooksResponse = {
    isLastMessage: true,
    iAmAuthor: true,
    displayName: <div>displayName</div>,
    avatar: <div>Avatar</div>,
    timestamp: <div>Date</div>,
    deletedByMe: false,
    messageContainerStyle: '',
  }

  const props: BaseMessageCardProps = {
    me: publicIdentityMock,
    author: randomIdentityMock,
    admin: publicIdentityMock.gid_uuid,
    messageContext: getTestMessageContext(cardViewInvitationMessageMock),
    channelType: ChannelType.PERSONAL,
    seen: false,
    hideOwner: false,
  }

  beforeEach(() => {
    (messageGroupingHook.useChatMessageHooks as jest.Mock) = useChatMessageHooksMock.mockReturnValue(useChatMessageHookResult)

    renderComponent()
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(<CardViewMessageCard {...props}/>)
    })
  }

  it('should render card view message component', () => {
    const acceptButton: Element | null = renderResult.queryByText('Accept')
    const rejectButton: Element | null= renderResult.queryByText('Reject')
    const avatar: Element | null = renderResult.queryByText('Avatar')
    const timestamp: Element | null = renderResult.queryByText('Date')
    const icon: Element | null = renderResult.queryByAltText('group-icon')
    const title: Element | null = renderResult.queryByText('You have been invited to')

    expect(acceptButton).not.toBeNull()
    expect(rejectButton).not.toBeNull()
    expect(avatar).not.toBeNull()
    expect(timestamp).not.toBeNull()
    expect(icon).not.toBeNull()
    expect(title).not.toBeNull()
  })
})
