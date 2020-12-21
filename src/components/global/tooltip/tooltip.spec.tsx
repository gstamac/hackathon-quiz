import React from 'react'
import { TooltipProps } from './interfaces'
import { Tooltip } from './tooltip'
import { render, RenderResult } from '../../../../tests/test_utils'

describe('Tooltip', () => {
  const properties: Omit<TooltipProps, 'children'> = {
    heading: 'heading',
    description: 'description',
    enabled: true,
    open: true,
  }

  it('should render the Tooltip with children, heading and description when enabled is true', () => {
    const renderResult: RenderResult = render(
      <Tooltip {...properties}>
        <div>child</div>
      </Tooltip>
    )

    const childElement: HTMLElement | null = renderResult.queryByText('child')
    const headingElement: HTMLElement | null = renderResult.queryByText('heading')
    const descriptionElement: HTMLElement | null = renderResult.queryByText('description')

    expect(childElement).not.toBeNull()
    expect(headingElement).not.toBeNull()
    expect(descriptionElement).not.toBeNull()
  })

  it('should not render the Tooltip but only the children when enabled is false', () => {
    const renderResult: RenderResult = render(
      <Tooltip {...properties} enabled={false}>
        <div>child</div>
      </Tooltip>
    )

    const childElement: HTMLElement | null = renderResult.queryByText('child')
    const headingElement: HTMLElement | null = renderResult.queryByText('heading')
    const descriptionElement: HTMLElement | null = renderResult.queryByText('description')

    expect(childElement).not.toBeNull()
    expect(headingElement).toBeNull()
    expect(descriptionElement).toBeNull()
  })
})
