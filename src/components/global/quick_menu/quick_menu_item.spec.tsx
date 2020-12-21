import React from 'react'
import {
  RenderResult,
  render,
  userEvent,
  act,
  cleanup,
} from '../../../../tests/test_utils'
import { QuickMenuItem } from './quick_menu_item'
import { UserMinusIcon } from '../icons'
import { QuickMenuItemProps } from './interfaces'
import { getUseStateMock } from '../../../../tests/mocks/use_state_mock'

describe('Quick Menu Item', () => {
  let renderResult: RenderResult
  const onClickMock: jest.Mock = jest.fn()

  const defaultProps: QuickMenuItemProps = {
    id: 'test_id',
    text: 'test' ,
    icon: UserMinusIcon('red'),
    onClick: onClickMock,
  }

  const renderComponent = (newProps?: Partial<QuickMenuItemProps>): void => {
    const props: QuickMenuItemProps = {
      ...defaultProps,
      ...newProps,
    }

    renderResult = render(<QuickMenuItem {...props}/>)
  }

  afterEach(() => {
    cleanup()
  })

  it('should render quick menu item', () => {
    renderComponent()

    const itemText: HTMLElement | null = renderResult.queryByText('test')
    const image: SVGElement | null = renderResult.container.querySelector('svg')

    expect(itemText).not.toBeNull()
    expect(image).not.toBeNull()
  })

  it('should render no option', () => {
    renderComponent({
      hidden: true,
    })

    const itemText: HTMLElement | null = renderResult.queryByText('test')

    expect(itemText).toBeNull()
  })

  it('should not call onClick when quick menu item is disabled', () => {
    renderComponent({
      disabled: true,
    })
    const itemText: HTMLElement = renderResult.getByText('test')

    act(() => {
      userEvent.click(itemText)
    })

    expect(onClickMock).not.toHaveBeenCalled()
  })

  it('should call onClick when quick menu item is not disabled', () => {
    const [setState, _useStateMock]: jest.Mock[] = getUseStateMock()

    renderComponent()
    const itemText: HTMLElement = renderResult.getByText('test')

    act(() => {
      userEvent.click(itemText)
    })

    expect(onClickMock).toHaveBeenCalled()
    expect(setState).toHaveBeenCalledTimes(1)
    expect(setState.mock.calls[0][0]).toBe(true)
  })
})
