import React from 'react'
import { render, RenderResult, userEvent, act } from '../../../../tests/test_utils'
import { InitVideoCall } from './init_video_call'
import * as hook from './use_init_video_call'
import { mocked } from 'ts-jest/utils'
import { MaybeMocked } from 'ts-jest/dist/util/testing'

jest.mock('./use_init_video_call')

describe('InitVideoCall', () => {
  const useInitVideoCallMock: MaybeMocked<typeof hook.useInitVideoCall> = mocked(hook.useInitVideoCall, true)

  const renderComponent = (): RenderResult => render(<InitVideoCall channelId={'channel_id'}/>)

  it('should render component', () => {
    useInitVideoCallMock.mockReturnValue({
      initiateVideoCallCallback: jest.fn(),
      isInitializingVideoCall: false,
    })
    const renderResult: RenderResult = renderComponent()

    expect(renderResult.container).toMatchSnapshot()
  })

  it('should call initiateVideoCallCallback on video icon click', () => {
    const initCallbackMock: jest.Mock = jest.fn()

    useInitVideoCallMock.mockReturnValue({
      initiateVideoCallCallback: initCallbackMock,
      isInitializingVideoCall: false,
    })
    const renderResult: RenderResult = renderComponent()

    const icon: Element = renderResult.getByTestId('video-call-button')

    act(() => {
      userEvent.click(icon)
    })

    expect(initCallbackMock).toHaveBeenCalled()
  })
})
