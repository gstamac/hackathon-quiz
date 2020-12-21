import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { DeleteMessageDialog } from '.'
import { act } from 'react-dom/test-utils'
import { getString } from '../../../../utils'
import { render, userEvent } from '../../../../../tests/test_utils'
import { DeleteMessageDialogProps } from './interfaces'

describe('Delete Message Dialog', () => {
  let renderResult: RenderResult
  const onExit = jest.fn()
  const handleDelete = jest.fn()

  const dialogProps: DeleteMessageDialogProps = {
    title: 'group conversation',
    onExit: onExit,
    handleDelete: handleDelete,
    open: true,
  }

  beforeEach(() => {
    act(() => {
      renderResult = render(<DeleteMessageDialog {...dialogProps}/>)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render delete message dialog', () => {
    const name: Element | null = renderResult.getByText(getString('delete-message-title'))
    const description: Element | null = renderResult.getByText(getString('delete-message-description'))
    const button: Element | null = renderResult.getByText(getString('delete-message-action'))

    expect(name).not.toBeNull()
    expect(description).not.toBeNull()
    expect(button).not.toBeNull()
  })

  it('should call onExit when closed', () => {
    const close_icon: Element = renderResult.getByAltText('close')

    act(() => {
      userEvent.click(close_icon)
    })

    expect(onExit).toHaveBeenCalled()
  })

  it('should call handleDelete when user clicks a delete button', () => {
    const button: Element = renderResult.getByText(getString('delete-message-action'))

    act(() => {
      userEvent.click(button)
    })

    expect(handleDelete).toHaveBeenCalled()
  })
})
