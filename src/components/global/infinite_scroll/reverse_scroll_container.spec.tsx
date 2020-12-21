import React from 'react'
import { RenderResult, render, cleanup } from '../../../../tests/test_utils'
import { ReverseScrollContainer, ReverseScrollContainerProps } from './reverse_scroll_container'
import { fireEvent } from '@testing-library/dom'

const arrayOfItems: number[] = [...new Array(10).keys()]

describe('ReverseScrollContainer', () => {
  let renderResult: RenderResult
  const reportScrollTopMock: jest.Mock = jest.fn()
  const scrollToMock: jest.Mock = jest.fn()

  const scrollProps: ReverseScrollContainerProps = {
    style: {},
    className: 'ReverseScrollContainer',
    reportScrollTop: reportScrollTopMock,
    scrollTo: scrollToMock,
  }

  const renderComponent = (): void => {
    renderResult = render(<ReverseScrollContainer {...scrollProps}>
      {arrayOfItems.map((i: number) => (
        <div key={i}>item {i}</div>
      ))}
    </ReverseScrollContainer>)
  }

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  it('should render scrollContainer with provided items', () => {
    renderComponent()
    const scrollContainer: Element | null = renderResult.container.querySelector('.ReverseScrollContainer')

    expect(scrollContainer).not.toBeNull()

    arrayOfItems.forEach((i: number) => {
      const text: Element = renderResult.getByText(`item ${i}`)

      expect(text).toBeDefined()
    })
  })

  it('should call reportScrollTop function', () => {
    renderComponent()
    const scrollContainer: Element = renderResult.container.querySelector('.ReverseScrollContainer') as Element

    fireEvent.scroll(scrollContainer, { y: 100 })

    expect(reportScrollTopMock).toHaveBeenCalled()
    expect(scrollToMock).not.toHaveBeenCalled()
  })
})
