import React from 'react'
import { LeaveGroupDialog } from './leave_group_dialog'
import { LeaveGroupDialogProps } from './interfaces'
import { getString } from '../../../../utils'
import { act, cleanup, render, userEvent, RenderResult } from '../../../../../tests/test_utils'

describe('LeaveGroupDialog', () => {
  let renderResult: RenderResult

  const onExitMock: jest.Mock = jest.fn()
  const onFormSubmitMock: jest.Mock = jest.fn().mockResolvedValue('')
  const leaveGroupDialogProperties: LeaveGroupDialogProps = {
    onExit: onExitMock,
    onFormSubmit: onFormSubmitMock,
    open: true,
  }

  const renderLeaveGroupDialog = async (): Promise<void> => {
    await act(async () => {
      renderResult = render(
        <LeaveGroupDialog {...leaveGroupDialogProperties } />
      )
    })
  }

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  it('should render leave group dialog', async () => {
    await renderLeaveGroupDialog()

    const dialogTitle: Element = renderResult.getByText(getString('leave-group-dialog-title'))
    const dialogDescription: Element = renderResult.getByText(getString('leave-group-dialog-description'))
    const leaveGroupButton: Element = renderResult.getByText(getString('leave-group-dialog-confirm-action'))
    const cancelButton: Element = renderResult.getByText(getString('button-text-cancel'))

    expect(dialogTitle).toBeDefined()
    expect(dialogDescription).toBeDefined()
    expect(leaveGroupButton).toBeDefined()
    expect(cancelButton).toBeDefined()
  })

  it('should call onFormSubmit when clicking leave group button', async () => {
    await renderLeaveGroupDialog()

    const leaveGroupButton: Element = renderResult.getByText(getString('leave-group-dialog-confirm-action'))

    act(() => {
      userEvent.click(leaveGroupButton)
    })

    expect(onFormSubmitMock).toHaveBeenCalledTimes(1)
  })

  it('should call onExit when clicking cancel button', async () => {
    await renderLeaveGroupDialog()

    const cancelButton: Element = renderResult.getByText(getString('button-text-cancel'))

    act(() => {
      userEvent.click(cancelButton)
    })

    expect(onExitMock).toHaveBeenCalledTimes(1)
  })

  it('should call onExit when clicking close button', async () => {
    await renderLeaveGroupDialog()

    const closeButton: Element = renderResult.getByAltText('close')

    expect(closeButton).not.toBeNull()

    act(() => {
      userEvent.click(closeButton)
    })

    expect(onExitMock).toHaveBeenCalledTimes(1)
  })
})
