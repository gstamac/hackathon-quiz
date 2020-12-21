import React from 'react'
import { ChannelCreate } from './channel_create'
import { act } from 'react-dom/test-utils'
import {
  GetContactsHookResult,
  SearchIdentitiesHookResult,
} from '../../hooks/interfaces'
import * as useGetContactsHook from '../../hooks/use_get_contacts_hook'
import * as useSearchIdentitiesHook from '../../hooks/use_search_identities_hook'
import * as channel_helpers from '../../utils/channel_helpers'
import * as api from '../../services/api'
import { render, userEvent, cleanup, RenderResult } from '../../../tests/test_utils'
import { getString } from '../../utils'
import { identityMock } from '../../../tests/mocks/identity_mock'
import { fetchIdentities } from '../../store/identities_slice'
import { store, history } from '../../store'
import { channelWithBotParticipantMock, foldersMock } from '../../../tests/mocks/channels_mock'
import { contactMock } from '../../../tests/mocks/contacts_mock'
import * as channelsApi from '../../services/api/channels_api'
import { emptyChannelsResponseWithPaginationMetaMock } from '../../../tests/mocks/channels_mocks'
import { fetchFolders } from '../../store/channels_slice/channels_slice'

jest.mock('../../hooks/use_get_contacts_hook')
jest.mock('../../hooks/use_search_identities_hook')
jest.mock('../../services/api')
jest.mock('../../utils/channel_helpers')
jest.mock('../../services/api/channels_api')

