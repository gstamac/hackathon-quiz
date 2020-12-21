import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { render, act } from '../../../../tests/test_utils'
import { ChannelMembersSidebarProps } from './interfaces'
import { channelDetailsMock } from '../../../../tests/mocks/channels_mock'
import { ChannelMembersSidebar } from '.'
import { ChannelType } from '../../../store/interfaces'
import { mocked } from 'ts-jest/utils'
import { useFetchMembers } from './use_fetch_members'

jest.mock('./use_fetch_members')

describe('Channel Members Sidebar', () => {
  let renderResult: RenderResult
  const onExitMock: jest.Mock = jest.fn()

  const useFetchMembersMock = mocked(useFetchMembers)

  const componentProps: ChannelMembersSidebarProps = {
    channelId: 'channelId',
    memberUuids: channelDetailsMock.memberUuids,
    open: true,
    onExit: onExitMock,
    channelType: ChannelType.GROUP,
  }

  const getRenderResult = async (props: ChannelMembersSidebarProps): Promise<void> => {
    await act(async () => {
      renderResult = render(<ChannelMembersSidebar {...props}/>)
    })
  }

  beforeEach(() => {
    useFetchMembersMock.mockReturnValue({
      isFetching: false,
      isLoading: false,
      members: channelDetailsMock.members,
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render the channel members sidebar component properly', async () => {
    await getRenderResult(componentProps)

    const title: Element = renderResult.getByText('Members')
    const closeButton: Element = renderResult.getByAltText('close button')
    const listItems: Element[] = renderResult.queryAllByTestId('identity-list-item')

    expect(title).toBeDefined()
    expect(closeButton).toBeDefined()
    expect(listItems).toHaveLength(channelDetailsMock.memberUuids.length)
  })

  it('should render the channel members sidebar component without any members', async () => {
    await getRenderResult({ ...componentProps, memberUuids: [] })

    const listItems: Element[] = renderResult.queryAllByTestId('identity-list-item')

    expect(listItems).toHaveLength(0)
  })
})
