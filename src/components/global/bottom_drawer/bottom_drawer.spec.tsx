import React from 'react'
import { BottomDrawer } from './bottom_drawer'
import { BottomDrawerProps } from './interfaces'
import { getAllByTestId } from '@testing-library/react'
import { act, cleanup, render, userEvent, RenderResult } from '../../../../tests/test_utils'

describe('BottomDrawer', () => {
  let renderResult: RenderResult

  const renderComponent = (bottomDrawerProps: BottomDrawerProps): void => {
    renderResult = render(<BottomDrawer open {...bottomDrawerProps}/>)
  }

  afterEach(() => {
    cleanup()
  })

  it('should render drawer with children', () => {
    renderResult = render(
      <BottomDrawer open>
        <div data-testid='child'>Son</div>
        <div data-testid='child'>Daughter</div>
        <div data-testid='child'>Dog</div>
      </BottomDrawer>
    )

    const drawerContainerElement: HTMLDivElement = renderResult.baseElement.querySelector('.MuiDrawer-paper') as HTMLDivElement
    const childElements: Element[] = getAllByTestId(drawerContainerElement, 'child')

    expect(childElements).toHaveLength(3)
  })

  it('should trigger callback upon close', () => {
    const onCloseCallback: jest.Mock = jest.fn()

    renderComponent({ onClose: onCloseCallback })

    const closeButton: Element = renderResult.getByAltText('close')

    expect(onCloseCallback).not.toHaveBeenCalled()

    act(() => {
      userEvent.click(closeButton)
    })

    expect(onCloseCallback).toHaveBeenCalled()
  })

  it('should display title in header', () => {
    const title: string = 'Title'

    renderComponent({ title })

    const titleElement: Element = renderResult.getByText(title)

    expect(titleElement).toBeDefined()
  })
})
