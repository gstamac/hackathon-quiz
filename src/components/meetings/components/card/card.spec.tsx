import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { render } from '../../../../../tests/test_utils'
import { Card } from '.'
import { CardProps } from './interfaces'

describe('Meeting Card tests', () => {
  let renderResult: RenderResult

  const cardProps: CardProps = {
    title: 'card_title',
    description: 'card_description',
  }

  const renderComponent = (props: CardProps = cardProps): void => {
    act(() => {
      renderResult = render(
        <Card { ...props }/>
      )
    })
  }

  afterEach(() => {
    cleanup()
  })

  it('should render card component with provided title and description', async () => {
    renderComponent()

    const title: Element = renderResult.getByText(cardProps.title)
    const description: Element = renderResult.getByText(cardProps.description as string)

    expect(title).toBeDefined()
    expect(description).toBeDefined()
  })

  it('should render card component when description is passed as a jsx element', async () => {
    renderComponent({ ...cardProps, description: <div>jsx element</div>})

    const title: Element = renderResult.getByText(cardProps.title)
    const description: Element = renderResult.getByText('jsx element')

    expect(title).toBeDefined()
    expect(description).toBeDefined()
  })

  it('should render card component with a header when it is provided', async () => {
    renderComponent({ ...cardProps, header: 'card_header'})

    const header: Element = renderResult.getByText('card_header')

    expect(header).toBeDefined()
  })

  it('should render card component with a smallText when it is provided', async () => {
    renderComponent({ ...cardProps, smallText: 'small_text'})

    const smallText: Element = renderResult.getByText('small_text')

    expect(smallText).toBeDefined()
  })
})
