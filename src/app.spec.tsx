import React from 'react'

import { App } from './app'
import {
  render,
  RenderResult,
} from '../tests/test_utils'

jest.mock('./components/messages/helpers')
jest.mock('./hooks/use_init_pubnub_events')

describe('app', () => {
  it('renders container', () => {
    const renderResult: RenderResult = render(<App />)

    expect(renderResult.container).not.toBeNull()
  })
})
