import React from 'react'
import { RenderResult, render, act, cleanup } from '../../../../tests/test_utils'
import { ChannelAvatar } from './channel_avatar'
import { channelWithMoreParticipantsMock } from '../../../../tests/mocks/channels_mock'
import * as api from '../../../services/api/avatar_api'
import * as generalUtils from '../../../utils/general_utils'
import { avatarMock } from '../../../../tests/mocks/avatar_mocks'
import { CancelToken, CancelTokenSource } from 'axios'
import { GeneralAvatarProps } from '../../global/general_avatar'

jest.mock('../../../services/api/avatar_api')
jest.mock('../../../utils/general_utils')

describe('ChannelAvatar', () => {
  let renderResult: RenderResult
  const getAvatarMock = jest.fn()
  const getCancelTokenSourceMock: jest.Mock = jest.fn()

  const cancelTokenMock: CancelToken = {
    throwIfRequested: jest.fn(),
    promise: new Promise(jest.fn()),
  }

  const tokenSourceMock: CancelTokenSource = {
    token: cancelTokenMock,
    cancel: jest.fn(),
  }

  beforeEach(() => {
    (api.getAvatar as jest.Mock) = getAvatarMock.mockResolvedValue(avatarMock);
    (generalUtils.getCancelTokenSource as jest.Mock) = getCancelTokenSourceMock.mockReturnValue(tokenSourceMock);
    (generalUtils.executeCancellabeAxiosCallback as jest.Mock).mockImplementation(async (callback: () => Promise<void>) => callback())
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  const renderComponent = async (props: GeneralAvatarProps): Promise<void> => {
    await act(async () => {
      renderResult = render(<ChannelAvatar {...props}/>)
    })
  }

  it('should render the ChannelAvatar component when channel item has image field', async () => {
    await renderComponent({ ...channelWithMoreParticipantsMock, image_url: avatarMock })

    expect(getAvatarMock).not.toHaveBeenCalled()
    expect(renderResult.container).not.toBeUndefined()
  })

  it('should render the ChannelAvatar component when image field is empty', async () => {
    await renderComponent({ ...channelWithMoreParticipantsMock, image_url: undefined })

    expect(getAvatarMock).toHaveBeenCalledWith(channelWithMoreParticipantsMock.uuid, cancelTokenMock)
    expect(renderResult.container).not.toBeUndefined()
  })
})
