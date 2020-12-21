import React from 'react'
import { render, act, userEvent, cleanup, RenderResult } from '../../../../../../tests/test_utils'
import { CardViewPrimaryButton, CardViewSecondaryButton } from './card_view_message_buttons'
import { ButtonTypes, CardViewButtonProps } from './interfaces'
import { ButtonState } from 'globalid-react-ui'
import { cardViewMessageButton } from '../../../../../../tests/mocks/messages_mock'
import { cardViewClassesMock } from '../../../../../../tests/mocks/classes_mocks'

describe('Card view message buttons', () => {
  let renderResult: RenderResult

  const handleClickToButtons: jest.Mock = jest.fn()

  const buttonProps: CardViewButtonProps = {
    classes: cardViewClassesMock,
    button: cardViewMessageButton,
    onClick: handleClickToButtons,
    buttonElementsState: {
      [ButtonTypes.PRIMARY]: ButtonState.DEFAULT,
      [ButtonTypes.ADDITIONAL]: ButtonState.DEFAULT,
      [ButtonTypes.SECONDARY]: ButtonState.DEFAULT,
    },
  }

  describe('CardViewPrimaryButton', () => {

    const renderComponent = (props: CardViewButtonProps): void => {
      act(() => {
        renderResult = render(<CardViewPrimaryButton {...props}/>)
      })
    }

    afterEach(() => {
      cleanup()
      jest.clearAllMocks()
    })

    it('should render cardView primary button', () => {
      renderComponent(buttonProps)

      const primaryButtonText: Element = renderResult.getByText('primary_button_title')
      const rightSideIcon: Element | null = renderResult.queryByAltText('arrow-right')

      expect(rightSideIcon).toBeDefined()
      expect(primaryButtonText).toBeDefined()
    })

    it('should call handle click function when clicking to primary button', () => {
      renderComponent(buttonProps)

      const primaryButtonText: Element = renderResult.getByText('primary_button_title')

      expect(primaryButtonText).toBeDefined()

      act(() => {
        userEvent.click(primaryButtonText)
      })

      expect(handleClickToButtons).toHaveBeenCalledWith(cardViewMessageButton)
    })

    it('should show loader when primary button state is in progress', () => {
      renderComponent({
        ...buttonProps,
        buttonElementsState: {
          [ButtonTypes.PRIMARY]: ButtonState.INPROGRESS,
          [ButtonTypes.ADDITIONAL]: ButtonState.DEFAULT,
          [ButtonTypes.SECONDARY]: ButtonState.DEFAULT,
        },
      })

      const primaryButtonText: Element | null = renderResult.queryByText('primary_button_title')
      const rightSideIcon: Element | null = renderResult.queryByAltText('arrow-right')
      const progressbar: Element | null = renderResult.queryByRole('progressbar')

      expect(primaryButtonText).toBeNull()
      expect(rightSideIcon).toBeNull()
      expect(progressbar).not.toBeNull()
    })
  })

  describe('CardViewSecondaryButton', () => {

    const renderComponent = (props: CardViewButtonProps): void => {
      act(() => {
        renderResult = render(<CardViewSecondaryButton {...props}/>)
      })
    }

    afterEach(() => {
      cleanup()
      jest.clearAllMocks()
    })

    it('should render cardView secondary button button', () => {
      renderComponent(
        { ...buttonProps, button: { ...cardViewMessageButton, title: 'secondary_button_text' } }
      )

      const secondaryButtonText: Element = renderResult.getByText('secondary_button_text')

      expect(secondaryButtonText).toBeDefined()
    })

    it('should call click callback function', () => {
      renderComponent(
        { ...buttonProps, button: { ...cardViewMessageButton, title: 'secondary_button_text' } }
      )

      const secondaryButtonText: Element | null = renderResult.getByText('secondary_button_text')

      act(() => {
        userEvent.click(secondaryButtonText)
      })

      expect(handleClickToButtons).toHaveBeenCalledWith({ ...cardViewMessageButton, title: 'secondary_button_text' })
    })
  })
})
