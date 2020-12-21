import React from 'react'
import { render, act, cleanup, RenderResult } from '../../../../../../tests/test_utils'
import { CardViewMessageButtonsWrapper } from './card_view_message_buttons_wrapper'
import { ButtonTypes, CardViewMessageButtonsWrapperProps } from './interfaces'
import { ButtonState } from 'globalid-react-ui'
import { cardViewMessageButton } from '../../../../../../tests/mocks/messages_mock'
import { cardViewClassesMock } from '../../../../../../tests/mocks/classes_mocks'

describe('Card view message buttons wrapper', () => {
  let renderResult: RenderResult

  const handleClickToButtons: jest.Mock = jest.fn()

  const buttonProps: CardViewMessageButtonsWrapperProps = {
    classes: cardViewClassesMock,
    buttons: [cardViewMessageButton, { ...cardViewMessageButton, mode: ButtonTypes.SECONDARY, title: 'secondary_title' }],
    onClick: handleClickToButtons,
    buttonElementsState: {
      [ButtonTypes.PRIMARY]: ButtonState.DEFAULT,
      [ButtonTypes.ADDITIONAL]: ButtonState.DEFAULT,
      [ButtonTypes.SECONDARY]: ButtonState.DEFAULT,
    },
  }

  const renderComponent = (props: CardViewMessageButtonsWrapperProps): void => {
    act(() => {
      renderResult = render(<CardViewMessageButtonsWrapper {...props}/>)
    })
  }

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render primary and secondary buttons', () => {
    renderComponent(buttonProps)

    const primaryButtonText: Element = renderResult.getByText('primary_button_title')
    const secondaryButtonText: Element = renderResult.getByText('secondary_title')

    expect(primaryButtonText).toBeDefined()
    expect(secondaryButtonText).toBeDefined()
  })

  it('should render only primary button component', () => {
    renderComponent({
      ...buttonProps,
      buttons: [cardViewMessageButton],
    })

    const primaryButtonText: Element | null = renderResult.queryByText('primary_button_title')
    const rightSideIcon: Element | null = renderResult.queryByAltText('arrow-right')

    expect(primaryButtonText).not.toBeNull()
    expect(rightSideIcon).not.toBeNull()
  })

  it('should render only secondary button component', () => {
    renderComponent({
      ...buttonProps,
      buttons: [{...cardViewMessageButton, mode: 'SECONDARY', title: 'secondary_button_text'}],
    })

    const secondaryButtonText: Element | null = renderResult.queryByText('secondary_button_text')
    const primaryButtonText: Element | null = renderResult.queryByText('primary_button_title')
    const rightSideIcon: Element | null = renderResult.queryByAltText('arrow-right')

    expect(secondaryButtonText).not.toBeNull()
    expect(primaryButtonText).toBeNull()
    expect(rightSideIcon).toBeNull()
  })
})
