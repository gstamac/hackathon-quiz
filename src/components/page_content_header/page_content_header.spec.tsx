import React from 'react'
import { PageContentHeader } from '.'
import * as auth from '../auth'
import { RenderResult, act, render, cleanup, matchMedia } from '../../../tests/test_utils'

jest.mock('../auth')

describe('PageContentHeader', () => {
  let renderResult: RenderResult
  const validateTokenMock: jest.Mock = jest.fn()
  const tabletMaxWidth: number = 768
  const isTabletView = (width: number): boolean => width <= tabletMaxWidth

  const renderHeader = (): void => {
    act(() => {
      renderResult = render(<PageContentHeader title={'test'} border={false}/>)
    })
  }

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  it('Should render the header in desktop viewport when logged in', () => {
    (auth.validateToken as jest.Mock) = validateTokenMock.mockReturnValue(true)
    renderHeader()
    const header_text: Element | null = renderResult.getByText('test')
    const header_logo: Element | null = renderResult.queryByAltText('logo')

    expect(header_text).not.toBeUndefined()
    expect(header_logo).toBeNull()
  })

  it('Should render the header in desktop viewport when logged out', () => {
    (auth.validateToken as jest.Mock) = validateTokenMock.mockReturnValue(false)
    renderHeader()
    const header_text: Element | null = renderResult.getByText('test')
    const header_logo: Element | null = renderResult.queryByAltText('logo')

    expect(header_text).not.toBeUndefined()
    expect(header_logo).toBeNull()
  })

  it('Should render the header in tablet or mobile viewports', () => {
    (auth.validateToken as jest.Mock) = validateTokenMock.mockReturnValue(true)
    const isMobile: boolean = isTabletView(350)

    matchMedia(isMobile)

    renderHeader()
    const header_text: Element | null = renderResult.getByText('test')
    const header_logo: Element | null = renderResult.getByAltText('logo')

    expect(header_text).not.toBeUndefined()
    expect(header_logo).not.toBeUndefined()
  })
})
