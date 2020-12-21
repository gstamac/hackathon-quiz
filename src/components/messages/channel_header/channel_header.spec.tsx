import React from 'react'
import { cleanup, getByText, RenderResult, queryByAltText } from '@testing-library/react'
import { ChannelHeader } from '.'
import { render, userEvent, act } from '../../../../tests/test_utils'
import { ChannelWithParticipants } from '@globalid/messaging-service-sdk'
import {
  channelDetailsMock,
  channelWithMoreParticipantsMock,
  channelWithOneParticipantMock,
  membersMock,
  multiChannelDetailsMock,
  groupChannelMock,
  channelHeaderDetailsMock,
  channelWithBotParticipantMock,
  botChannelDetailsMock,
} from '../../../../tests/mocks/channels_mock'
import { store } from '../../../store'
import { setChannel, setMembers, setMemberIds } from '../../../store/channels_slice/channels_slice'
import * as useChannelDetailsHook from './use_channel_details'
import * as utils from '../../../utils'
import * as channels_api from '../../../services/api/channels_api'
import * as router_utils from '../../../utils/router_utils'
import { ChannelType } from '../../../store/interfaces'
import { useFetchMembers } from './use_fetch_members'
import { mocked } from 'ts-jest/utils'
import { UseFetchMembersResult } from './interfaces'
import { IdentityByUUID } from '../interfaces'

jest.mock('./use_channel_details')
jest.mock('../../../services/api/channels_api')
jest.mock('../../../utils/router_utils')
jest.mock('./use_fetch_members')

