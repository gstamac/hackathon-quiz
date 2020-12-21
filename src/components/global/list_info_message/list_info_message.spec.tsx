import React from 'react'
import { ListInfoMessage } from './list_info_message'
import { render, RenderResult } from '../../../../tests/test_utils'

describe('ListInfoMessage', () => {
  it('should render ListInfoMessage component', () => {
    const message: string = 'List info message'
    const renderResult: RenderResult = render(<ListInfoMessage message={message}/>)
    const messageElement: Element | null = renderResult.queryByText(message)

    expect(messageElement).not.toBeNull()
  })
})
