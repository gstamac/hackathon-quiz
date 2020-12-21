import React from 'react'
import { MessageType } from '../messenger_chat/interfaces'
import { useChannelsListItem } from './use_channels_list_item'
import { ChannelListItemHookResult } from './interfaces'
import { RenderHookResult, renderHook, act, cleanup } from '@testing-library/react-hooks'
import * as channelsApi from '../../../services/api/channels_api'
import * as groupsApi from '../../../services/api/groups_api'
import { Provider } from 'react-redux'
import {
  channelWithParticipantsTypePersonal,
  channelWithParticipantsTypeMulti,
  channelWithParticipantsTypeGroup,
  messageMock,
  messageWithParsedContent,
} from '../../../../tests/mocks/channels_mock'
import {
  identityMock,
  identitiesMock,
} from '../../../../tests/mocks/identity_mock'

import {
  setIsFetchingAll,
  setChannel,
} from '../../../store/channels_slice/channels_slice'
import { ChannelWithParticipantsAndParsedMessage } from '../../../store/interfaces'
import { history, store } from '../../../store'
import { Route, Router } from 'react-router-dom'
import { getString } from '../../../utils'
import waitForExpect from 'wait-for-expect'
import { ChannelWithParticipants } from '@globalid/messaging-service-sdk'
import { setGroup } from '../../../store/groups_slice'
import { groupMock } from '../../../../tests/mocks/group_mocks'
import { BASE_MESSAGES_URL } from '../../../constants'
import { MuiThemeProvider } from '@material-ui/core'
import { mainTheme } from '../../../assets/themes'

jest.mock('../../../services/api/channels_api')
jest.mock('../../../services/api/groups_api')

describe('useChannelsListItemHook', () => {
  let renderHookResult: RenderHookResult<Record<string, unknown>, ChannelListItemHookResult | null>
  const getChannelMembersMock: jest.Mock = jest.fn()
  const getGroupMock: jest.Mock = jest.fn()

  const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element =>
    <MuiThemeProvider theme={mainTheme}>
      <Router history={history}>
        <Route path='/app/messages/:type(t|g|m)/:groupUuid?/:channelId?'>
          <Provider store={store}>{children}</Provider>
        </Route>
      </Router>
    </MuiThemeProvider>

  beforeEach(async () => {
    (channelsApi.getChannelMembers as jest.Mock) = getChannelMembersMock.mockResolvedValue([identityMock]);
    (groupsApi.getGroup as jest.Mock) = getGroupMock.mockResolvedValue(groupMock)
    await act(async () => {
      store.dispatch(setChannel(channelWithParticipantsTypeGroup))
      store.dispatch(setGroup({
        key: groupMock.uuid,
        value: groupMock,
      }))
      store.dispatch(setIsFetchingAll(false))
    })
  })

  afterEach(async () => {
    await cleanup()
    jest.clearAllMocks()
  })

  const updateHookResult = async (channel: ChannelWithParticipants, path: string): Promise<void> => {
    history.push(`${BASE_MESSAGES_URL}${path}`)

    const channelWithParsedMessage: ChannelWithParticipantsAndParsedMessage = {
      ...channel,
      group_uuid: 'uuid',
      message: channel.message ? {
        ...messageWithParsedContent,
        ...channel.message,
      } : undefined,
    }

    await act(async () => {
      renderHookResult = renderHook(() => useChannelsListItem(channelWithParsedMessage), { wrapper })
    })
  }

  describe('Channel', () => {
    it('should return null when route type is not correct', async () => {
      await updateHookResult(channelWithParticipantsTypeGroup, '/incorrect_type')

      expect(renderHookResult.result.current).toBeNull()
    })

    it('should render group type channel', async () => {
      await updateHookResult(channelWithParticipantsTypeGroup, '/g')

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      expect(result?.isActiveChannel).toStrictEqual(false)
      expect(result?.hasUnreadMessages).toStrictEqual(false)
      expect(result?.unreadMessagesCount).toBeDefined()
      expect(result?.createdDate).toEqual('now')
      expect(result?.title).toEqual(getString('group-channel'))
      expect(result?.avatar).not.toBeUndefined()
      expect(result?.handleClick).not.toBeNull()
    })

    it('should render selected channel', async () => {
      await updateHookResult(channelWithParticipantsTypeGroup, `/g/${groupMock.uuid}/${channelWithParticipantsTypeGroup.id}`)

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      expect(result?.isActiveChannel).toStrictEqual(true)
    })

    it('should render channel with unreadMessages count', async () => {
      await updateHookResult({
        ...channelWithParticipantsTypeGroup,
        unread_count: 10,
      }, `/g/${channelWithParticipantsTypeGroup.id}`)

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      expect(result?.hasUnreadMessages).toStrictEqual(true)
      expect(result?.unreadMessagesCount).toStrictEqual('9+')
    })

    it('should render channel when last message does not exist', async () => {
      await updateHookResult({
        ...channelWithParticipantsTypeGroup,
        message: undefined,
      }, `/g/${channelWithParticipantsTypeGroup.id}`)

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      expect(result?.createdDate).toBeNull()
      expect(result?.messageAuthorName).toEqual('')
    })

    it('should return last message author name when channel type is GROUP', async () => {
      await updateHookResult({
        ...channelWithParticipantsTypeGroup,
        participants: [identityMock.gid_uuid],
        message: {
          ...messageMock,
          author: identityMock.gid_uuid,
        },
      }, `/g/${channelWithParticipantsTypeGroup.id}`)

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      await waitForExpect(() => expect(result?.messageAuthorName).toEqual(`${identitiesMock.data[0].gid_name}:`))
    })

    it('should return last message author name when channel type is MULTI', async () => {
      await updateHookResult({
        ...channelWithParticipantsTypeMulti,
        participants: [identityMock.gid_uuid],
        message: {
          ...messageMock,
          author: identityMock.gid_uuid,
        },
      }, `/t/${channelWithParticipantsTypeMulti.id}`)

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      await waitForExpect(() => expect(result?.messageAuthorName).toEqual(`${identitiesMock.data[0].gid_name}:`))
    })

    it('should not return last message author name when channel type is PERSONAL', async () => {
      await updateHookResult({
        ...channelWithParticipantsTypePersonal,
        participants: [identityMock.gid_uuid],
        message: {
          ...messageMock,
          author: identityMock.gid_uuid,
        },
      }, `/t/${channelWithParticipantsTypePersonal.id}`)

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      expect(result?.messageAuthorName).toEqual('')
    })

    it('should not return last message author name when message type is DELETED', async () => {
      await updateHookResult({
        ...channelWithParticipantsTypePersonal,
        participants: [identityMock.gid_uuid],
        message: {
          ...messageMock,
          author: identityMock.gid_uuid,
          type: MessageType.DELETED,
        },
      }, `/t/${channelWithParticipantsTypePersonal.id}`)

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      expect(result?.messageAuthorName).toEqual('')
    })

    it('should not return last message author name with admin text when the last message from the group channel admin', async () => {
      await updateHookResult({
        ...channelWithParticipantsTypeGroup,
        created_by: identityMock.gid_uuid,
        participants: [identityMock.gid_uuid],
        message: {
          ...messageMock,
          author: identityMock.gid_uuid,
        },
      }, `/t/${channelWithParticipantsTypeGroup.id}`)

      const result: ChannelListItemHookResult | null = renderHookResult.result.current

      expect(result?.messageAuthorName).toEqual(`${identitiesMock.data[0].gid_name} ${getString('group-owner')}:`)
    })
  })
})
