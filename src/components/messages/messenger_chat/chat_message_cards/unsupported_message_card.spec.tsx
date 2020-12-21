import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { render, act } from '../../../../../tests/test_utils'
import { MessageContext, BaseMessageCardProps } from './interfaces'
import { publicIdentityMock, randomIdentityMock } from '../../../../../tests/mocks/identity_mock'
import { messageDataMock } from '../../../../../tests/mocks/messages_mock'
import * as avatarApi from '../../../../services/api/avatar_api'
import * as identityApi from '../../../../services/api/identity_api'
import * as messagingApi from '../../../../services/api/messaging_api'
import { fetchMembers } from '../../../../store/channels_slice/channels_slice'
import { store, ThunkDispatch } from '../../../../store'
import { MessageData, ChannelType } from '../../../../store/interfaces'
import { UnsupportedMessageCard } from './unsupported_message_card'
import { getString } from '../../../../utils'

jest.mock('../../../../services/api/avatar_api')
jest.mock('../../../../services/api/identity_api')
jest.mock('../../../../services/api/messaging_api')

const getTestMessageContext = (message: MessageData = messageDataMock, prevMessage?: MessageData, nextMessage?: MessageData): MessageContext => ({
  prevMessage: prevMessage ?? null,
  message,
  nextMessage: nextMessage ?? null,
})

describe('Unsupported message card', () => {
  let renderResult: RenderResult

  const getAvatarMock: jest.Mock = jest.fn()
  const getIdentitiesListMock: jest.Mock = jest.fn()
  const deleteMessageMock: jest.Mock = jest.fn()

  const props: BaseMessageCardProps = {
    me: publicIdentityMock,
    author: randomIdentityMock,
    admin: publicIdentityMock.gid_uuid,
    messageContext: getTestMessageContext(),
    channelType: ChannelType.GROUP,
    seen: false,
    hideOwner: false,
  }

  const unsupportedText = 'View this message on your mobile device'

  const renderTextMessage = (partialProps?: Partial<BaseMessageCardProps>): void => {
    act(() => {
      renderResult = render(<UnsupportedMessageCard {...{
        ...props,
        ...partialProps,
      }} />)
    })
  }

  beforeAll(async () => {
    (avatarApi.getAvatar as jest.Mock) = getAvatarMock;
    (identityApi.getIdentitiesList as jest.Mock) = getIdentitiesListMock;
    (messagingApi.deleteMessageFromChannel as jest.Mock) = deleteMessageMock

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

  it('should render unsupported message card by me with no avatar or display name', () => {
    renderTextMessage()

    const avatar: Element | null = renderResult.queryByAltText('user avatar')
    const displayNameText: Element | null = renderResult.queryByText(randomIdentityMock.display_name)
    const unsupportedMessageTip: Element = renderResult.getByText(unsupportedText)

    expect(avatar).toBeNull()
    expect(displayNameText).toBeNull()
    expect(unsupportedMessageTip).toBeDefined()
  })

  it('should render unsupported message card by me with Delivered adornment', () => {
    renderTextMessage({channelType: ChannelType.PERSONAL})

    const avatar: Element | null = renderResult.queryByAltText('user avatar')
    const displayNameText: Element | null = renderResult.queryByText(randomIdentityMock.display_name)
    const unsupportedMessageTip: Element = renderResult.getByText(unsupportedText)
    const delivered: Element | null = renderResult.getByText('Delivered')

    expect(avatar).toBeNull()
    expect(displayNameText).toBeNull()
    expect(unsupportedMessageTip).toBeDefined()
    expect(delivered).toBeDefined()
  })

  it('should render unsupported message card by me with Seen adornment', () => {
    renderTextMessage({channelType: ChannelType.PERSONAL, seen: true})

    const avatar: Element | null = renderResult.queryByAltText('user avatar')
    const displayNameText: Element | null = renderResult.queryByText(randomIdentityMock.display_name)
    const unsupportedMessageTip: Element = renderResult.getByText(unsupportedText)
    const seen: Element | null = renderResult.getByText('Seen')

    expect(avatar).toBeNull()
    expect(displayNameText).toBeNull()
    expect(unsupportedMessageTip).toBeDefined()
    expect(seen).toBeDefined()
  })

  it('should render unsupported message card by others with avatar and display name', () => {
    renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        author: randomIdentityMock.gid_uuid,
      }),
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(randomIdentityMock.display_name)
    const unsupportedMessageTip: Element = renderResult.getByText(unsupportedText)

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(unsupportedMessageTip).toBeDefined()
  })

  it('should render unsupported message card by others & admin with avatar and display name', () => {
    renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        author: randomIdentityMock.gid_uuid,
      }),
      admin: randomIdentityMock.gid_uuid,
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(`${randomIdentityMock.display_name} ${getString('group-owner')}`)
    const unsupportedMessageTip: Element = renderResult.getByText(unsupportedText)

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(unsupportedMessageTip).toBeDefined()
  })

  it('should render unsupported message card by owner with hidden tag', () => {
    renderTextMessage({
      messageContext: getTestMessageContext({
        ...messageDataMock,
        author: randomIdentityMock.gid_uuid,
      }),
      admin: randomIdentityMock.gid_uuid,
      hideOwner: true,
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(`${randomIdentityMock.display_name}`)
    const unsupportedMessageTip: Element = renderResult.getByText(unsupportedText)
    const ownerTag: Element | null = renderResult.queryByText(getString('group-owner'))

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(unsupportedMessageTip).toBeDefined()
    expect(ownerTag).toBeNull()
  })
})
