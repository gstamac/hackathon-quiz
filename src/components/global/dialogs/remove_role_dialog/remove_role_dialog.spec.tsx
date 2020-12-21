import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { RemoveRoleDialog } from './remove_role_dialog'
import { act } from 'react-dom/test-utils'
import { getString } from '../../../../utils'
import { render, userEvent } from '../../../../../tests/test_utils'
import { RemoveRoleDialogProps } from './interfaces'

describe('Remove role Dialog', () => {
  let renderResult: RenderResult
  const onExitMock: jest.Mock = jest.fn()
  const handleRemoveRoleMock: jest.Mock = jest.fn().mockResolvedValue({})

  const dialogProps: RemoveRoleDialogProps = {
    onExit: onExitMock,
    onFormSubmit: async () => handleRemoveRoleMock(),
    open: true,
  }

  beforeEach(() => {
    act(() => {
      renderResult = render(<RemoveRoleDialog {...dialogProps}/>)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render remove role dialog', () => {
    const dialogHeader: Element = renderResult.getByText(getString('remove-role-dialog-title'))
    const dialogDescription: Element = renderResult.getByText(getString('remove-role-dialog-description'))
    const confirmButton: Element = renderResult.getByText(getString('remove-role-dialog-confirm-action'))
    const cancelButton: Element = renderResult.getByText(getString('remove-role-dialog-cancel-action'))

    expect(dialogHeader).toBeDefined()
    expect(dialogDescription).toBeDefined()
    expect(confirmButton).toBeDefined()
    expect(cancelButton).toBeDefined()
  })

  it('should call onExit when closed', () => {
    const closeIcon: Element = renderResult.getByAltText('close')

    act(() => {
      userEvent.click(closeIcon)
    })

    expect(onExitMock).toHaveBeenCalled()
  })

  it('should call onExit when cancel clicked', () => {
    const cancelButton: Element = renderResult.getByText(getString('remove-role-dialog-cancel-action'))

    act(() => {
      userEvent.click(cancelButton)
    })

    expect(onExitMock).toHaveBeenCalled()
  })

  it('should call handleRemoveRole when user clicks a remove role button', async () => {
    const button: Element = renderResult.getByText(getString('remove-role-dialog-confirm-action'))

    await act(async () => {
      userEvent.click(button)
    })

    expect(handleRemoveRoleMock).toHaveBeenCalledTimes(1)
  })
})
