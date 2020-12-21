import { RenderHookResult, act, renderHook, cleanup } from '@testing-library/react-hooks'
import { useChannelUpdate } from './use_channel_update'
import { UpdateChannelHook, UpdateChannelHookProps } from './interfaces'
import * as api from '../../../services/api/channels_api'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from '../../../store'
import { InternalFormData } from 'globalid-react-ui'

jest.mock('../../../services/api/channels_api')

const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => <Provider store={store}>{children}</Provider>

describe('useChannelUpdateHook', () => {
  let renderHookResult: RenderHookResult<UpdateChannelHookProps, UpdateChannelHook>
  const updateChannelMock = jest.fn()

  beforeEach(async () => {
    (api.updateChannel as jest.Mock) = updateChannelMock.mockResolvedValue('avatar')

    await act(async () => {
      renderHookResult = renderHook(() => useChannelUpdate({ channelId: 'channelId' }), { wrapper })
    })
  })

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  it('should change state after calling openChannelEditDialog function', async () => {
    await act(async () => {
      renderHookResult.result.current.openChannelEditDialog()
    })
    expect(renderHookResult.result.current.editChannelOpen).toEqual(true)
  })

  it('should change state after calling closeChannelEditDialog function', async () => {
    await act(async () => {
      renderHookResult.result.current.closeChannelEditDialog()
    })
    expect(renderHookResult.result.current.editChannelOpen).toEqual(false)
  })

  it('should call updateChannel api function', async () => {
    const mockFormData: InternalFormData = {
      fieldDefinition: {},
      values: {
        title: {
          value: 'test',
          failed_validators: [],
          has_changed: true,
          messages: [],
        },
        description: {
          value: 'test',
          failed_validators: [],
          has_changed: true,
          messages: [],
        },
      },
    }

    await act(async () => {
      await renderHookResult.result.current.onChannelUpdate(mockFormData)
    })
    expect(updateChannelMock).toHaveBeenCalledWith('channelId', {
      title: 'test',
      description: 'test',
    })
  })
})
