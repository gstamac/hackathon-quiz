import React from 'react'
import { RenderResult, render, act, userEvent } from '../../../../tests/test_utils'
import { RightSidebar } from './right_sidebar'
import { RightSidebarProps } from './interfaces'

describe('Right sidebar', () => {
  let renderResult: RenderResult
  const onExit: jest.Mock = jest.fn()
  const closeSidebarActionMock: jest.Mock = jest.fn()

  const sidebarProps: RightSidebarProps = {
    title: 'test title',
    children: <div>test content</div>,
    open: true,
    onExit: onExit,
  }

  const renderSidebar = (props: RightSidebarProps): void => {
    act(() => {
      renderResult = render(<RightSidebar {...props} />)
    })
  }

  it('Should render opened right sidebar', () => {
    renderSidebar(sidebarProps)

    const title: Element = renderResult.getByText('test title')
    const content: Element = renderResult.getByText('test content')
    const close_button: Element = renderResult.getByAltText('close button')

    expect(title).not.toBeUndefined()
    expect(content).not.toBeUndefined()
    expect(close_button).not.toBeUndefined()
  })

  it('Should render right sidebar with element as title', () => {
    renderSidebar({ ...sidebarProps, title: <div>test element</div> })

    const title: Element = renderResult.getByText('test element')
    const content: Element = renderResult.getByText('test content')
    const close_button: Element = renderResult.getByAltText('close button')

    expect(title).not.toBeUndefined()
    expect(content).not.toBeUndefined()
    expect(close_button).not.toBeUndefined()
  })

  it('Should render right sidebar with back icon', () => {
    renderSidebar(sidebarProps)

    const close_button: Element = renderResult.getByAltText('close button')

    expect(close_button).not.toBeUndefined()
  })

  it('Should render closed right sidebar', () => {
    renderSidebar({ ...sidebarProps, open: false })

    const title: Element | null = renderResult.queryByText('test title')
    const content: Element | null = renderResult.queryByText('test content')
    const close_button: Element | null = renderResult.queryByAltText('close button')

    expect(title).toBeNull()
    expect(content).toBeNull()
    expect(close_button).toBeNull()
  })

  it('Should call onExit on close button click', () => {
    renderSidebar(sidebarProps)

    const close_button: Element = renderResult.getByAltText('close button')

    act(() => {
      userEvent.click(close_button)
    })

    expect(onExit).toHaveBeenCalled()
  })

  it('Should call closeSidebarAction when the drawer is being closed', () => {
    renderSidebar({ ...sidebarProps, closeSidebarAction: closeSidebarActionMock })

    const close_button: Element = renderResult.getByAltText('close button')

    act(() => {
      userEvent.click(close_button)
    })

    expect(closeSidebarActionMock).toHaveBeenCalled()
  })
})
