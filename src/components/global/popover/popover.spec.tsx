import React from 'react'
import { Popover } from './popover'
import { render, RenderResult } from '../../../../tests/test_utils'

describe('Popover', () => {
  it('should render the Popover with children', () => {
    const cursorAtRef: React.RefObject<Element> = React.createRef<Element>()

    const renderResult: RenderResult = render(
      <Popover cursorAt={cursorAtRef} open>
        <div data-testid='child1'>Son</div>
        <div data-testid='child2'>Daughter</div>
        <div data-testid='child3'>Dog</div>
      </Popover>
    )

    const popoverContainerElement: HTMLDivElement | null = renderResult.baseElement.querySelector('.MuiPopover-paper')

    expect(popoverContainerElement?.children).toHaveLength(3)
  })
})
