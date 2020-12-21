import React from 'react'
import { ActionCard, ActionCardProps } from '.'
import { act, cleanup, render, userEvent, RenderResult } from '../../../../tests/test_utils'

describe('ActionCard', () => {
  let renderResult: RenderResult
  const onActionCallback: jest.Mock = jest.fn()

  const properties: ActionCardProps = {
    action: 'Click here',
    title: 'Action card',
    subtitle: 'Additional information',
    image: <img data-testid='test-avatar' />,
  }

  const renderComponent = (actionCardProperties: ActionCardProps): void => {
    renderResult = render(<ActionCard { ...actionCardProperties }/>)
  }

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render action card with details', () => {
    renderComponent(properties)

    const actionElement: Element = renderResult.getByText('Click here')
    const imageElement: Element = renderResult.getByTestId('test-avatar')
    const subtitleElement: Element = renderResult.getByText('Action card')
    const titleElement: Element = renderResult.getByText('Action card')

    expect(actionElement).toBeDefined()
    expect(imageElement).toBeDefined()
    expect(subtitleElement).toBeDefined()
    expect(titleElement).toBeDefined()
  })

  it('should trigger callback upon action', () => {
    renderComponent({ ...properties, onAction: onActionCallback })

    const actionElement: Element = renderResult.getByText('Click here')

    expect(onActionCallback).not.toHaveBeenCalled()

    act(() => {
      userEvent.click(actionElement)
    })

    expect(onActionCallback).toHaveBeenCalled()
  })

  it('should render action card without action link', () => {
    renderComponent({ ...properties, action: undefined })

    const imageElement: Element = renderResult.getByTestId('test-avatar')
    const subtitleElement: Element = renderResult.getByText('Action card')
    const titleElement: Element = renderResult.getByText('Action card')
    const actionElement: Element | null = renderResult.queryByText('Click here')

    expect(imageElement).toBeDefined()
    expect(subtitleElement).toBeDefined()
    expect(titleElement).toBeDefined()
    expect(actionElement).toBeNull()
  })

  it('should render action card with disabled action link', () => {
    renderComponent({ ...properties, action: 'disabled link', onAction: onActionCallback, actionDisabled: true })

    const actionElement: Element = renderResult.getByText('disabled link')

    expect(actionElement).toBeDefined()

    act(() => {
      userEvent.click(actionElement)
    })

    expect(onActionCallback).not.toHaveBeenCalled()
  })
})