describe('ChannelCreate', () => {
  let renderResult: RenderResult

  const getContactsHookMock: jest.Mock = jest.fn()
  const createConversationMock: jest.Mock = jest.fn()
  const searchChannelsApiMock: jest.Mock = jest.fn()
  const getIdentityPublicMock: jest.Mock = jest.fn()
  const getIdentitiesLookupMock: jest.Mock = jest.fn()
  const onCreateMock: jest.Mock = jest.fn()
  const getContactsHookResult: GetContactsHookResult = {
    contacts: [],
    hasNextPage: false,
    isContactsLoading: false,
    loadNextPage: () => ({}),
  }
  const useSearchIdentitiesHookMock: jest.Mock = jest.fn()
  const useSearchIdentitiesHookResult: SearchIdentitiesHookResult = {
    handleSearchInputChange: () => ({}),
    hasNextPage: false,
    identities: [],
    isSearching: false,
    loadNextPage: () => ({}),
    searchText: '',
  }

  const selectParticipantsAndSubmit = async (selectedParticipants: number): Promise<void> => {
    const checkbox: Element[] = renderResult.getAllByRole('checkbox')

    for (let i = 0; i < selectedParticipants; i++) {
      await act(async () => {
        userEvent.click(checkbox[i])
      })
    }

    const buttons: Element[] = renderResult.getAllByRole('button')

    await act(async () => {
      userEvent.click(buttons[1])
    })
  }

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(<ChannelCreate onCreate={onCreateMock}/>)
    })
  }

  beforeEach(() => {
    (useGetContactsHook.useGetContactsHook as jest.Mock) = getContactsHookMock.mockReturnValue(getContactsHookResult);
    (useSearchIdentitiesHook.useSearchIdentitiesHook as jest.Mock) = useSearchIdentitiesHookMock.mockReturnValue(useSearchIdentitiesHookResult);
    (channel_helpers.createConversation as jest.Mock) = createConversationMock;
    (channelsApi.searchChannels as jest.Mock) = searchChannelsApiMock.mockReturnValue(emptyChannelsResponseWithPaginationMetaMock);
    (api.getIdentityPublic as jest.Mock) = getIdentityPublicMock.mockResolvedValue(identityMock);
    (api.getIdentitiesLookup as jest.Mock) = getIdentitiesLookupMock;
    (channelsApi.getFolders as jest.Mock) = jest.fn().mockResolvedValue({
      meta: {
        total: 2,
      },
      data: {
        folders: foldersMock,
      },
    })
    store.dispatch(fetchFolders({}))
    renderComponent()
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render search identities bar with elements', () => {
    const header: Element | null = renderResult.queryByText(getString('messages-title'))
    const doneButton: Element | null = renderResult.queryByText(getString('done'))
    const buttons: Element[] = renderResult.getAllByRole('button')
    const identitiesSearch: Element = renderResult.getByTestId('identities-search')

    expect(identitiesSearch).toBeDefined()
    expect(doneButton).not.toBeNull()
    expect(header).toBeNull()
    expect(buttons).toHaveLength(2)
  })

  it('Should render done button in disable mode', () => {
    const buttons: Element[] = renderResult.getAllByRole('button')

    expect(buttons[1]).toBeDisabled()
  })

  it('Should check selected participants list items', async () => {
    const identities = [
      identityMock,
      {
        ...identityMock,
        gid_uuid: 'gid_uuid',
      },
      {
        ...identityMock,
        gid_uuid: 'gid_uui2',
      },
      {
        ...identityMock,
        gid_uuid: 'gid_uui3',
      },
    ]

    getIdentitiesLookupMock.mockResolvedValue({
      data: identities,
      meta: {
        total: 4,
      },
    })

    act(() => {
      store.dispatch(fetchIdentities({ page: 1, text: 'stage2' }))
    })

    useSearchIdentitiesHookMock.mockReturnValue({
      ...useSearchIdentitiesHookResult,
      searchText: 'stage2',
      identities,
    })

    renderComponent()

    const checkbox: Element[] = renderResult.getAllByRole('checkbox')

    getIdentityPublicMock.mockResolvedValue({ ...identityMock, gid_uuid: 'gid_uuid' })

    await act(async () => {
      userEvent.click(checkbox[0])
    })

    const selectedParticipant: Element[] = renderResult.queryAllByAltText('remove item')

    expect(selectedParticipant[0]).toBeDefined()
    expect(selectedParticipant[1]).toBeUndefined()

    getIdentityPublicMock.mockResolvedValue({ ...identityMock, gid_uuid: 'gid_uuid1' })

    await act(async () => {
      userEvent.click(checkbox[1])
    })

    const selectedParticipants: Element[] = renderResult.queryAllByAltText('remove item')

    expect(selectedParticipants[0]).toBeDefined()
    expect(selectedParticipants[1]).toBeDefined()

    const buttons: Element[] = renderResult.getAllByRole('button')

    expect(buttons[1]).toBeEnabled()
  })

  it('Should create new encrypted chat', async () => {
    getContactsHookMock.mockReturnValue({ ...getContactsHookResult, contacts: [contactMock] })
    createConversationMock.mockResolvedValue(channelWithBotParticipantMock)
    getIdentityPublicMock.mockResolvedValue(identityMock)

    renderComponent()

    await selectParticipantsAndSubmit(1)

    expect(createConversationMock).toHaveBeenCalledWith(
      ['6196ffd4-d433-49d2-a658-6ca9122ffe32'],
      '6196ffd4-d433-49d2-a658-6ca9122ffe32',
      foldersMock,
      store.dispatch,
      history,
      { actionBeforeRedirect: expect.any(Function)}
    )
  })

  it('Should create new multi chat channel', async () => {
    getContactsHookMock.mockReturnValue({
      ...getContactsHookResult,
      contacts: [{ ...contactMock, gid_uuid: 'mock_uuid1' }, { ...contactMock, gid_uuid: 'mock_uuid' }],
    })
    createConversationMock.mockResolvedValue(channelWithBotParticipantMock)
    getIdentityPublicMock.mockResolvedValue(identityMock)

    renderComponent()

    await selectParticipantsAndSubmit(2)

    expect(createConversationMock).toHaveBeenCalledWith(
      ['mock_uuid', 'mock_uuid1'],
      '6196ffd4-d433-49d2-a658-6ca9122ffe32',
      foldersMock,
      store.dispatch,
      history,
      { actionBeforeRedirect: expect.any(Function)}
    )
  })
})
