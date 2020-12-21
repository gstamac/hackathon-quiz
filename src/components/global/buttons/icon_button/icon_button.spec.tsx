import React from 'react'
import { cleanup } from '@testing-library/react'
import { IconButton } from './icon_button'
import { RenderResult, render, userEvent } from '../../../../../tests/test_utils'
import { act } from 'react-dom/test-utils'
import { IconButtonProps, iconType } from './interfaces'
import { getPeopleIcons } from './helpers'
import { getString } from '../../../../utils'

describe('IconButton', () => {
  let renderResult: RenderResult
  const handleOnClickMock: jest.Mock = jest.fn()

  const getRenderResult = (buttonProps: IconButtonProps): void => {
    renderResult = render(<IconButton { ...buttonProps }/>)
  }

  const props: IconButtonProps = {
    disabled: false,
    handleClick: handleOnClickMock,
    icon: iconType.SEND_FUNDS,
    loading: false,
    title: 'title',
  }

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render the iconButton component', () => {
    getRenderResult(props)

    const buttonIcon: Element | null = renderResult.getByRole('img')
    const buttonTitle: Element | null = renderResult.getByText(props.title)

    expect(buttonIcon.getAttribute('src')).toEqual(getPeopleIcons(iconType.SEND_FUNDS))
    expect(buttonTitle).not.toBeNull()
  })

  it('Should call OnHandleClick function when the button is being clicked', () => {
    getRenderResult(props)

    const buttonIcon: Element = renderResult.getByRole('img')
    const buttonTitle: Element = renderResult.getByTestId('button-title')

    act(() => {
      userEvent.click(buttonIcon)
      userEvent.click(buttonTitle)
    })

    expect(handleOnClickMock).toHaveBeenCalledTimes(2)
  })

  it('Should render the iconButton with Coming soon tooltip and disabled onClick function', () => {
    getRenderResult({ ...props, disabled: true })

    const tooltip: Element | null = renderResult.getByTitle(getString('coming-soon'))
    const buttonIcon: Element = renderResult.getByRole('img')
    const buttonTitle: Element = renderResult.getByTestId('button-title')

    act(() => {
      userEvent.click(buttonIcon)
      userEvent.click(buttonTitle)
    })

    expect(tooltip).not.toBeNull()
    expect(handleOnClickMock).not.toHaveBeenCalled()
  })

  it('Should render the iconButton with custom tooltip and disabled onClick function', () => {
    getRenderResult({ ...props, disabled: true, tooltipText: 'random_text' })

    const tooltip: Element | null = renderResult.getByTitle('random_text')
    const buttonIcon: Element = renderResult.getByRole('img')
    const buttonTitle: Element = renderResult.getByTestId('button-title')

    act(() => {
      userEvent.click(buttonIcon)
      userEvent.click(buttonTitle)
    })

    expect(tooltip).not.toBeNull()
    expect(handleOnClickMock).not.toHaveBeenCalled()
  })
})
