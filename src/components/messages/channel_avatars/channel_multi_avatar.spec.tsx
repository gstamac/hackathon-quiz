import React from 'react'
import { RenderResult, render, act, cleanup } from '../../../../tests/test_utils'
import { ChannelMultiAvatar } from './channel_multi_avatar'
import { MultiAvatarProps } from './interfaces'
import { channelWithMoreParticipantsMock } from '../../../../tests/mocks/channels_mock'
import * as api from '../../../services/api/avatar_api'
import { avatarMock } from '../../../../tests/mocks/avatar_mocks'

jest.mock('../../../services/api/avatar_api')

describe('ChannelMultiAvatar', () => {
  let renderResult: RenderResult
  const getAvatarMock = jest.fn()

  beforeEach(async () => {
    (api.getAvatar as jest.Mock) = getAvatarMock.mockResolvedValue(avatarMock)
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  const renderComponent = async (props: MultiAvatarProps): Promise<void> => {
    await act(async () => {
      renderResult = render(<ChannelMultiAvatar {...props}/>)
    })
  }

  it('should render the ChannelMultiAvatar', async () => {
    await renderComponent({
      firstAvatar: {
        image_url: avatarMock,
        uuid: channelWithMoreParticipantsMock.uuid,
      },
      secondAvatar: {
        image_url: avatarMock,
        uuid: channelWithMoreParticipantsMock.uuid,
      },
    })

    expect(getAvatarMock).not.toHaveBeenCalled()
    expect(renderResult.container).not.toBeUndefined()
  })

  it('should render the ChannelMultiAvatar component when image fields are empty', async () => {
    await renderComponent({
      firstAvatar: {
        uuid: channelWithMoreParticipantsMock.uuid,
      },
      secondAvatar: {
        uuid: channelWithMoreParticipantsMock.uuid,
      },
    })

    expect(getAvatarMock).toHaveBeenCalledTimes(2)
    expect(renderResult.container).not.toBeUndefined()
  })
})
