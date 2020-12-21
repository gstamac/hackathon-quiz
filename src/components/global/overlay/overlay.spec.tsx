import React from 'react'
import { render, RenderResult } from '../../../../tests/test_utils'
import { Overlay } from './overlay'

describe('Overlay', () => {
  it('should render overlay with text and loading spinner', () => {
    const testText: string = 'test render'
    const renderResult: RenderResult = render(<Overlay isOpen text={testText}/>)
    const spinner: Element | null = renderResult.queryByTestId('globalid-loader')
    const text: Element | null = renderResult.queryByText(testText)

    expect(spinner).not.toBeNull()
    expect(text).not.toBeNull()
  })
})
