import React from 'react'
import { Provider } from 'react-redux'
import { ChannelWithParticipants } from '@globalid/messaging-service-sdk'
import { act, renderHook, RenderHookResult, cleanup } from '@testing-library/react-hooks'
import { useChannelDetails } from './use_channel_details'
import { store, ThunkDispatch } from '../../../store'
import { setChannel, setMemberIds, setMembers } from '../../../store/channels_slice/channels_slice'
import {
  groupChannelMock,
  membersMock,
  channelWithOneParticipantMock,
  multiChannelWithFourMembersMock,
  multiChannelWithThreeMembersMock,
  multiChannelWithTwoMembersMock,
  oneOnOneChannelMock,
  channelWithBotParticipantMock,
} from '../../../../tests/mocks/channels_mock'
import {
  personalChatIdentityMock,
  publicIdentityMock,
  randomIdentityMock,
} from '../../../../tests/mocks/identity_mock'
import { ChannelType } from '../../../store/interfaces'
import { ChannelDetails } from './interfaces'
import { MESSAGE_BOT_IDENTITY_UUID } from '../../../constants'
import { mocked } from 'ts-jest/utils'
import { getAvatar } from '../../../services/api/avatar_api'
import { getChannelMembers } from '../../../services/api/channels_api'

let renderHookResult: RenderHookResult<{}, ReturnType<typeof useChannelDetails>>
const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => <Provider store={store}>{children}</Provider>

jest.mock('../../../services/api/avatar_api')
jest.mock('../../../services/api/channels_api')

const getResult = async (channel: ChannelWithParticipants): Promise<void> => {
  await (store.dispatch as ThunkDispatch)(setChannel(channel))
  store.dispatch(setMemberIds({
    channel_id: channel.id,
    member_ids: channel.participants,
  }))
  store.dispatch(setMembers(channel.participants.map((gid_uuid: string) => ({
    ...membersMock[gid_uuid],
    gid_uuid,
  }))))

  await act(async () => {
    renderHookResult = renderHook(() => useChannelDetails(
      channel.id,
      '6196ffd4-d433-49d2-a658-6ca9122ffe32',
    ), {wrapper})
  })
}

