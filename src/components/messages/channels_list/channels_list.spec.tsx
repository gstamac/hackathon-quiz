import React from 'react'
import { RenderResult, render, act } from '../../../../tests/test_utils'
import { ChannelsList } from './channels_list'
import { GetChannelsHook } from './interfaces'
import * as getChannelsHook from './use_get_channels_hook'
import { channelWithMoreParticipantsMock, foldersMock } from '../../../../tests/mocks/channels_mock'
import { history, store, ThunkDispatch } from '../../../store'
import { setChannel } from '../../../store/channels_slice/channels_slice'
import { MessagesType } from '../interfaces'
import { BASE_MESSAGES_URL } from '../../../constants'

jest.mock('./use_get_channels_hook')
jest.mock('@reduxjs/toolkit', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('@reduxjs/toolkit') as {},
  unwrapResult: jest.fn().mockReturnValue([]),
}))

describe('ChannelsList', () => {
  let renderResult: RenderResult
  const loadNextPageMock: jest.Mock = jest.fn()
  const useGetChannelsHookMock: jest.Mock = jest.fn()

  const getChannelsHookProps: GetChannelsHook = {
    channelsIds: [channelWithMoreParticipantsMock.id],
    areChannelsLoading: false,
    hasNextPage: false,
    loadNextPage: loadNextPageMock,
  }

  const renderList = async (): Promise<void> => {
    history.push(`${BASE_MESSAGES_URL}/${MessagesType.GROUPS}`)
    await act(async () => {
      renderResult = render(
        <ChannelsList folderType={MessagesType.GROUPS} folders={foldersMock}/>
      )
    })
  }

  beforeEach(async () => {
    (getChannelsHook.useGetChannelsHook as jest.Mock) = useGetChannelsHookMock.mockReturnValue(getChannelsHookProps)
    await (store.dispatch as ThunkDispatch)(setChannel(channelWithMoreParticipantsMock))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the ChannelsList component with list items', async () => {
    await renderList()
    const listItemElement: Element | null = renderResult.queryByTestId('channel-info-wrapper')

    expect(listItemElement).not.toBeNull()
  })

  it('should call loadNextPage function when hasNextPage is true', async () => {
    useGetChannelsHookMock.mockReturnValue({ ...getChannelsHookProps, hasNextPage: true })
    await renderList()
    expect(loadNextPageMock).toHaveBeenCalled()
  })

  it('should not call loadNextPage function when hasNextPage and isChannelsLoading params are true', async () => {
    useGetChannelsHookMock.mockReturnValue({ ...getChannelsHookProps, hasNextPage: true, areChannelsLoading: true })
    await renderList()
    expect(loadNextPageMock).not.toHaveBeenCalled()
  })
})
