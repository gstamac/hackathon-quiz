import React from 'react'
import userEvent from '@testing-library/user-event'
import { CopyToClipboard } from '.'
import { render, RenderResult } from '../../../../tests/test_utils'

describe('Copy to Clipboard', () => {
  const copyToClipboardMock: jest.Mock = jest.fn()

  let renderResult: RenderResult

  beforeEach(() => {
    renderResult = render(<CopyToClipboard text='text' onClick={copyToClipboardMock} />)
  })

  it('should render properly', () => {
    const copyToClipboardText: HTMLElement = renderResult.getByTestId('copy_to_clipboard_text')
    const copyButton: HTMLElement = renderResult.getByTestId('copy-button')

    expect(copyToClipboardText).toBeDefined()
    expect(copyButton).toBeDefined()
  })

  it('should call the function when the copy button is clicked', () => {
    const copyToClipboardButton: Element = renderResult.getByTestId('copy-button')

    userEvent.click(copyToClipboardButton)
    expect(copyToClipboardMock).toHaveBeenCalledTimes(1)
  })
})
