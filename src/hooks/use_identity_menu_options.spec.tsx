import * as blockUserApi from '../services/api/block_users_api'
import * as utils from '../utils'
import * as channelHelpers from '../utils/channel_helpers'
import * as channelsApi from '../services/api/channels_api'
import * as channelsSliceHelpers from '../store/channels_slice/helpers'

import { act, HookResult } from '@testing-library/react-hooks'
import { Identity, PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { useIdentityMenuOptions } from './use_identity_menu_options'
import {
  IdentityMenuOption,
  IdentityMenuOptionsParameters,
} from './interfaces'
import { QuickMenuItemProps } from '../components/global/quick_menu/interfaces'
import { ProfilePageTarget } from '../utils/interfaces'
import { identityMock } from '../../tests/mocks/identity_mock'
import { testCustomHook, TestCustomHookType } from '../../tests/test_utils'
import { channelWithOneParticipantMock } from '../../tests/mocks/channels_mock'
import {
  emptyChannelsResponseWithPaginationMetaMock,
  getChannelResponseWithMeta,
  getChannelWithCustomData,
} from '../../tests/mocks/channels_mocks'
import { ChannelType, FetchStatus } from '../store/interfaces'
import { store, ThunkDispatch } from '../store'
import { fetchBlockedUsers, setBlockedUsersFetchStatusByParameters } from '../store/messaging_slice'
import { BlockedUser } from '@globalid/messaging-service-sdk'
import { fetchChannel } from '../store/channels_slice/channels_slice'
import waitForExpect from 'wait-for-expect'
import { BlockedUsersWithPaginationMeta } from '@globalid/messaging-service-sdk/interfaces'
import { mocked } from 'ts-jest/utils'

jest.mock('../services/api')
jest.mock('../utils')
jest.mock('../utils/auth_utils')
jest.mock('../utils/channel_helpers')
jest.mock('../services/api/channels_api')
jest.mock('@reduxjs/toolkit', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('@reduxjs/toolkit') as {},
  unwrapResult: jest.fn().mockReturnValue([]),
}))

const prepareBlockedUsers = async (blockerUserUuid: string, blockedByUuid: string): Promise<void> => {
  const blockedUsers: BlockedUser[] = [{
    id: 'test',
    user_id: blockerUserUuid,
    blocked_by: blockedByUuid,
    blocked_at: 'blocked_at_date',
  }]

  const blockedUserResponse: BlockedUsersWithPaginationMeta = {
    data: {
      blocked_users: blockedUsers,
    },
    meta: {
      total: 1,
    },
  };

  (blockUserApi.getUserBlocks as jest.Mock) = jest.fn().mockReturnValue(blockedUserResponse)
  store.dispatch(setBlockedUsersFetchStatusByParameters({
    key: '1',
    value: FetchStatus.ERROR,
  }))

  await (store.dispatch as ThunkDispatch)(fetchBlockedUsers())
  const blockedUser: BlockedUser | undefined = store.getState().messaging.blockedUsers[blockerUserUuid]

  expect(blockedUser).not.toBeUndefined()
}

