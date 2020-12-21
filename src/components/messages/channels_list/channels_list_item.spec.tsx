import React from 'react'
import { RenderResult, render, act } from '../../../../tests/test_utils'
import { ChannelListItem } from './channels_list_item'
import { MessageTemplateText } from '@globalid/messaging-service-sdk'
import {
  messageMock,
  channelWithParticipantsTypeMulti,
  membersMock,
} from '../../../../tests/mocks/channels_mock'
import { getFormattedDate, parseMessageContent } from '../helpers'
import { store, ThunkDispatch } from '../../../store'
import * as api from '../../../services/api/identity_api'
import * as channels_api from '../../../services/api/channels_api'
import { identityMock } from '../../../../tests/mocks/identity_mock'
import { setChannel, setMemberIds, setMembers } from '../../../store/channels_slice/channels_slice'

jest.mock('../../../services/api/identity_api')
jest.mock('../../../services/api/channels_api')

describe('ChannelsListItem', () => {
  let renderResult: RenderResult
  const getIdentityNameByUuidMock = jest.fn()
  const getChannelMembersMock = jest.fn()

  beforeEach(() => {
    (api.getIdentityNameByUuid as jest.Mock) = getIdentityNameByUuidMock.mockResolvedValue(identityMock.gid_name);
    (channels_api.getChannelMembers as jest.Mock) = getChannelMembersMock.mockResolvedValue([identityMock])

    store.dispatch(setMemberIds({
      channel_id: channelWithParticipantsTypeMulti.id,
      member_ids: channelWithParticipantsTypeMulti.participants,
    }))
    store.dispatch(setMembers(channelWithParticipantsTypeMulti.participants.map((gid_uuid: string) => ({
      ...membersMock[gid_uuid],
      gid_uuid,
    }))))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(<ChannelListItem item={channelWithParticipantsTypeMulti.id}/>)
    })
  }

  it('should render the ChannelsListItem component', async () => {
    await (store.dispatch as ThunkDispatch)(setChannel({
      ...channelWithParticipantsTypeMulti,
      title: 'Channel title',
      message: { ...messageMock, author: identityMock.gid_uuid },
    }))

    await renderComponent()
    const formattedTime = getFormattedDate(channelWithParticipantsTypeMulti.message?.created_at) as string
    const lastMessageText: MessageTemplateText = parseMessageContent(channelWithParticipantsTypeMulti.message?.content as string)

    const formattedTimeElement: Element | null = renderResult.getByText(new RegExp(`.*${formattedTime}`))
    const lastMessageAuthorElement: Element | null = renderResult.queryByText(`${identityMock.gid_name}:`)
    const lastMessageTextElement: Element | null = renderResult.queryByText(lastMessageText.text)
    const channelTitleElement: Element | null = renderResult.queryByText('Channel title')

    expect(formattedTimeElement).not.toBeNull()
    expect(lastMessageAuthorElement).not.toBeNull()
    expect(lastMessageTextElement).not.toBeNull()
    expect(channelTitleElement).not.toBeNull()
  })

  it('should render the ChannelsListItem component when user has unread messages', async () => {
    await (store.dispatch as ThunkDispatch)(setChannel({ ...channelWithParticipantsTypeMulti, unread_count: 10 }))
    await renderComponent()
    const unreadMessagesCount: Element | null = renderResult.queryByText('9+')

    expect(unreadMessagesCount).not.toBeNull()
  })

  it('should render last message text when the message created by channel owner', async () => {
    await (store.dispatch as ThunkDispatch)(setChannel({
      ...channelWithParticipantsTypeMulti,
      created_by: identityMock.gid_uuid,
      unread_count: 10,
      message: { ...messageMock, author: identityMock.gid_uuid },
    }))

    await renderComponent()
    const lastMessageText: MessageTemplateText = parseMessageContent(channelWithParticipantsTypeMulti.message?.content as string)

    const lastMessageAuthorElement: Element | null = renderResult.queryByText(`${identityMock.gid_name}:`)
    const lastMessageTextElement: Element | null = renderResult.queryByText(lastMessageText.text)

    expect(lastMessageAuthorElement).not.toBeNull()
    expect(lastMessageTextElement).toBeDefined()
  })
})
