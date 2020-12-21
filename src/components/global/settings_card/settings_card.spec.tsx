import React from 'react'
import { act, render, userEvent, RenderResult } from '../../../../tests/test_utils'
import { SettingsCardProps } from './interfaces'
import { SettingsCard } from './settings_card'

describe('Settings card', () => {
  let renderResult: RenderResult

  const defaultProps: SettingsCardProps = {
    menuItems: [{
      id: 'test-item',
      text: 'test-item',
    }],
    title: 'test title',
    middleText: <div>test div</div>,
    isDialogOpen: true,
  }

  const renderComponent = (props: SettingsCardProps): void => {
    act(() => {
      renderResult = render(<SettingsCard { ...props } />)
    })
  }

  it('should render settings card', () => {
    renderComponent(defaultProps)

    const title: Element = renderResult.getByText('test title')
    const middleText: Element = renderResult.getByText('test div')
    const icon: Element = renderResult.getByTestId('settings-button')

    expect(title).toBeDefined()
    expect(middleText).toBeDefined()
    expect(icon).toBeDefined()
  })

  it('should render settings card with description', () => {
    renderComponent({...defaultProps, description: 'test description'})

    const title: Element = renderResult.getByText('test title')
    const middleText: Element = renderResult.getByText('test div')
    const description: Element = renderResult.getByText('test description')
    const icon: Element = renderResult.getByTestId('settings-button')

    expect(title).toBeDefined()
    expect(middleText).toBeDefined()
    expect(description).toBeDefined()
    expect(icon).toBeDefined()
  })

  it('should render settings card and open quick menu items', () => {
    renderComponent(defaultProps)

    const icon: Element = renderResult.getByTestId('settings-button')

    expect(icon).toBeDefined()

    act(() => {
      userEvent.click(icon)
    })

    const quickItem: Element = renderResult.getByText('test-item')

    expect(quickItem).toBeDefined()
  })

  it('should render settings card and open quick menu items when openMenu is false', () => {
    renderComponent({ ...defaultProps, isDialogOpen: false })

    const icon: Element = renderResult.getByTestId('settings-button')

    expect(icon).toBeDefined()

    act(() => {
      userEvent.click(icon)
    })

    const quickItem: Element = renderResult.getByText('test-item')

    expect(quickItem).toBeDefined()
  })
})