describe('useChannelDetails', () => {
  const getAvatarMock = mocked(getAvatar)
  const getMembersMock = mocked(getChannelMembers)

  beforeEach(() => {
    getAvatarMock.mockResolvedValue('avatar')
    getMembersMock.mockResolvedValue([])
  })

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  it('should return group channel details', async () => {
    await getResult(groupChannelMock)
    const result: ChannelDetails | null = renderHookResult.result.current

    expect(result?.channelType).toStrictEqual(ChannelType.GROUP)
    expect(result?.description).toStrictEqual('Meine Grupe')
    expect(result?.memberUuids).toStrictEqual(['participant_1', 'participant_2'])
    expect(result?.members).toStrictEqual({
      'participant_1': {...publicIdentityMock, gid_uuid: 'participant_1'},
      'participant_2': {...publicIdentityMock, gid_uuid: 'participant_2'},
    })
    expect(result?.membersDescription).toStrictEqual('2 members')
    expect(result?.title).toStrictEqual('Group channel')
    expect(result?.groupUuid).toStrictEqual('ceb512a9-bc9a-45a3-82d5-96658022144b')
    expect(result?.isBotChannel).toStrictEqual(false)
    expect(renderHookResult.result.current).toHaveProperty('getChannelAvatar')
  })

  it('should return group channel with one member details', async () => {
    await getResult({...channelWithOneParticipantMock, type: ChannelType.GROUP})
    const result = renderHookResult.result.current

    expect(result?.channelType).toStrictEqual(ChannelType.GROUP)
    expect(result?.description).toStrictEqual('Meine Grupe')
    expect(result?.memberUuids).toStrictEqual(['participant_1'])
    expect(result?.members).toStrictEqual({
      'participant_1': {...publicIdentityMock, gid_uuid: 'participant_1'},
      'participant_2': {...publicIdentityMock, gid_uuid: 'participant_2'},
    })
    expect(result?.membersDescription).toStrictEqual('1 member')
    expect(result?.title).toStrictEqual('Group channel')
    expect(result?.groupUuid).toBeUndefined()
    expect(result?.isBotChannel).toStrictEqual(false)
    expect(renderHookResult.result.current).toHaveProperty('getChannelAvatar')
  })

  it('should return group channel with random avatar details', async () => {
    await getResult({...channelWithOneParticipantMock, image_url: undefined})

    expect(renderHookResult.result.current?.getChannelAvatar()).not.toBeUndefined()
  })

  it('should return 1on1 channel details', async () => {
    await getResult(oneOnOneChannelMock)

    const result: ChannelDetails | null = renderHookResult.result.current
    const description: string = `${personalChatIdentityMock.display_name} • ${personalChatIdentityMock.country_name}`

    expect(result?.channelType).toStrictEqual(ChannelType.PERSONAL)
    expect(result?.description).toStrictEqual(description)
    expect(result?.memberUuids).toStrictEqual(['78efe212-f61e-4adc-8429-5ac5a543fe88', '6196ffd4-d433-49d2-a658-6ca9122ffe32'])
    expect(result?.members).toStrictEqual({
      'participant_1': {...publicIdentityMock, gid_uuid: 'participant_1'},
      'participant_2': {...publicIdentityMock, gid_uuid: 'participant_2'},
      '6196ffd4-d433-49d2-a658-6ca9122ffe32': publicIdentityMock,
      '78efe212-f61e-4adc-8429-5ac5a543fe88': personalChatIdentityMock,
    })
    expect(result?.membersDescription).toStrictEqual('full name')
    expect(result?.title).toStrictEqual(oneOnOneChannelMock.title)
    expect(result?.isBotChannel).toStrictEqual(false)
  })

  it('should return multi channel with three users details', async () => {
    await getResult(multiChannelWithThreeMembersMock)

    const result: ChannelDetails | null = renderHookResult.result.current

    expect(result?.channelType).toStrictEqual(ChannelType.MULTI)
    expect(result?.description).toStrictEqual('Meine Grupe')
    expect(result?.memberUuids).toStrictEqual(['78efe212-f61e-4adc-8429-5ac5a543fe88', '6196ffd4-d433-49d2-a658-6ca9122ffe32', '78efe212-f61e-4adc-8429-5ac5a543fe87'])
    expect(result?.members).toStrictEqual({
      'participant_1': {...publicIdentityMock, gid_uuid: 'participant_1'},
      'participant_2': {...publicIdentityMock, gid_uuid: 'participant_2'},
      '6196ffd4-d433-49d2-a658-6ca9122ffe32': publicIdentityMock,
      '78efe212-f61e-4adc-8429-5ac5a543fe88': personalChatIdentityMock,
      '78efe212-f61e-4adc-8429-5ac5a543fe87': randomIdentityMock,
    },)
    expect(result?.membersDescription).toStrictEqual('3 members')
    expect(result?.title).toStrictEqual(multiChannelWithThreeMembersMock.title)
    expect(result?.isBotChannel).toStrictEqual(false)
  })

  it('should return multi channel with two users details', async () => {
    await getResult(multiChannelWithTwoMembersMock)

    const result: ChannelDetails | null = renderHookResult.result.current

    expect(result?.channelType).toStrictEqual(ChannelType.MULTI)
    expect(result?.description).toStrictEqual('Meine Grupe')
    expect(result?.memberUuids).toStrictEqual(['78efe212-f61e-4adc-8429-5ac5a543fe88', '6196ffd4-d433-49d2-a658-6ca9122ffe32'])
    expect(result?.members).toStrictEqual({
      'participant_1': {...publicIdentityMock, gid_uuid: 'participant_1'},
      'participant_2': {...publicIdentityMock, gid_uuid: 'participant_2'},
      '6196ffd4-d433-49d2-a658-6ca9122ffe32': publicIdentityMock,
      '78efe212-f61e-4adc-8429-5ac5a543fe88': personalChatIdentityMock,
      '78efe212-f61e-4adc-8429-5ac5a543fe87': randomIdentityMock,
    },)
    expect(result?.membersDescription).toStrictEqual('2 members')
    expect(result?.title).toStrictEqual(multiChannelWithTwoMembersMock.title)
    expect(result?.isBotChannel).toStrictEqual(false)
  })

  it('should return multi channel with four users details', async () => {
    await getResult(multiChannelWithFourMembersMock)

    const result: ChannelDetails | null = renderHookResult.result.current

    expect(result?.channelType).toStrictEqual(ChannelType.MULTI)
    expect(result?.description).toStrictEqual('Meine Grupe')
    expect(result?.memberUuids).toStrictEqual([
      '78efe212-f61e-4adc-8429-5ac5a543fe88',
      '6196ffd4-d433-49d2-a658-6ca9122ffe32',
      '78efe212-f61e-4adc-8429-5ac5a543fe87',
      '78efe212-f61e-4adc-8429-5ac5a543fe89',
    ])
    expect(result?.members).toStrictEqual({
      'participant_1': {...publicIdentityMock, gid_uuid: 'participant_1'},
      'participant_2': {...publicIdentityMock, gid_uuid: 'participant_2'},
      '6196ffd4-d433-49d2-a658-6ca9122ffe32': publicIdentityMock,
      '78efe212-f61e-4adc-8429-5ac5a543fe88': personalChatIdentityMock,
      '78efe212-f61e-4adc-8429-5ac5a543fe87': randomIdentityMock,
      '78efe212-f61e-4adc-8429-5ac5a543fe89': {
        'gid_uuid': '78efe212-f61e-4adc-8429-5ac5a543fe89',
      },
    })
    expect(result?.membersDescription).toStrictEqual('4 members')
    expect(result?.title).toStrictEqual(multiChannelWithFourMembersMock.title)
    expect(result?.isBotChannel).toStrictEqual(false)
  })

  it('should return bot channel details', async () => {
    await getResult(channelWithBotParticipantMock)

    const result: ChannelDetails | null = renderHookResult.result.current

    expect(result?.channelType).toStrictEqual(ChannelType.PERSONAL)
    expect(result?.description).toStrictEqual(publicIdentityMock.display_name)
    expect(result?.memberUuids).toStrictEqual([
      MESSAGE_BOT_IDENTITY_UUID,
      '448925ca-83bb-4d1d-ad19-f60975f7f02f',
      '6022a28e-cf69-4dfd-8ddb-46668b5cb7a2',
    ])
    expect(result?.membersDescription).toStrictEqual(publicIdentityMock.display_name)
    expect(result?.title).toStrictEqual(channelWithBotParticipantMock.title)
    expect(result?.isBotChannel).toStrictEqual(true)
  })
})
