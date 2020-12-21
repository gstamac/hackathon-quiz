import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { render, act } from '../../../../../tests/test_utils'
import { ChatBeginningCard } from '.'
import { ChatBeginningCardProps } from './interfaces'
import { getString } from '../../../../utils'

describe('Beginning Chat card', () => {
  let renderResult: RenderResult

  const renderComponent = (props: ChatBeginningCardProps): void => {
    act(() => {
      renderResult = render(<ChatBeginningCard {...props}/>)
    })
  }

  afterEach(() => {
    cleanup()
  })

  it('should render beginning chat card when encryption is disabled', () => {
    const props: ChatBeginningCardProps = {
      isEncrypted: false,
      text: 'beginning_text',
    }

    renderComponent(props)

    const text: Element = renderResult.getByText('beginning_text')

    expect(text).toBeDefined()

    const cardComponent: Element = renderResult.getByTestId('chat-beginning-card')

    expect(cardComponent.children).toHaveLength(1)
  })

  it('should render beginning chat card when encryption is enabled', () => {
    const props: ChatBeginningCardProps = {
      isEncrypted: true,
      text: 'beginning_text',
    }

    renderComponent(props)

    const ecryptionText: Element = renderResult.getByText(getString('encryption-chat-message'))

    expect(ecryptionText).toBeDefined()

    const cardComponent: Element = renderResult.getByTestId('chat-beginning-card')

    expect(cardComponent.children).toHaveLength(3)
  })
})
