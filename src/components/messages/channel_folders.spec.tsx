import React from 'react'
import { foldersResponseMock } from '../../../tests/mocks/channels_mock'
import { getFolders } from '../../services/api/channels_api'
import { getGroupsByUUID } from '../../services/api/groups_api'
import { fetchCounters, fetchGroupCounters} from '../../services/api/messaging_api'
import { ChannelFolders } from './channel_folders'
import { render, userEvent, cleanup, RenderResult, act } from '../../../tests/test_utils'
import { history, store } from '../../store'
import { fetchPrimaryFolderCounter, fetchGroupsFolderCounter, fetchOtherFolderCounter } from '../../store/counters_slice'
import { getCountersResponseMock } from '../../../tests/mocks/messages_mock'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { globalIdIdentityMock } from '../../../tests/mocks/identity_mock'
import { getGroupCountersResponseMock } from '../../../tests/mocks/counter_mocks'
import { BASE_MESSAGES_URL } from '../../constants'
import { MessagesType } from './interfaces'
import { mocked } from 'ts-jest/utils'
import { groupMock } from '../../../tests/mocks/group_mocks'

jest.mock('../../services/api/channels_api')
jest.mock('../../services/api/messaging_api')
jest.mock('../../services/api/groups_api')

describe('ChannelFolders', () => {
  const getFoldersMock: jest.Mock = mocked(getFolders)
  const fetchCountersMock: jest.Mock = mocked(fetchCounters)
  const fetchGroupCountersMock: jest.Mock = mocked(fetchGroupCounters)
  const getGroupsByUUIDMock: jest.Mock = mocked(getGroupsByUUID)

  let renderResult: RenderResult
  const renderComponent = (identity?: PublicIdentity): void => {
    act(() => {
      renderResult = render(<ChannelFolders />, { path: `${BASE_MESSAGES_URL}/:type(t|g|m)/:channel_d?`, identity: identity })
    })
  }

  beforeEach(async () => {
    getFoldersMock.mockResolvedValue(foldersResponseMock)
    fetchCountersMock.mockResolvedValue(getCountersResponseMock)
    fetchGroupCountersMock.mockResolvedValue(getGroupCountersResponseMock)
    getGroupsByUUIDMock.mockResolvedValue([{
      ...groupMock,
      uuid: 'group_uuid',
    }])

    await store.dispatch<any>(fetchGroupsFolderCounter({ page: 1 }))
    await store.dispatch<any>(fetchPrimaryFolderCounter('PrimaryFolderUuid'))
    await store.dispatch<any>(fetchOtherFolderCounter('OtherFolderUuid'))
  })

  afterEach(() => {
    cleanup()
  })

  it('Should render the Channels Folders component', () => {
    renderComponent()

    history.push(`${BASE_MESSAGES_URL}/${MessagesType.PRIMARY}`)

    const buttonGroup: Element = renderResult.getByTestId('button_group')
    const buttons: Element[] = renderResult.getAllByRole('button')

    expect(buttonGroup).toBeDefined()
    expect(buttons).toHaveLength(3)
  })

  it('Should render counters when user is of type localId', () => {
    renderComponent()

    history.push(`${BASE_MESSAGES_URL}/${MessagesType.PRIMARY}`)

    const buttonGroup: Element = renderResult.getByTestId('button_group')
    const buttons: Element[] = renderResult.getAllByRole('button')

    expect(buttonGroup).toBeDefined()
    expect(buttons).toHaveLength(3)

    expect(buttons[0].innerHTML).toContain('(9+)')
    expect(buttons[1].innerHTML).toContain('(1)')
    expect(buttons[2].innerHTML).toContain('(9+)')
  })

  it('Should render counters next to all tabs when user is of type Globalid', () => {
    renderComponent(globalIdIdentityMock)

    history.push(`${BASE_MESSAGES_URL}/${MessagesType.PRIMARY}`)

    const buttonGroup: Element = renderResult.getByTestId('button_group')
    const buttons: Element[] = renderResult.getAllByRole('button')

    expect(buttonGroup).toBeDefined()
    expect(buttons).toHaveLength(3)

    expect(buttons[0].innerHTML).toContain('(9+)')
    expect(buttons[1].innerHTML).toContain('(1)')
    expect(buttons[2].innerHTML).toContain('(9+)')
  })

  it('Should change active tab by clicking to the button', () => {
    renderComponent()

    history.push(`${BASE_MESSAGES_URL}/${MessagesType.PRIMARY}`)

    const buttons: Element[] = renderResult.getAllByRole('button')

    expect(buttons[0].className).toContain('buttonWrapperActive')
    expect(buttons[1].className).toContain('buttonWrapperNonActive')
    expect(buttons[2].className).toContain('buttonWrapperNonActive')

    act(() => {
      userEvent.click(buttons[1])
    })

    expect(fetchCountersMock).toHaveBeenCalled()
    expect(buttons[0].className).toContain('buttonWrapperNonActive')
    expect(buttons[1].className).toContain('buttonWrapperActive')
    expect(buttons[2].className).toContain('buttonWrapperNonActive')

    act(() => {
      userEvent.click(buttons[2])
    })

    expect(fetchCountersMock).toHaveBeenCalled()
    expect(buttons[0].className).toContain('buttonWrapperNonActive')
    expect(buttons[1].className).toContain('buttonWrapperNonActive')
    expect(buttons[2].className).toContain('buttonWrapperActive')
  })
})
