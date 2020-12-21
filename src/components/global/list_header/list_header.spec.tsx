import React from 'react'
import { ListHeader } from './list_header'
import { render, RenderResult } from '../../../../tests/test_utils'

describe('ListHeader', () => {
  it('should render the ListHeader with title string', () => {
    const title: string = 'List header title'
    const renderResult: RenderResult = render(<ListHeader title={title}/>)
    const titleElement: Element | null = renderResult.queryByText(title)

    expect(titleElement).not.toBeNull()
  })
})
