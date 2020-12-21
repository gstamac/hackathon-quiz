import React from 'react'
import { cleanup, act } from '@testing-library/react'
import { ContinueToApp } from './continue_to_app'
import { RenderResult, render } from '../../../tests/test_utils'
import { getString } from '../../utils'

describe('Continue to App Component', () => {
  let renderResult: RenderResult

  beforeEach(() => {
    act(() => {
      renderResult = render(<ContinueToApp />)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render the Continue to App component', () => {
    const component: Element | null = renderResult.getByTestId('continue_to_app')
    const background_icon: Element | null = renderResult.getByAltText('Continue to app background icon')
    const continue_to_app_title: Element | null = renderResult.getByText(getString('continue-to-app-title'))
    const continue_to_app_description: Element | null = renderResult.getByText(getString('continue-to-app-description'))
    const scan_icon: Element | null = renderResult.getByAltText('Scan to Download app')

    expect(component).not.toBeNull()
    expect(background_icon).not.toBeNull()
    expect(continue_to_app_title).not.toBeNull()
    expect(continue_to_app_description).not.toBeNull()
    expect(scan_icon).not.toBeNull()
  })
})
