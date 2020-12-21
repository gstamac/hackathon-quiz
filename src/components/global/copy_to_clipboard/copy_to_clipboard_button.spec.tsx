import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import { CopyToClipboardButton } from './copy_to_clipboard_button'
import { act, cleanup, render, RenderResult } from '../../../../tests/test_utils'
import { CopyToClipboardButtonProps } from './interfaces'

describe('CopyToClipboardButton', () => {
  const onClickMock: jest.Mock = jest.fn()

  let renderResult: RenderResult

  const props: CopyToClipboardButtonProps = {
    text: 'text',
    onClick: onClickMock,
    className: '',
  }

  const renderComponent = (): void => {
    renderResult = render(<CopyToClipboardButton { ...props }/>)
  }

  afterEach(cleanup)

  it('should render CopyToClipboardButton properly', () => {
    renderComponent()

    const copyButton: Element = renderResult.getByTestId('copy-button')

    expect(copyButton).toBeDefined()
  })

  it('should call the onClick function when the copy button is clicked', () => {
    renderComponent()

    const button: Element = renderResult.getByTestId('copy-button')

    act(() => {
      userEvent.click(button)
    })

    expect(onClickMock).toHaveBeenCalledTimes(1)
  })

  it('should render CopyToClipboardButton with a child component', () => {
    renderResult = render(
      <CopyToClipboardButton { ...props }>
        <div data-testid='ButtonChild'></div>
      </CopyToClipboardButton>
    )

    const buttonChild: Element = renderResult.getByTestId('ButtonChild')

    expect(buttonChild).toBeDefined()
  })
})
