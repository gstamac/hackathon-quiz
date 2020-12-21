import React from 'react'
import { QuickMenu } from './quick_menu'
import { QuickMenuItemProps, QuickMenuProps } from './interfaces'
import * as helpers from '../helpers'
import { act, cleanup, render, RenderResult } from '../../../../tests/test_utils'

describe('Quick Menu', () => {
  let renderResult: RenderResult

  const cursorAtRef: React.RefObject<Element> = React.createRef<Element>()
  const isMobileViewMock: jest.Mock = jest.fn()

  const item: QuickMenuItemProps = {
    id: 'id',
    text: 'test',
    disabled: false,
  }

  const properties: QuickMenuProps = {
    cursorAt: cursorAtRef,
    open: true,
    items: [item],
  }

  const renderComponent = (quickMenuProperties: QuickMenuProps): void => {
    act(() => {
      renderResult = render(<QuickMenu { ...quickMenuProperties } />)
    })
  }

  beforeEach(() => {
    (helpers.useIsMobileOrTabletView as jest.Mock) = isMobileViewMock.mockReturnValue(false)
  })

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  it('should render quick menu with items', () => {
    renderComponent(properties)

    const menu: Element = renderResult.getByRole('list')
    const items: Element[] = renderResult.getAllByRole('menuitem')

    expect(menu).not.toBeNull()
    expect(items).toHaveLength(1)
  })

  it('should show loading spinner when menu items are not provided', () => {
    renderComponent({ ...properties, items: undefined })

    const spinner: Element = renderResult.getByRole('spinner')

    expect(spinner).not.toBeNull()
  })

  it('should show title in mobile view when specified', () => {
    isMobileViewMock.mockReturnValue(true)

    const title: string = 'Title'

    renderComponent({ ...properties, title })

    const closeButton: Element = renderResult.getByAltText('close')
    const titleElement: Element = renderResult.getByText(title)

    expect(closeButton).not.toBeNull()
    expect(titleElement).not.toBeNull()
  })

  it('should show backdrop in mobile view', () => {
    isMobileViewMock.mockReturnValue(true)

    renderComponent(properties)

    const backdropElement: HTMLDivElement | null = renderResult.baseElement.querySelector('.MuiBackdrop-root')

    expect(backdropElement).not.toBeNull()
  })
})