describe('Channel Header', () => {
  let renderResult: RenderResult
  const useChannelDetailsMock: jest.Mock = jest.fn()
  const updateChannelMock: jest.Mock = jest.fn()
  const openInNewTabMock: jest.Mock = jest.fn()

  const useFetchMembersMock = mocked(useFetchMembers)

  const getRenderResult = async (channel: ChannelWithParticipants, showOwner: boolean): Promise<void> => {
    store.dispatch(setChannel(channel))
    store.dispatch(setMemberIds({
      channel_id: channel.id,
      member_ids: channel.participants,
    }))
    store.dispatch(setMembers(channel.participants.map((gid_uuid: string) => ({
      ...membersMock[gid_uuid],
      gid_uuid,
    }))))

    await act(async () => {
      renderResult = render(
        <ChannelHeader showOwner={showOwner} channelId={channel.id} gidUuid='6196ffd4-d433-49d2-a658-6ca9122ffe32' readOnly={false} hiddenMembers={false}/>
      )
    })
  }

  const mockFetchMembers = (channel: ChannelWithParticipants, returnValue?: Partial<UseFetchMembersResult>): void => {
    useFetchMembersMock.mockReturnValue({
      isFetching: returnValue?.isFetching ?? false,
      isLoading: returnValue?.isLoading ?? false,
      members: channel.participants.reduce((identities: IdentityByUUID, gidUuid: string) => ({
        ...identities,
        [gidUuid]: {
          ...membersMock[gidUuid],
          gid_uuid: gidUuid,
        },
      }), {}),
    })
  }

  beforeEach(async () => {
    (useChannelDetailsHook.useChannelDetails as jest.Mock) = useChannelDetailsMock.mockReturnValue(channelDetailsMock);
    (channels_api.updateChannel as jest.Mock) = updateChannelMock;
    (router_utils.openInNewTab as jest.Mock) = openInNewTabMock

    useFetchMembersMock.mockReturnValue({
      isFetching: false,
      isLoading: false,
      members: {},
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render the header in groups tab', async () => {
    await getRenderResult(channelWithMoreParticipantsMock, true)

    const header: Element = renderResult.getByTestId('channel-header')
    const logo: Element | null = renderResult.queryByAltText('avatar')
    const participantsCounter: Element = renderResult.getByText('3 members')

    expect(header).toBeDefined()
    expect(logo).toBeDefined()
    expect(participantsCounter).toBeDefined()
  })

  it('should render the header in primary tab', async () => {
    await getRenderResult(channelWithMoreParticipantsMock, true)

    const header: Element = renderResult.getByTestId('channel-header')
    const logo: Element | null = renderResult.queryByAltText('avatar')
    const participantsCounter: Element = renderResult.getByText('3 members')

    expect(header).toBeDefined()
    expect(logo).toBeNull()
    expect(participantsCounter).toBeDefined()
  })

  it('should open the Channel Options', async () => {
    await getRenderResult(channelWithOneParticipantMock, true)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const options: HTMLElement = renderResult.getByRole('presentation')
    const logo: Element | null = queryByAltText(options, 'avatar')
    const description: Element = getByText(options, 'header description')

    expect(options).toBeDefined()
    expect(logo).toBeDefined()
    expect(description).toBeDefined()
  })

  it('should open the Members Sidebar', async () => {
    useChannelDetailsMock.mockReturnValue({
      ...channelDetailsMock,
      memberUuids: channelWithMoreParticipantsMock.participants,
      channelType: ChannelType.GROUP,
    })

    mockFetchMembers(channelWithMoreParticipantsMock)

    await getRenderResult(channelWithMoreParticipantsMock, true)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const options: HTMLElement = renderResult.getByRole('presentation')
    const viewMembers: Element = getByText(options, utils.getString('view-members'))

    act(() => {
      userEvent.click(viewMembers)
    })

    const sidebar: Element = renderResult.getByRole('drawer')
    const members: Element[] = renderResult.getAllByTestId('user-info-wrapper')

    expect(members).toHaveLength(2)
    expect(sidebar).toBeDefined()
  })

  it('should open the Channel Options for Bot Channel', async () => {
    useChannelDetailsMock.mockReturnValue(botChannelDetailsMock)

    await getRenderResult(channelWithBotParticipantMock, true)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const actionOne: Element | null = renderResult.queryByText(utils.getString('user-settings-view-profile'))
    const actionTwo: Element | null = renderResult.queryByText(utils.getString('view-members'))

    const optionOne: HTMLElement | null = renderResult.queryByText('Add to contacts')
    const optionTwo: HTMLElement | null = renderResult.queryByText('Block user')
    const optionThree: HTMLElement | null = renderResult.getByText('Report user')

    expect(actionOne).toBeNull()
    expect(actionTwo).toBeNull()

    expect(optionOne).toBeNull()
    expect(optionTwo).toBeNull()
    expect(optionThree).not.toBeNull()
  })

  it('should open the Edit Channel Dialog and update channel', async () => {
    useChannelDetailsMock.mockReturnValue(multiChannelDetailsMock)

    await getRenderResult(channelWithMoreParticipantsMock, true)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const editChannelButton: Element = renderResult.getByText(utils.getString('edit-conversation'))

    expect(editChannelButton).toBeDefined()

    act(() => {
      userEvent.click(editChannelButton)
    })

    const saveChangesButton: Element = renderResult.getByText('Save')

    expect(saveChangesButton).toBeDefined()

    act(() => {
      userEvent.click(saveChangesButton)
    })

    expect(updateChannelMock).toHaveBeenCalled()
  })

  it('should fail updating channel when API throws an error', async () => {
    useChannelDetailsMock.mockReturnValue(multiChannelDetailsMock)
    updateChannelMock.mockRejectedValue(new Error())

    await getRenderResult(channelWithMoreParticipantsMock, true)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const editChannelButton: Element = renderResult.getByText(utils.getString('edit-conversation'))

    act(() => {
      userEvent.click(editChannelButton)
    })

    const saveChangesButton: Element = renderResult.getByText('Save')

    act(() => {
      userEvent.click(saveChangesButton)
    })

    expect(updateChannelMock).toHaveBeenCalled()
  })

  it('should close Edit Channel Dialog', async () => {
    useChannelDetailsMock.mockReturnValue(multiChannelDetailsMock)
    updateChannelMock.mockRejectedValue(new Error())

    await getRenderResult(channelWithMoreParticipantsMock, true)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const editChannelButton: Element = renderResult.getByText(utils.getString('edit-conversation'))

    act(() => {
      userEvent.click(editChannelButton)
    })

    const closeDialogButton: Element = renderResult.getByAltText('close')

    act(() => {
      userEvent.click(closeDialogButton)
    })

    expect(updateChannelMock).not.toHaveBeenCalled()
  })

  it('Should redirect user to the group display with uuid param', async () => {
    useChannelDetailsMock.mockReturnValue(channelHeaderDetailsMock)
    await getRenderResult(groupChannelMock, true)
    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const viewGroup: Element = renderResult.getByText(utils.getString('view-group'))

    act(() => {
      userEvent.click(viewGroup)
    })

    expect(openInNewTabMock).toHaveBeenCalledWith(`/app/groups/${channelHeaderDetailsMock.groupUuid}`)
  })

  it('Should not render view group button when group uuid is undefined', async () => {
    useChannelDetailsMock.mockReturnValue({...channelHeaderDetailsMock, groupUuid: undefined })
    await getRenderResult(groupChannelMock, true)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const viewGroup: Element | null = renderResult.queryByText(utils.getString('view-group'))

    expect(viewGroup).toBeNull()
  })

  it('Should render null when channel details are null', async () => {
    useChannelDetailsMock.mockReturnValue(null)
    await getRenderResult(channelWithMoreParticipantsMock, true)

    const header: Element | null = renderResult.queryByTestId('channel-header')
    const logo: Element | null = renderResult.queryByAltText('avatar')
    const participantsCounter: Element | null = renderResult.queryByText('3 members')

    expect(header).toBeNull()
    expect(logo).toBeNull()
    expect(participantsCounter).toBeNull()
  })
})
