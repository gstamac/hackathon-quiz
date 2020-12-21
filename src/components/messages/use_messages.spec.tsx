import { useMessages } from './use_messages'
import { EncryptionStatus, UseMessagesResponse } from './interfaces'
import { cleanup, testCustomHook, TestCustomHookType } from '../../../tests/test_utils'
import { deviceKeyManager } from '../../init'
import { channelWithParticipantsTypeMulti, foldersResponseMock } from '../../../tests/mocks/channels_mock'
import { groupMock } from '../../../tests/mocks/group_mocks'
import * as channels_api from '../../services/api/channels_api'
import { shouldFetchFileToken } from '../../store/channels_slice/helpers'
import { globalIdIdentityMock } from '../../../tests/mocks/identity_mock'
import { mocked } from 'ts-jest/utils'

jest.mock('../../store/channels_slice/helpers', () => ({
  ...jest.requireActual<{}>('../../store/channels_slice/helpers'),
  shouldFetchFileToken: jest.fn(),
}))
jest.mock('../../services/api/channels_api')

const getHookResult: TestCustomHookType<undefined, UseMessagesResponse> = (
  testCustomHook(useMessages, undefined, {
    path: '/useGetMessagingGroupsHook/test/:type?/:groupUuid?/:channelId?',
    historyPath: `/useGetMessagingGroupsHook/test/g/${groupMock.uuid}/${channelWithParticipantsTypeMulti.id}`,
    identity: globalIdIdentityMock,
  })
)

describe('useMessages tests', () => {
  const deviceKeyInitSpy: jest.SpyInstance =
    jest.spyOn(deviceKeyManager, 'init')
      .mockImplementation(jest.fn())
  const getFileChannelMock = mocked(channels_api.getFileToken)

  mocked(shouldFetchFileToken).mockReturnValue(true)
  mocked(channels_api.getFolders).mockResolvedValue(foldersResponseMock)

  afterEach(async () => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should call getFileToken when channelId is defined', async () => {
    const result: UseMessagesResponse = (await getHookResult(undefined)).current

    expect(result.channelId).toBeDefined()
    expect(getFileChannelMock).toHaveBeenCalledWith(channelWithParticipantsTypeMulti.id)
  })

  it('should return hook results', async () => {
    const result: UseMessagesResponse = (await getHookResult(undefined)).current

    expect(deviceKeyInitSpy).toHaveBeenCalled()
    expect(result.encryptionStatus).toBeDefined()
    expect(result.type).toEqual('g')
    expect(result.channelId).toEqual(channelWithParticipantsTypeMulti.id)
    expect(result.groupUuid).toEqual(groupMock.uuid)
    expect(result.encryptionStatus).toEqual(EncryptionStatus.KEY_MANAGER_INITIALIZED)
  })
})
