import { TypingMessageCard } from './typing_message_card'
import { render, RenderResult, act } from '../../../../../tests/test_utils'
import React from 'react'

describe('TypingMessageCard', () => {
  let renderResult: RenderResult

  beforeAll(() => {
    act(() => {
      renderResult = render(<TypingMessageCard avatar={'user_avatar'}/>)
    })
  })

  it('should render typing animation card', () => {
    const avatar: Element = renderResult.getByAltText('user avatar')
    const typingAnimation: Element = renderResult.getByTestId('typing-animation')

    expect(avatar).toBeDefined()
    expect(typingAnimation).toBeDefined()
  })
})
