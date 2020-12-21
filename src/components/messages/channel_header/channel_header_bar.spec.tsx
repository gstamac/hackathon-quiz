import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { render, userEvent, act } from '../../../../tests/test_utils'
import { ChannelHeaderBarProps } from './interfaces'
import { ChannelHeaderBar } from './channel_header_bar'

describe('Channel Header Bar', () => {
  let renderResult: RenderResult
  const onOptionsMock: jest.Mock = jest.fn()

  const componentProps: ChannelHeaderBarProps = {
    channelAvatar: (<div data-testid='avatar'></div>),
    isGroup: true,
    onOptionsClick: onOptionsMock,
    settings: (<></>),
    settingsRef: React.createRef<HTMLDivElement>(),
    subtitle: 'subtitle',
    title: 'title',
    channelId: 'channel_id',
    readOnly: false,
  }

  const getRenderResult = async (props: ChannelHeaderBarProps): Promise<void> => {
    await act(async () => {
      renderResult = render(<ChannelHeaderBar {...props}/>)
    })
  }

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render the channel header bar component properly with avatar', async () => {
    await getRenderResult(componentProps)

    const avatar: Element = renderResult.getByTestId('avatar')
    const title: Element = renderResult.getByText('title')
    const subtitle: Element | null = renderResult.queryByAltText('subtitle')
    const optionButton: Element = renderResult.getByTestId('channel-options-button')
    const videoCallButton: Element | null = renderResult.queryByTestId('video-call-button')

    expect(avatar).toBeDefined()
    expect(title).toBeDefined()
    expect(subtitle).toBeDefined()
    expect(optionButton).toBeDefined()
    expect(videoCallButton).toBeNull()
  })

  it('should render the channel header bar component without avatar', async () => {
    await getRenderResult({ ...componentProps, isGroup: false })

    const avatar: Element | null = renderResult.queryByTestId('avatar')

    expect(avatar).toBeNull()
  })

  it('should render the channel header bar component with video call button when showVideoCall is true', async () => {
    await getRenderResult({ ...componentProps, showVideoCall: true })

    const videoCallButton: Element | null = renderResult.queryByTestId('video-call-button')

    expect(videoCallButton).not.toBeNull()
  })

  it('should render the channel header bar component without video call button when showVideoCall is false', async () => {
    await getRenderResult({ ...componentProps, showVideoCall: false })

    const videoCallButton: Element | null = renderResult.queryByTestId('video-call-button')

    expect(videoCallButton).toBeNull()
  })

  it('should call onOptionsClick function when user clicks on optionButton', async () => {
    await getRenderResult(componentProps)

    const optionButton: Element = renderResult.getByTestId('channel-options-button')

    act(() => {
      userEvent.click(optionButton)
    })

    expect(onOptionsMock).toHaveBeenCalled()
  })
})
