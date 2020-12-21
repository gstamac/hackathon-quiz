import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { SystemMessageCard } from './system_message_card'
import { render, act } from '../../../../../tests/test_utils'

describe('System message card', () => {
  let renderResult: RenderResult

  const defaultTestMessage: string = 'this is a system message'

  const renderSystemMessage = (): void => {
    act(() => {
      renderResult = render(<SystemMessageCard text={defaultTestMessage}/>)
    })
  }

  beforeEach(() => {
    renderSystemMessage()
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render system message card with simple text', () => {
    const text: Element | null = renderResult.getByText(defaultTestMessage)

    expect(text).not.toBeNull()
  })
})
