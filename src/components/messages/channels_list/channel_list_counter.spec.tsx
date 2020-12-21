import React from 'react'
import { render, RenderResult } from '../../../../tests/test_utils'
import { ChannelListCounter } from './channel_list_counter'

describe('ChannelListCounter tests', () => {
  it('should render counter', () => {
    const renderResult: RenderResult = render(<ChannelListCounter unreadMessagesCount={'7'} />)

    const counter: Element | null = renderResult.queryByText('7')

    expect(counter).not.toBeNull()
  })
})
