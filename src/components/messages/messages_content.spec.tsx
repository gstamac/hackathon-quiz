import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { render } from '../../../tests/test_utils'
import { getChannelResponseMock } from '../../../tests/mocks/channels_mocks'
import * as channels_api from '../../services/api/channels_api'
import * as groups_api from '../../services/api/groups_api'
import { MessagesType, EncryptionStatus } from './interfaces'
import { store, history } from '../../store'
import { setChannels, setIsFetching, setIsFetchingAll } from '../../store/channels_slice/channels_slice'
import { foldersResponseMock } from '../../../tests/mocks/channels_mock'
import { getString } from '../../utils'
import { MessagesContent } from '.'
import { fetchGroupsByUUIDs } from '../../store/groups_slice'
import { groupMock } from '../../../tests/mocks/group_mocks'
import { BASE_MESSAGES_URL } from '../../constants'

jest.mock('../../services/api/channels_api')
jest.mock('../../services/api/groups_api')

Element.prototype.scrollTo = () => ({})

describe('Messages Content', () => {
  let renderResult: RenderResult
  const getFoldersMock: jest.Mock = jest.fn()
  const setEncryptionStatusMock: jest.Mock = jest.fn()
  const getGroupsByUUIDMock: jest.Mock = jest.fn()

  const renderComponent = async (
    type: MessagesType,
    channelId?: string,
    encryption: EncryptionStatus = EncryptionStatus.ENABLED,
    groupUuid?: string
  ): Promise<void> => {
    await act(async () => {
      renderResult = render(<MessagesContent
        type={type} channelId={channelId}
        encryptionStatus={encryption}
        setEncryptionStatus={setEncryptionStatusMock}
        groupUuid={groupUuid}
      />)
    })
  }

  beforeAll(() => {
    (channels_api.getFolders as jest.Mock) = getFoldersMock;
    (groups_api.getGroupsByUUID as jest.Mock) = getGroupsByUUIDMock
    store.dispatch(setIsFetchingAll(false))
  })

  beforeEach(() => {
    getFoldersMock.mockResolvedValue(foldersResponseMock)
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render the Messages Content Component with Loading spinner landing page before channels are fetched', async () => {

    await renderComponent(MessagesType.GROUPS, getChannelResponseMock.id)

    const spinner: Element = renderResult.getByRole('spinner')

    expect(spinner).not.toBeNull()
  })

  it('Should render the Messages Content Component with no chat landing page when on Primary tab', async () => {
    await renderComponent(MessagesType.PRIMARY)

    const noChatsTitle: Element | null = renderResult.queryByText(getString('no-chats-title'))
    const noChatsDescription: Element | null = renderResult.queryByText(getString('no-chats-description'))

    expect(noChatsTitle).not.toBeNull()
    expect(noChatsDescription).not.toBeNull()
  })

  it('Should render the Messages Content Component with no chat landing page when on Other tab', async () => {
    await renderComponent(MessagesType.OTHER)

    const noChatsTitle: Element | null = renderResult.queryByText(getString('no-chats-title'))
    const noChatsDescription: Element | null = renderResult.queryByText(getString('no-chats-description'))

    expect(noChatsTitle).not.toBeNull()
    expect(noChatsDescription).not.toBeNull()
  })

  it('Should render the Messages Content Component with Go to Groups landing page when user has no groups', async () => {
    store.dispatch(setChannels([]))
    getGroupsByUUIDMock.mockResolvedValue([])
    store.dispatch(fetchGroupsByUUIDs({ groupUuids: [], meta: { page: 1, total: 0 }, isJoined: true }))
    await renderComponent(MessagesType.GROUPS)

    const go_to_groups_landing_page: Element = renderResult.getByTestId('go_to_groups')

    expect(go_to_groups_landing_page).not.toBeNull()
  })

  it('Should render the Messages Content Component with Group messaging landing page', async () => {
    store.dispatch(setChannels([getChannelResponseMock, { ...getChannelResponseMock, id: '2' }]))
    getGroupsByUUIDMock.mockResolvedValue([groupMock])
    store.dispatch(fetchGroupsByUUIDs({ groupUuids: [groupMock.uuid], meta: { page: 1, total: 1}, isJoined: true }))

    await renderComponent(MessagesType.GROUPS)

    const messages_landing_page: Element = renderResult.getByText('Start chatting with groups')

    expect(messages_landing_page).toBeDefined()
  })

  it('Should render the Enable encryption landing page when encryption is disabled and user is web client user', async () => {
    await renderComponent(MessagesType.GROUPS, undefined, EncryptionStatus.DISABLED)

    const encryption_landing_page: Element = renderResult.getByTestId('e2e_encryption_upgrade')

    expect(encryption_landing_page).toBeDefined()
  })

  it('Should be redirected to Groups Content Component when provided group does not have any channels', async () => {
    getGroupsByUUIDMock.mockResolvedValue([groupMock])
    store.dispatch(fetchGroupsByUUIDs({ groupUuids: [groupMock.uuid], meta: { page: 1, total: 1}, isJoined: true }))

    store.dispatch(setIsFetching({
      key: groupMock.uuid,
      value: false,
    }))

    store.dispatch(setIsFetchingAll(false))

    await renderComponent(MessagesType.GROUPS, undefined, EncryptionStatus.ENABLED, groupMock.uuid)

    expect(history.location.pathname).toEqual(`${BASE_MESSAGES_URL}/${MessagesType.GROUPS}`)
  })
})
