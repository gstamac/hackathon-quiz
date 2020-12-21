import React from 'react'
import { MessagesMobile } from './messages_mobile'
import { RenderResult, act, render } from '../../../tests/test_utils'

describe('Messages mobile and tablet landing page', () => {
  let renderResult: RenderResult

  it('Should render Messages component', async () => {
    await act(async () => {
      renderResult = render(<MessagesMobile />)
    })

    const backgroundImage: Element | null = renderResult.getByAltText('Messages background icon')
    const messagesText: Element | null = renderResult.getByText('Continue on our mobile app')

    expect(backgroundImage).not.toBeNull()
    expect(messagesText).not.toBeNull()
  })
})
