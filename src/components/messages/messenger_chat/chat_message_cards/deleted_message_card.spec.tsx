import { cleanup, RenderResult } from '@testing-library/react'
import React from 'react'
import { publicIdentityMock, randomIdentityMock } from '../../../../../tests/mocks/identity_mock'
import {
  messageDataMock,
  messageDeletedDataMock,
  messageTextContentMock,
} from '../../../../../tests/mocks/messages_mock'
import { act, render } from '../../../../../tests/test_utils'
import * as avatar_api from '../../../../services/api/avatar_api'
import * as identity_api from '../../../../services/api/identity_api'
import { store, ThunkDispatch } from '../../../../store'
import { fetchMembers } from '../../../../store/channels_slice/channels_slice'
import { ChannelType, MessageData } from '../../../../store/interfaces'
import { DeletedMessageCard } from './deleted_message_card'
import { BaseMessageCardProps, MessageContext } from './interfaces'
import { getString } from '../../../../utils'

jest.mock('../../../../services/api/avatar_api')
jest.mock('../../../../services/api/identity_api')

const getTestMessageContext = (message: MessageData = messageDataMock, prevMessage?: MessageData, nextMessage?: MessageData): MessageContext => ({
  prevMessage: prevMessage ?? null,
  message,
  nextMessage: nextMessage ?? null,
})

describe('Deleted message card', () => {
  let renderResult: RenderResult

  const getAvatarMock: jest.Mock = jest.fn()
  const getIdentitiesListMock: jest.Mock = jest.fn()

  const props: BaseMessageCardProps = {
    me: publicIdentityMock,
    author: randomIdentityMock,
    admin: publicIdentityMock.gid_uuid,
    messageContext: getTestMessageContext(messageDeletedDataMock),
    channelType: ChannelType.PERSONAL,
    seen: false,
    hideOwner: false,
  }

  const renderDeletedMessage = (partialProps?: Partial<BaseMessageCardProps>): void => {
    act(() => {
      renderResult = render(<DeletedMessageCard {...{
        ...props,
        ...partialProps,
      }} />)
    })
  }

  beforeAll(async () => {
    (avatar_api.getAvatar as jest.Mock) = getAvatarMock;
    (identity_api.getIdentitiesList as jest.Mock) = getIdentitiesListMock

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

  it('should render deleted message (by me)', () => {
    renderDeletedMessage()

    const text: Element = renderResult.getByText('You deleted the message')

    expect(text).toBeDefined()
  })

  it('should render deleted message (by me) with Delivered adornment', () => {
    renderDeletedMessage()

    const text: Element = renderResult.getByText('You deleted the message')
    const delivered: Element = renderResult.getByText('Delivered')

    expect(text).toBeDefined()
    expect(delivered).toBeDefined()
  })

  it('should render deleted message (by me) with Seen adornment', () => {
    renderDeletedMessage({
      seen:true,
    })

    const text: Element = renderResult.getByText('You deleted the message')
    const seen: Element = renderResult.getByText('Seen')

    expect(text).toBeDefined()
    expect(seen).toBeDefined()
  })

  it('should render text message (by others) with avatar and display name', async () => {
    getAvatarMock.mockResolvedValue('avatar-uuid')

    renderDeletedMessage({
      messageContext: getTestMessageContext({
        ...messageDeletedDataMock,
        author: randomIdentityMock.gid_uuid,
        deleted_by: randomIdentityMock.gid_name,
      }),
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(randomIdentityMock.display_name)
    const text: Element = renderResult.getByText(messageTextContentMock)

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(text).toBeDefined()
  })

  it('should render text message (owner) with avatar and display name', async () => {
    getAvatarMock.mockResolvedValue('avatar-uuid')

    renderDeletedMessage({
      messageContext: getTestMessageContext({
        ...messageDeletedDataMock,
        author: randomIdentityMock.gid_uuid,
        deleted_by: randomIdentityMock.gid_name,
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

  it('should render text message (owner) with avatar and display name without owner tag', async () => {
    getAvatarMock.mockResolvedValue('avatar-uuid')

    renderDeletedMessage({
      messageContext: getTestMessageContext({
        ...messageDeletedDataMock,
        author: randomIdentityMock.gid_uuid,
        deleted_by: randomIdentityMock.gid_name,
      }),
      admin: randomIdentityMock.gid_uuid,
      hideOwner: true,
    })

    const avatar: Element = renderResult.getByAltText('user avatar')
    const displayNameText: Element = renderResult.getByText(`${randomIdentityMock.display_name}`)
    const text: Element = renderResult.getByText(messageTextContentMock)
    const adminTag: Element | null = renderResult.queryByText(getString('group-owner'))

    expect(avatar).toBeDefined()
    expect(displayNameText).toBeDefined()
    expect(text).toBeDefined()
    expect(adminTag).toBeNull()
  })
})
