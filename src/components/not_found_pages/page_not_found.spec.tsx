import React from 'react'
import { cleanup } from '@testing-library/react'
import { PageNotFound } from '.'
import { RenderResult, render, userEvent } from '../../../tests/test_utils'
import * as utils from '../../utils/router_utils'
import { act } from 'react-dom/test-utils'
import { getString } from '../../utils'

jest.mock('../../utils/router_utils')

const getRenderResult = (): RenderResult => render(<PageNotFound />)

describe('Page Not Found', () => {
  let renderResult: RenderResult
  const redirectToMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (utils.pushTo as jest.Mock) = redirectToMock
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render page not found component', () => {
    renderResult = getRenderResult()

    const background_icon: Element | null = renderResult.getByAltText('Page not found background icon')
    const coming_soon_text: Element | null = renderResult.getByText(getString('page-not-found-title'))
    const description_text: Element | null = renderResult.getByText(getString('page-not-found-description'))
    const login_button: Element | null = renderResult.getByText(getString('page-not-found-button'))

    expect(background_icon).not.toBeNull()
    expect(coming_soon_text).not.toBeNull()
    expect(description_text).not.toBeNull()
    expect(login_button).not.toBeNull()
    expect(redirectToMock).not.toHaveBeenCalled()
  })

  it('Should redirect to login page when user clicks the Go home button', () => {
    renderResult = getRenderResult()

    const login_button: Element | null = renderResult.getByText(getString('page-not-found-button'))

    act(() => {
      userEvent.click(login_button)
    })

    expect(redirectToMock).toHaveBeenCalled()
  })
})
