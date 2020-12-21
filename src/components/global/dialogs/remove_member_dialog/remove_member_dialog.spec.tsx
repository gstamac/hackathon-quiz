import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { RemoveMemberDialog } from '.'
import { act } from 'react-dom/test-utils'
import { getString } from '../../../../utils'
import { render, userEvent } from '../../../../../tests/test_utils'
import { RemoveMemberDialogProps } from './interfaces'

describe('Remove Member Dialog', () => {
  let renderResult: RenderResult
  const onExitMock: jest.Mock = jest.fn()
  const handleRemoveMemberMock: jest.Mock = jest.fn().mockResolvedValue({})

  const dialogProps: RemoveMemberDialogProps = {
    gidName: 'test_gid',
    onExit: onExitMock,
    handleRemoveMember: async () => handleRemoveMemberMock(),
    open: true,
  }

  beforeEach(() => {
    act(() => {
      renderResult = render(<RemoveMemberDialog {...dialogProps}/>)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render remove member dialog properly', () => {
    const dialogHeader: Element = renderResult.getByText(getString('remove-member-dialog-header-title'))
    const dialogTitle: Element = renderResult.getByText(getString('remove-member-dialog-title').replace('{user}', dialogProps.gidName))
    const dialogDescription: Element = renderResult.getByText(getString('remove-member-dialog-description'))
    const confirmButton: Element = renderResult.getByText(getString('remove-member-dialog-confirm-action'))
    const cancelButton: Element = renderResult.getByText(getString('remove-member-dialog-cancel-action'))

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

    const cancelButton: Element = renderResult.getByText(getString('remove-member-dialog-cancel-action'))

    act(() => {
      userEvent.click(cancelButton)
    })

    expect(onExitMock).toHaveBeenCalledTimes(2)
  })

  it('should call handleRemoveMember when user confirms the removal of a member', async () => {
    const confirmButton: Element = renderResult.getByText(getString('remove-member-dialog-confirm-action'))

    expect(confirmButton).toBeDefined()

    await act(async () => {
      userEvent.click(confirmButton)
    })

    expect(handleRemoveMemberMock).toHaveBeenCalled()
  })
})
