import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, userEvent, cleanup, RenderResult } from '../../../tests/test_utils'
import { foldersResponseMock } from '../../../tests/mocks/channels_mock'
import {
  GetContactsHookResult,
  SearchIdentitiesHookResult,
} from '../../hooks/interfaces'
import * as api from '../../services/api'
import { getString } from '../../utils'
import { MessagesType, EncryptionStatus } from './interfaces'
import * as useGetContactsHook from '../../hooks/use_get_contacts_hook'
import * as useSearchIdentitiesHook from '../../hooks/use_search_identities_hook'
import * as channelCreateHook from '../../utils/channel_helpers'
import { ChannelsWrapper } from '.'
import * as useAddGroupChannel from './groups_messaging_list/use_add_group_channel'

jest.mock('../../hooks/use_search_identities_hook')
jest.mock('../../services/api')
jest.mock('../../utils/channel_helpers')

describe('ChannelsWrapper', () => {
  let renderResult: RenderResult

  const getContactsHookMock: jest.Mock = jest.fn()
  const createChannelWithUserDeviceSecretsMock: jest.Mock = jest.fn()
  const useAddGroupChannelMock: jest.Mock = jest.fn()
  const getIdentityPublicMock: jest.Mock = jest.fn()
  const getIdentitiesLookupMock: jest.Mock = jest.fn()
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
  const getFoldersMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (useGetContactsHook.useGetContactsHook as jest.Mock) = getContactsHookMock.mockReturnValue(getContactsHookResult);
    (useSearchIdentitiesHook.useSearchIdentitiesHook as jest.Mock) = useSearchIdentitiesHookMock.mockReturnValue(useSearchIdentitiesHookResult);
    (channelCreateHook.createChannelWithUserDeviceSecrets as jest.Mock) = createChannelWithUserDeviceSecretsMock;
    (useAddGroupChannel.useAddGroupChannel as jest.Mock) = useAddGroupChannelMock.mockReturnValue({ addChannelDisabled: true });
    (api.getIdentityPublic as jest.Mock) = getIdentityPublicMock;
    (api.getIdentitiesLookup as jest.Mock) = getIdentitiesLookupMock;
    (api.getFolders as jest.Mock) = getFoldersMock
  })

  const renderComponent = (type: MessagesType, encryption: EncryptionStatus): void => {
    act(() => {
      getFoldersMock.mockResolvedValue(foldersResponseMock)
      renderResult = render(<ChannelsWrapper folderType={type} encryptionStatus={encryption}/>)
    })
  }

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render the Channels Wrapper component', () => {
    renderComponent(MessagesType.GROUPS, EncryptionStatus.DISABLED)

    const buttonGroup: Element = renderResult.getByTestId('button_group')
    const buttons: Element[] = renderResult.getAllByRole('button')
    const header: Element = renderResult.getByText(getString('messages-title'))

    expect(buttonGroup).toBeDefined()
    expect(header).toBeDefined()
    expect(buttons).toHaveLength(4)
  })

  it('Should hide sidebar for channels list items and show search identities bar', () => {
    renderComponent(MessagesType.PRIMARY, EncryptionStatus.ENABLED)

    const button: Element = renderResult.getByLabelText('add-channel')

    expect(button).toBeEnabled()

    act(() => {
      userEvent.click(button)
    })

    const header: Element | null = renderResult.queryByText(getString('messages-title'))
    const buttons: Element[] = renderResult.getAllByRole('button')

    expect(header).toBeNull()
    expect(buttons).toHaveLength(2)
  })

  it('Should disable add channel button when no group has been selected', () => {
    renderComponent(MessagesType.GROUPS, EncryptionStatus.ENABLED)

    const button: Element = renderResult.getByLabelText('add-channel')

    expect(button).toBeDisabled()

    act(() => {
      userEvent.hover(button)
    })

    const tooltip: Element = renderResult.getByTestId('add-channel-tooltip')

    expect(button).toBeDisabled()
    expect(tooltip).toBeDefined()
    expect(tooltip.getAttribute('title')).toEqual(getString('group-create-select-msg'))
  })

  it('Should disable add group channel button when encryption is not enabled', () => {
    renderComponent(MessagesType.GROUPS, EncryptionStatus.DISABLED)

    const button: Element = renderResult.getByLabelText('add-channel')

    expect(button).toBeDisabled()

    act(() => {
      userEvent.hover(button)
    })

    const tooltip: Element = renderResult.getByTestId('add-channel-tooltip')

    expect(tooltip).toBeDefined()
    expect(tooltip.getAttribute('title')).toEqual(getString('channel-create-enable-encryption'))
  })

  it('Should enable add channel button when adding group channel is possible', () => {
    useAddGroupChannelMock.mockReturnValue({ addChannelDisabled: false })

    renderComponent(MessagesType.GROUPS, EncryptionStatus.ENABLED)

    const button: Element = renderResult.getByLabelText('add-channel')

    expect(button).toBeEnabled()
  })

  it('Should disable add channel button when encryption is not enabled', () => {
    renderComponent(MessagesType.PRIMARY, EncryptionStatus.DISABLED)

    const button: Element = renderResult.getByLabelText('add-channel')

    act(() => {
      userEvent.hover(button)
    })

    const tooltip: Element = renderResult.getByTestId('add-channel-tooltip')

    expect(button).toBeDisabled()
    expect(tooltip).toBeDefined()
    expect(tooltip.getAttribute('title')).toEqual(getString('channel-create-enable-encryption'))
  })

  it('Should enable add channel button when encryption is enabled', () => {
    renderComponent(MessagesType.PRIMARY, EncryptionStatus.ENABLED)

    const button: Element = renderResult.getByLabelText('add-channel')

    expect(button).toBeEnabled()
  })

  it('Should render add channel button first and done button when user stars selecting contacts', () => {
    renderComponent(MessagesType.PRIMARY, EncryptionStatus.ENABLED)

    const button: Element = renderResult.getByLabelText('add-channel')

    act(() => {
      userEvent.click(button)
    })

    const identitiesSearch: Element = renderResult.getByTestId('identities-search')

    expect(identitiesSearch).toBeDefined()

    const doneButton: Element = renderResult.getByText(getString('done'))

    expect(doneButton).toBeDefined()
  })

  it('Should render done button in enable/disable mode regarding the size of selected identities array', () => {
    renderComponent(MessagesType.PRIMARY, EncryptionStatus.ENABLED)

    const button: Element = renderResult.getByLabelText('add-channel')

    act(() => {
      userEvent.click(button)
    })

    const buttons: Element[] = renderResult.getAllByRole('button')

    expect(buttons[1]).toBeDisabled()
  })
})
