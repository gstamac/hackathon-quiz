import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { LeaveChannelDialog } from './leave_channel_dialog'
import { act } from 'react-dom/test-utils'
import { getString } from '../../../../utils'
import { render, userEvent } from '../../../../../tests/test_utils'
import { LeaveChannelDialogProps } from './interfaces'

describe('Delete Message Dialog', () => {
  let renderResult: RenderResult
  const onExit = jest.fn()
  const handleLeaveChannel = jest.fn()

  const dialogProps: LeaveChannelDialogProps = {
    title: 'chat',
    onExit: onExit,
    handleLeaveChannel: handleLeaveChannel,
    open: true,
    inProgress: false,
  }

  beforeEach(() => {
    act(() => {
      renderResult = render(<LeaveChannelDialog {...dialogProps}/>)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render leave channel dialog', () => {
    const name: Element | null = renderResult.getByText(getString('leave-channel-title'))
    const description: Element | null = renderResult.getByText(getString('leave-channel-description'))
    const button: Element | null = renderResult.getByText(getString('leave-channel-action'))
    const progressBar: Element | null = renderResult.queryByRole('progressbar')

    expect(name).not.toBeNull()
    expect(description).not.toBeNull()
    expect(button).not.toBeNull()
    expect(progressBar).toBeNull()
  })

  it('should call onExit when closed', () => {
    const close_icon: Element = renderResult.getByAltText('close')

    act(() => {
      userEvent.click(close_icon)
    })

    expect(onExit).toHaveBeenCalled()
  })

  it('should call handleLeaveChannel when user clicks a leave conversation button', () => {
    const button: Element = renderResult.getByText(getString('leave-channel-action'))

    act(() => {
      userEvent.click(button)
    })

    expect(handleLeaveChannel).toHaveBeenCalled()
  })

  it('should show loading on the button when dialog is inProgress', () => {
    renderResult = render(<LeaveChannelDialog {...dialogProps} inProgress={true} />)

    const progressBar: Element | null = renderResult.queryByRole('progressbar')

    expect(progressBar).not.toBeNull()
  })
})
