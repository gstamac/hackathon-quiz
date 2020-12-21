import React from 'react'
import { render, act, RenderResult, userEvent } from '../../../../../tests/test_utils'
import { LayoutControl } from './layout_control'

import * as provider from '../../providers/app_state_provider'
import { mocked } from 'ts-jest/utils'
import { Layout, Theme } from '../../enums'

jest.mock('../../providers/app_state_provider')

describe('LayoutControl tests', () => {
  let renderResult: RenderResult
  const toggleLayoutMock: jest.Mock = jest.fn()
  const useAppStateMock: jest.Mock = mocked(provider.useAppState)

  const renderComponent = (layout: string): void => {
    useAppStateMock.mockReturnValueOnce({
      toggleLayout: toggleLayoutMock,
      layout,
      theme: Theme.DARK,
    })
    act(() => {
      renderResult = render(
        <LayoutControl />
      )
    })
  }

  it('should render layout control component', () => {
    renderComponent(Layout.Featured)
    expect(renderResult.getByAltText('Layout')).toBeDefined()
    expect(renderResult.getByText(Layout.Featured)).toBeDefined()
  })

  it('should call toggleLayout when image is clicked', () => {
    renderComponent(Layout.Featured)
    const image: Element = renderResult.getByAltText('Layout')

    act(() => {
      userEvent.click(image)
    })
    expect(toggleLayoutMock).toHaveBeenCalled()
  })
})
