import React from 'react'
import { RenderResult, render, act, cleanup } from '../../../../tests/test_utils'
import { channelWithMoreParticipantsMock } from '../../../../tests/mocks/channels_mock'
import * as api from '../../../services/api/avatar_api'
import * as generalUtils from '../../../utils/general_utils'
import { avatarMock } from '../../../../tests/mocks/avatar_mocks'
import { GeneralAvatar } from './general_avatar'
import { GeneralAvatarProps } from './interfaces'
import { CancelToken, CancelTokenSource } from 'axios'

jest.mock('../../../services/api/avatar_api')
jest.mock('../../../utils/general_utils')

describe('GeneralAvatar', () => {
  let renderResult: RenderResult
  const getAvatarMock: jest.Mock = jest.fn()
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
      renderResult = render(<GeneralAvatar {...props}/>)
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
