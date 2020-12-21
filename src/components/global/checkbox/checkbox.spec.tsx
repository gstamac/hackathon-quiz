import React from 'react'
import { Checkbox } from './checkbox'
import { CheckboxProps } from './interfaces'
import { cleanup, render, RenderResult } from '../../../../tests/test_utils'

describe('Checkbox', () => {
  let renderResult: RenderResult

  afterEach(() => {
    cleanup()
  })

  const renderComponent = (checkboxProperties: CheckboxProps): void => {
    renderResult = render(<Checkbox { ...checkboxProperties }/>)
  }

  it('should be rendered with correct icon in checked state', () => {
    renderComponent({ checked: true })

    const checkboxIcon: SVGElement | null = renderResult.baseElement.querySelector('svg')
    const svgContainer: HTMLDivElement = document.createElement('div')
    const expectedSvgElement: string = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="2" fill="#0D51FF"/><path d="M17.25 6.41667L8.08333 15.5833C7.91667 15.75 7.75 15.8333 7.5 15.8333C7.25 15.8333 7.08333 15.75 6.91667 15.5833L2.75 11.4167C2.41667 11.0833 2.41667 10.5833 2.75 10.25C3.08333 9.91667 3.58333 9.91667 3.91667 10.25L7.5 13.8333L16.0833 5.25C16.4167 4.91667 16.9167 4.91667 17.25 5.25C17.5833 5.58333 17.5833 6.08333 17.25 6.41667Z" fill="white"/></svg>'

    svgContainer.innerHTML = expectedSvgElement

    expect(checkboxIcon?.parentElement?.innerHTML).toContain(svgContainer.innerHTML)
  })

  it('should be rendered with correct icon in unchecked state', () => {
    renderComponent({ checked: false })

    const checkboxIcon: SVGElement | null = renderResult.baseElement.querySelector('svg')
    const svgContainer: HTMLDivElement = document.createElement('div')
    const expectedSvgElement = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="19" height="19" rx="1.5" stroke="#7E7E80"/></svg>'

    svgContainer.innerHTML = expectedSvgElement

    expect(checkboxIcon?.parentElement?.innerHTML).toContain(svgContainer.innerHTML)
  })
})