describe('useIdentityMenuOptions', () => {
  const addUserToContactsMock: jest.Mock = jest.fn()
  const navigateToProfilePageMock: jest.Mock = jest.fn()
  const removeUserFromContactsMock: jest.Mock = jest.fn()
  const reportUserByEmailMock: jest.Mock = jest.fn()
  const userExistsInContactsMock: jest.Mock = jest.fn()
  const createChannelWithUserDeviceSecretsMock: jest.Mock = jest.fn()
  const searchChannelsApiMock: jest.Mock = jest.fn()
  const blockUserApiMock: jest.Mock = jest.fn()
  const unblockUserApiMock: jest.Mock = jest.fn()
  const getChannelByParticipantsMock: jest.Mock = jest.fn()

  const onClickMock: jest.Mock = jest.fn()
  const loggedInIdentityMock: Identity = {
    ...identityMock,
    gid_name: 'Logged in name',
    gid_uuid: 'loggedin_uuid',
  }

  const testParameters: IdentityMenuOptionsParameters = {
    identity: identityMock,
    open: true,
    onClick: onClickMock,
  }

  const getChannelMock: jest.Mock = mocked(channelsApi.getChannel)

  const prepareChannelWithParticipants = async (participants: string[], channelId: string, type?: ChannelType): Promise<void> => {
    getChannelMock.mockResolvedValueOnce(
      getChannelWithCustomData(channelId, participants, type)
    )
    await act(async () => {
      store.dispatch(fetchChannel({ channelId }))
    })
  }

  const getHookResult: TestCustomHookType<IdentityMenuOptionsParameters, QuickMenuItemProps[] | undefined>
  = testCustomHook(useIdentityMenuOptions, testParameters, {
    identity: loggedInIdentityMock as PublicIdentity,
  })

  beforeAll(() => {
    (utils.addUserToContacts as jest.Mock) = addUserToContactsMock;
    (utils.navigateToProfilePage as jest.Mock) = navigateToProfilePageMock;
    (utils.removeUserFromContacts as jest.Mock) = removeUserFromContactsMock;
    (utils.reportUserByEmail as jest.Mock) = reportUserByEmailMock;
    (utils.userExistsInContacts as jest.Mock) = userExistsInContactsMock.mockResolvedValue(false);
    (channelHelpers.createChannelWithUserDeviceSecrets as jest.Mock) = createChannelWithUserDeviceSecretsMock.mockResolvedValue(channelWithOneParticipantMock);
    (channelsApi.searchChannels as jest.Mock) = searchChannelsApiMock.mockReturnValue(emptyChannelsResponseWithPaginationMetaMock);
    (utils.userExistsInContacts as jest.Mock) = userExistsInContactsMock.mockResolvedValue(false);
    (blockUserApi.blockUser as jest.Mock) = blockUserApiMock;
    (blockUserApi.unblockUser as jest.Mock) = unblockUserApiMock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return default menu options when no options specified', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult(testParameters)

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(7)

    expect(userExistsInContactsMock).toHaveBeenCalled()
  })

  it('should return default menu options when empty array specified as options', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(7)

    expect(userExistsInContactsMock).toHaveBeenCalled()
  })

  it('should return empty array for menu options when no identity specified', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      identity: undefined,
    })

    expect(result.current).toBeUndefined()
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should have all options, except view profile, disabled for logged in identity', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      identity: loggedInIdentityMock,
    })

    expect(result.current).not.toBeUndefined()
    const disabledMenuItems = result.current?.filter((menuOption: QuickMenuItemProps) => (
      menuOption.disabled
    ))

    expect(disabledMenuItems).toHaveLength(6)

    const enabledMenuItems = result.current?.filter((menuOption: QuickMenuItemProps) => (
      !menuOption.disabled
    ))

    expect(enabledMenuItems).toHaveLength(1)
    expect(enabledMenuItems?.[0].id).toBe('view-profile')

    expect(navigateToProfilePageMock).not.toHaveBeenCalled()

    await act(async () => {
      await enabledMenuItems?.[0].onClick?.()
    })

    expect(onClickMock).toHaveBeenCalled()

    expect(navigateToProfilePageMock).toHaveBeenCalled()
    expect(navigateToProfilePageMock.mock.calls[0][1]).toBe(loggedInIdentityMock.gid_name)
    expect(navigateToProfilePageMock.mock.calls[0][2]).toBeUndefined()
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should only return add to contacts menu item', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.ADD_OR_REMOVE_CONTACT,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('add-contact')

    expect(addUserToContactsMock).not.toHaveBeenCalled()

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    expect(onClickMock).toHaveBeenCalled()

    expect(addUserToContactsMock).toHaveBeenCalled()
    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
    expect(removeUserFromContactsMock).not.toHaveBeenCalled()
    expect(reportUserByEmailMock).not.toHaveBeenCalled()
    expect(userExistsInContactsMock).toHaveBeenCalled()
  })

  it('should only return remove from contacts menu item', async () => {
    userExistsInContactsMock.mockResolvedValue(true)

    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.ADD_OR_REMOVE_CONTACT,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('remove-contact')

    expect(removeUserFromContactsMock).not.toHaveBeenCalled()

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    expect(onClickMock).toHaveBeenCalled()

    expect(addUserToContactsMock).not.toHaveBeenCalled()
    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
    expect(removeUserFromContactsMock).toHaveBeenCalled()
    expect(reportUserByEmailMock).not.toHaveBeenCalled()
    expect(userExistsInContactsMock).toHaveBeenCalled()
  })

  it('should only return block user menu item', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.BLOCK_OR_UNBLOCK_USER,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('block-user')

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    const participants: string[] = [
      testParameters.identity?.gid_uuid as string,
      loggedInIdentityMock.gid_uuid,
    ]

    expect(onClickMock).toHaveBeenCalled()
    expect(blockUserApiMock).toHaveBeenCalledWith(testParameters.identity?.gid_uuid)
    expect(searchChannelsApiMock).toHaveBeenCalledWith({}, {
      participants: participants,
      channelTypes: [
        ChannelType.PERSONAL,
      ],
    })

    expect(addUserToContactsMock).not.toHaveBeenCalled()
    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
    expect(removeUserFromContactsMock).not.toHaveBeenCalled()
    expect(reportUserByEmailMock).not.toHaveBeenCalled()
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should only return unblock user menu item', async () => {
    await prepareBlockedUsers(testParameters.identity?.gid_uuid as string, loggedInIdentityMock.gid_uuid)

    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.BLOCK_OR_UNBLOCK_USER,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('unblock-user')

    await act(async () => {
      await result.current?.[0].onClick?.()
    })

    const participants: string[] = [
      testParameters.identity?.gid_uuid as string,
      loggedInIdentityMock.gid_uuid,
    ]

    expect(onClickMock).toHaveBeenCalled()
    expect(unblockUserApiMock).toHaveBeenCalledWith(testParameters.identity?.gid_uuid)
    expect(searchChannelsApiMock).toHaveBeenCalledWith({}, {
      participants: participants,
      channelTypes: [
        ChannelType.PERSONAL,
      ],
    })

    expect(addUserToContactsMock).not.toHaveBeenCalled()
    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
    expect(removeUserFromContactsMock).not.toHaveBeenCalled()
    expect(reportUserByEmailMock).not.toHaveBeenCalled()
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should only return report user menu item', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.REPORT_USER,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('report-user')

    expect(reportUserByEmailMock).not.toHaveBeenCalled()

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    expect(onClickMock).toHaveBeenCalled()

    expect(addUserToContactsMock).not.toHaveBeenCalled()
    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
    expect(removeUserFromContactsMock).not.toHaveBeenCalled()
    expect(reportUserByEmailMock).toHaveBeenCalledWith(identityMock.gid_name, loggedInIdentityMock.gid_name)
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should only return request vouch menu item', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.REQUEST_VOUCH,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('request-vouch')

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    expect(onClickMock).toHaveBeenCalled()

    expect(addUserToContactsMock).not.toHaveBeenCalled()
    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
    expect(removeUserFromContactsMock).not.toHaveBeenCalled()
    expect(reportUserByEmailMock).not.toHaveBeenCalled()
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should only return send message menu item', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.SEND_MESSAGE,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('send-message')

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    expect(onClickMock).toHaveBeenCalled()

    expect(addUserToContactsMock).not.toHaveBeenCalled()
    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
    expect(removeUserFromContactsMock).not.toHaveBeenCalled()
    expect(reportUserByEmailMock).not.toHaveBeenCalled()
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should only return send money menu item', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.SEND_MONEY,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('send-money')

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    expect(onClickMock).toHaveBeenCalled()

    expect(addUserToContactsMock).not.toHaveBeenCalled()
    expect(navigateToProfilePageMock).not.toHaveBeenCalled()
    expect(removeUserFromContactsMock).not.toHaveBeenCalled()
    expect(reportUserByEmailMock).not.toHaveBeenCalled()
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should only return view profile menu item', async () => {
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      profilePageTarget: ProfilePageTarget.BLANK,
      options: [
        IdentityMenuOption.VIEW_PROFILE,
      ],
    })

    expect(result.current).not.toBeUndefined()
    expect(result.current).toHaveLength(1)
    expect(result.current?.[0].id).toBe('view-profile')

    expect(navigateToProfilePageMock).not.toHaveBeenCalled()

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    expect(onClickMock).toHaveBeenCalled()

    expect(addUserToContactsMock).not.toHaveBeenCalled()
    expect(navigateToProfilePageMock).toHaveBeenCalled()
    expect(navigateToProfilePageMock.mock.calls[0][1]).toBe(identityMock.gid_name)
    expect(navigateToProfilePageMock.mock.calls[0][2]).toBe(ProfilePageTarget.BLANK)
    expect(removeUserFromContactsMock).not.toHaveBeenCalled()
    expect(reportUserByEmailMock).not.toHaveBeenCalled()
    expect(userExistsInContactsMock).not.toHaveBeenCalled()
  })

  it('should remove channel with right participants when user is blocked', async () => {

    const participants: string[] = [
      testParameters.identity?.gid_uuid as string,
      loggedInIdentityMock.gid_uuid,
    ]
    const channelId: string = 'test_channel_id'

    await prepareChannelWithParticipants(participants, channelId, ChannelType.PERSONAL)
    await waitForExpect(() => {
      const channel = store.getState().channels.channels[channelId]

      expect(channel).toBeDefined();
      (channelsSliceHelpers.getChannelByParticipants as jest.Mock) = getChannelByParticipantsMock.mockReturnValueOnce(channel?.channel)
    })

    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.BLOCK_OR_UNBLOCK_USER,
      ],
    })

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    await waitForExpect(() => {
      const channel = store.getState().channels.channels[channelId]

      expect(channel).toBeUndefined()
    })
  })

  it('shouldn\'t remove channel with wrong channel type when user is blocked', async () => {
    const participants: string[] = [
      testParameters.identity?.gid_uuid as string,
      loggedInIdentityMock.gid_uuid,
    ]
    const channelId: string = 'test_channel_id'

    await prepareChannelWithParticipants(participants, channelId, ChannelType.MULTI)
    await waitForExpect(() => {
      const channel = store.getState().channels.channels[channelId]

      expect(channel).not.toBeUndefined()
    })

    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.BLOCK_OR_UNBLOCK_USER,
      ],
    })

    await act(async () => {
      await result.current?.[0].onClick?.()
    })
    await waitForExpect(() => {
      const channel = store.getState().channels.channels[channelId]

      expect(channel).not.toBeUndefined()
    })
  })
  it('should add channel with right participants when user is unblocked if channel previously existed', async () => {
    const blockeUserUuid: string = testParameters.identity?.gid_uuid as string

    const participants: string[] = [
      blockeUserUuid,
      loggedInIdentityMock.gid_uuid,
    ]
    const channelId: string = 'test_channel_id2'

    await waitForExpect(() => {
      const channel = store.getState().channels.channels[channelId]

      expect(channel).toBeUndefined()
    })
    await prepareBlockedUsers(blockeUserUuid, loggedInIdentityMock.gid_uuid)
    const result: HookResult<QuickMenuItemProps[] | undefined> = await getHookResult({
      ...testParameters,
      options: [
        IdentityMenuOption.BLOCK_OR_UNBLOCK_USER,
      ],
    });

    (channelsApi.searchChannels as jest.Mock) = jest.fn().mockResolvedValueOnce(
      getChannelResponseWithMeta(channelId, participants)
    )
    expect(result.current?.[0].id).toBe('unblock-user')
    await act(async () => {
      await result.current?.[0].onClick?.()
    })

    await waitForExpect(() => {
      const channel = store.getState().channels.channels[channelId]

      expect(channel).not.toBeUndefined()
    })
  })
})
