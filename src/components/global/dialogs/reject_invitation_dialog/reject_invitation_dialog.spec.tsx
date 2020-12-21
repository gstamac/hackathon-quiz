import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { RejectInvitationDialog } from '.'
import { act } from 'react-dom/test-utils'
import { getString } from '../../../../utils'
import { render, userEvent } from '../../../../../tests/test_utils'
import { RejectInvitationDialogProps } from './interfaces'

describe('Reject Invitation Dialog', () => {
  let renderResult: RenderResult
  const onExitMock: jest.Mock = jest.fn()
  const handleRejectInvitationMock: jest.Mock = jest.fn().mockResolvedValue({})

  const dialogProps: RejectInvitationDialogProps = {
    onExit: onExitMock,
    handleRejectInvitation: async () => handleRejectInvitationMock(),
    open: true,
  }

  beforeEach(() => {
    act(() => {
      renderResult = render(<RejectInvitationDialog {...dialogProps}/>)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render reject invitation dialog properly', () => {
    const dialogHeader: Element = renderResult.getByText(getString('reject-invitation-dialog-header'))
    const dialogTitle: Element = renderResult.getByText(getString('reject-invitation-dialog-title'))
    const dialogDescription: Element = renderResult.getByText(getString('reject-invitation-dialog-description'))
    const confirmButton: Element = renderResult.getByText(getString('reject-invitation-dialog-accept'))
    const cancelButton: Element = renderResult.getByText(getString('reject-invitation-dialog-decline'))

    expect(dialogHeader).toBeDefined()
    expect(dialogTitle).toBeDefined()
    expect(dialogDescription).toBeDefined()
    expect(confirmButton).toBeDefined()
    expect(cancelButton).toBeDefined()
  })

  it('should call onExit when closed', () => {
    const closeButton: Element = renderResult.getByAltText('close')

    act(() => {
      userEvent.click(closeButton)
    })

    expect(onExitMock).toHaveBeenCalledTimes(1)

    const cancelButton: Element = renderResult.getByText(getString('reject-invitation-dialog-decline'))

    act(() => {
      userEvent.click(cancelButton)
    })

    expect(onExitMock).toHaveBeenCalledTimes(2)
  })

  it('should call handleRejectInvitation when user confirms the rejection of the invitation', async () => {
    const confirmButton: Element = renderResult.getByText(getString('reject-invitation-dialog-accept'))

    expect(confirmButton).toBeDefined()

    await act(async () => {
      userEvent.click(confirmButton)
    })

    expect(handleRejectInvitationMock).toHaveBeenCalled()
  })
})
