import React, { PropsWithChildren } from 'react'

import { MessageInputHooksProps, MessageInputHooksResponse } from './interfaces'
import * as messagingApi from '../../../../services/api/messaging_api'
import { renderHook, RenderHookResult, act } from '@testing-library/react-hooks'
import { useMessageInput } from './use_message_input'
import { MuiThemeProvider } from '@material-ui/core'
import { mainTheme } from '../../../../assets/themes'
import { store } from '../../../../store'
import { Provider } from 'react-redux'
import { setChannels } from '../../../../store/channels_slice/channels_slice'
import { channelWithParticipantsTypeGroup, channelWithBotParticipantMock, channelWithHiddenMembers } from '../../../../../tests/mocks/channels_mock'
import { getString } from '../../../../utils'

jest.mock('../../../../services/api/messaging_api')

describe('useMessageInput', () => {
  let renderResult: RenderHookResult<MessageInputHooksProps, MessageInputHooksResponse>
  const onSendMock: jest.Mock = jest.fn()
  const sendTypingNotificationMock: jest.Mock = jest.fn()

  const inputMessageHookProps: MessageInputHooksProps = {
    onSend: onSendMock,
    disabled: false,
    channel_id: '34981',
    gid_uuid: 'gid_uuid',
  }

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  beforeAll(async () => {
    (messagingApi.sendTypingNotification as jest.Mock) = sendTypingNotificationMock.mockResolvedValue({})

    await act(async () => {
      store.dispatch(setChannels([channelWithParticipantsTypeGroup, channelWithBotParticipantMock, channelWithHiddenMembers]))
    })
  })

  const renderInputHook = async (props: MessageInputHooksProps): Promise<void> => {
    await act(async () => {
      renderResult = renderHook(useMessageInput, {
        initialProps: props,
        wrapper: ({ children }: PropsWithChildren<{}>) => (
          <MuiThemeProvider theme={mainTheme}>
            <Provider store={store}>
              {children}
            </Provider>
          </MuiThemeProvider>
        ),
      })
    })
  }

  it('should return an empty string when input is initialized', async () => {
    await renderInputHook(inputMessageHookProps)

    expect(renderResult.result.current.message).toBe('')
  })

  it('should reset input value when swithing to a new channel', async () => {
    await renderInputHook(inputMessageHookProps)

    const firstValue = {target: { value: 'test'}}

    await act(async () => {
      renderResult.result.current.onChange(Object.assign(firstValue))
    })

    expect(renderResult.result.current.message).toBe(firstValue.target.value)

    const newProps: MessageInputHooksProps = {
      onSend: onSendMock,
      disabled: false,
      channel_id: '1',
      gid_uuid: 'gid_uuid',
    }

    renderResult.rerender(newProps)

    expect(renderResult.result.current.message).toBe('')
  })

  it('should store input state of a specific channel when switching', async () => {
    await renderInputHook(inputMessageHookProps)

    const firstValue = {target: { value: 'test'}}
    const secondValue = {target: { value: 'test2'}}

    await act(async () => {
      renderResult.result.current.onChange(Object.assign(firstValue))
    })

    expect(renderResult.result.current.message).toBe(firstValue.target.value)

    const newProps: MessageInputHooksProps = {
      onSend: onSendMock,
      disabled: false,
      channel_id: '1',
      gid_uuid: 'gid_uuid',
    }

    renderResult.rerender(newProps)

    await act(async () => {
      renderResult.result.current.onChange(Object.assign(secondValue))
    })

    expect(renderResult.result.current.message).toBe(secondValue.target.value)

    renderResult.rerender({
      ...newProps,
      channel_id: '34981',
    })

    expect(renderResult.result.current.message).toBe(firstValue.target.value)
  })

  it('should send typing notification onChange', async () => {
    await renderInputHook(inputMessageHookProps)

    const value = {target: { value: 'test'}}

    await act(async () => {
      renderResult.result.current.onChange(Object.assign(value))
    })

    expect(sendTypingNotificationMock).toHaveBeenCalledWith('34981')
  })

  it('should disable the composer and return the correct text for read-only channel', async () => {
    await renderInputHook({ ...inputMessageHookProps, channel_id: '34982', disabled: true })

    expect(renderResult.result.current.disabled).toEqual(true)
    expect(renderResult.result.current.textPlaceholder).toEqual(getString('disabled-message-input'))
  })
})
