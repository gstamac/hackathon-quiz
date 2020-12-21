import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { ButtonGroup } from '.'
import { act } from 'react-dom/test-utils'
import { GroupButton } from './interfaces'
import { render, userEvent } from '../../../../tests/test_utils'

describe('Button Group', () => {
  let renderResult: RenderResult
  const onClickMock: jest.Mock = jest.fn()

  const buttons: GroupButton[] = [
    {
      label: 'Button1',
      onClick: onClickMock,
    },
    {
      label: 'Button2',
      onClick: onClickMock,
      counter: '16',
    },
    {
      label: 'Button3',
      onClick: onClickMock,
      isActiveClickEnabled: true,
    },
  ]

  beforeEach(() => {
    act(() => {
      renderResult = render(<ButtonGroup buttons={buttons} active={0} />)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render the button group component', () => {
    const first_button: Element | null = renderResult.queryByText(buttons[0].label)
    const second_button: Element | null = renderResult.queryByText(buttons[1].label)
    const third_button: Element | null = renderResult.queryByText(buttons[2].label)
    const button_counter: Element | null = renderResult.queryByText('(16)')

    expect(first_button).not.toBeNull()
    expect(second_button).not.toBeNull()
    expect(button_counter).not.toBeNull()
    expect(third_button).not.toBeNull()
  })

  it('Should call onClick functions when clicking on unactive button', () => {
    const first_button: Element = renderResult.getByText(buttons[0].label)
    const second_button: Element = renderResult.getByText(buttons[1].label)

    act(() => {
      userEvent.click(first_button)
    })

    expect(onClickMock).not.toHaveBeenCalled()

    act(() => {
      userEvent.click(second_button)
    })

    expect(onClickMock).toHaveBeenCalledTimes(1)
  })

  it('Should call onClick functions when clicking on active button if isActiveClickEnabled flag is set', () => {
    const third_button: Element = renderResult.getByText(buttons[2].label)

    act(() => {
      userEvent.click(third_button)
    })

    expect(onClickMock).toHaveBeenCalledTimes(1)

    act(() => {
      userEvent.click(third_button)
    })

    expect(onClickMock).toHaveBeenCalledTimes(2)
  })
})
