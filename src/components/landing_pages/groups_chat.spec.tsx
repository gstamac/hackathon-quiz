import React from 'react'
import { cleanup, act } from '@testing-library/react'
import { channelHeaderDetailsMock, groupChannelMock } from '../../../tests/mocks/channels_mock'
import { GroupsChat } from './groups_chat'
import { RenderResult, render, userEvent } from '../../../tests/test_utils'
import { getString } from '../../utils'
import { store } from '../../store'
import { setGroup } from '../../store/groups_slice'
import { groupMock } from '../../../tests/mocks/group_mocks'
import * as useChatContainer from '../messages/messenger_chat/use_chat_container'
import { ChatInformation } from '../messages/interfaces'
import { publicIdentityMock } from '../../../tests/mocks/identity_mock'
import * as useChannelDetails from '../messages/channel_header/use_channel_details'
import * as router_utils from '../../../src/utils/router_utils'

jest.mock('../../utils/router_utils')

describe('Group Chat Landing page', () => {
  let renderResult: RenderResult

  const useChatContainerHooksMock: jest.Mock = jest.fn()
  const useChannelDetailsMock: jest.Mock = jest.fn()
  const openInNewTabMock: jest.Mock = jest.fn()

  const renderComponent = async (groupUuid?: string, channelUuid?: string): Promise<void> => {
    await act(async () => {
      renderResult = render(<GroupsChat groupUuid={groupUuid} channelId={channelUuid}/>)
    })
  }

  const chatInformationMock: ChatInformation = {
    readOnly: false,
    identity: publicIdentityMock,
    showOwner: true,
    hiddenMembers: false,
    isHiddenMember: false,
  }

  beforeAll(() => {
    (useChatContainer.useChatContainer as jest.Mock) = useChatContainerHooksMock.mockReturnValue(chatInformationMock);
    (useChannelDetails.useChannelDetails as jest.Mock) = useChannelDetailsMock.mockReturnValue(channelHeaderDetailsMock);
    (router_utils.openInNewTab as jest.Mock) = openInNewTabMock

    store.dispatch(setGroup({
      key: groupMock.gid_uuid,
      value: groupMock,
    }))
  })

  afterEach(() => {
    cleanup()
  })

  it('Should render the group chat landing page when no group is being selected', async () => {
    await renderComponent(undefined, groupChannelMock.uuid)

    const groupChatComponent: Element = renderResult.getByTestId('groups_chat')
    const backgroundIcon: Element = renderResult.getByAltText('Background icon')
    const descriptionText: Element = renderResult.getByText(getString('select-group-chatting'))

    expect(groupChatComponent).toBeDefined()
    expect(backgroundIcon).toBeDefined()
    expect(descriptionText).toBeDefined()
  })

  it('Should render the group chat landing page when a group is being selected', async () => {
    await renderComponent(groupMock.gid_uuid, groupChannelMock.uuid)

    const groupChatComponent: Element = renderResult.getByTestId('groups_chat')
    const backgroundIcon: Element = renderResult.getByAltText('Background icon')

    expect(backgroundIcon).toBeDefined()
    expect(groupChatComponent).toBeDefined()
    expect(groupChatComponent.innerHTML).toContain(groupMock.display_name)
  })

  it('Should render loaderSpinner when groupchannel is not fetched yet', async () => {
    await renderComponent(groupMock.gid_uuid)

    const groupChatComponent: Element = renderResult.getByTestId('globalid-loader')

    expect(groupChatComponent).toBeDefined()
  })

  it('Should render the group chat landing page with gid_name', async () => {
    store.dispatch(setGroup({
      key: groupMock.gid_uuid,
      value: {
        ...groupMock,
        display_name: undefined,
      },
    }))

    await renderComponent(groupMock.gid_uuid, groupChannelMock.uuid)

    const groupChatComponent: Element = renderResult.getByTestId('groups_chat')
    const backgroundIcon: Element = renderResult.getByAltText('Background icon')

    expect(backgroundIcon).toBeDefined()
    expect(groupChatComponent).toBeDefined()
    expect(groupChatComponent.innerHTML).toContain(groupMock.gid_name)
  })

  it('Should render the group chat landing with header component', async () => {
    await renderComponent(groupMock.gid_uuid, groupChannelMock.id)

    const groupChatComponent: Element = renderResult.getByTestId('groups_chat')
    const backgroundIcon: Element = renderResult.getByAltText('Background icon')
    const channelHeader: Element = renderResult.getByTestId('channel-header')
    const membersCountHeader: Element = renderResult.getByText(channelHeaderDetailsMock.membersDescription)
    const avatar: Element = renderResult.getByAltText('avatar')

    expect(backgroundIcon).toBeDefined()
    expect(groupChatComponent).toBeDefined()
    expect(groupChatComponent.innerHTML).toContain(groupMock.gid_name)
    expect(channelHeader).toBeDefined()
    expect(membersCountHeader).toBeDefined()
    expect(avatar).toBeDefined()
  })

  it('Should open the group channel header settings menu', async () => {
    await renderComponent(groupMock.uuid, groupChannelMock.uuid)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const groupChannelDescription: Element = renderResult.getByText(channelHeaderDetailsMock.description as string)
    const viewMembers: Element = renderResult.getByText(getString('view-members'))

    expect(groupChannelDescription).toBeDefined()
    expect(viewMembers).toBeDefined()
  })

  it('Should redirect user to the group display with group uuid param', async () => {
    await renderComponent(groupMock.uuid, groupChannelMock.uuid)

    const button: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(button)
    })

    const viewGroup: Element = renderResult.getByText(getString('view-group'))

    act(() => {
      userEvent.click(viewGroup)
    })

    expect(openInNewTabMock).toHaveBeenCalledWith(`/app/groups/${channelHeaderDetailsMock.groupUuid}`)
  })
})
