import React from 'react'
import { render, cleanup, RenderResult, act, userEvent } from '../../../../../../tests/test_utils'
import { CardViewMessageContent } from './card_view_message_content'
import { MessageCardElement } from '@globalid/messaging-service-sdk'
import { cardViewMessageButton, cardViewMessageRejectButton, cardViewMessageApproveButton } from '../../../../../../tests/mocks/messages_mock'
import { cardViewClassesMock} from '../../../../../../tests/mocks/classes_mocks'
import { getString } from '../../../../../utils'

describe('Card view message content', () => {
  let renderResult: RenderResult
  const elements: MessageCardElement = {
    icon: {
      type: 'GROUP_ICON',
    },
    buttons: [cardViewMessageButton, { ...cardViewMessageButton, mode: 'SECONDARY', title: 'secondary_button_title' }],
    primary_text: 'primary_text',
    secondary_text: 'secondary_text',
    title_text: 'title_text',
  }

  afterEach(() => {
    cleanup()
  })

  it('should render card view message content', () => {
    renderResult = render(<CardViewMessageContent classes={cardViewClassesMock} {...elements}/>)

    const icon: Element | null = renderResult.queryByAltText('group-icon')
    const textTitle: Element | null = renderResult.queryByText('title_text')
    const primaryText: Element | null = renderResult.queryByText('primary_text')
    const secondaryText: Element | null = renderResult.queryByText('secondary_text')
    const primaryButtonText: Element | null = renderResult.queryByText('primary_button_title')
    const secondaryButtonText: Element | null = renderResult.queryByText('secondary_button_title')

    expect(icon).not.toBeNull()
    expect(textTitle).not.toBeNull()
    expect(primaryText).not.toBeNull()
    expect(secondaryText).not.toBeNull()
    expect(primaryButtonText).not.toBeNull()
    expect(secondaryButtonText).not.toBeNull()
  })

  it('should render only provided fields', () => {
    renderResult = render(<CardViewMessageContent
      {...{
        classes: cardViewClassesMock,
        icon: undefined,
        buttons: undefined,
        primary_text: undefined,
        secondary_text: undefined,
        title_text: 'title',
      }}/>)

    const icon: Element | null = renderResult.queryByAltText('card-view-message-icon')
    const textTitle: Element | null = renderResult.queryByText('title')
    const primaryText: Element | null = renderResult.queryByText('primary_text')
    const secondaryText: Element | null = renderResult.queryByText('secondary_text')
    const primaryButtonText: Element | null = renderResult.queryByText('primary_title')
    const secondaryButtonText: Element | null = renderResult.queryByText('secondary_title')

    expect(icon).toBeNull()
    expect(textTitle).not.toBeNull()
    expect(primaryText).toBeNull()
    expect(secondaryText).toBeNull()
    expect(primaryButtonText).toBeNull()
    expect(secondaryButtonText).toBeNull()
  })

  it('should render reject invitation dialog', () => {
    renderResult = render(<CardViewMessageContent
      {...{
        ...elements,
        classes: cardViewClassesMock,
        buttons: [cardViewMessageApproveButton, cardViewMessageRejectButton],
      }}/>)

    const approveButton: Element = renderResult.getByText('approve')
    const rejectButton: Element = renderResult.getByText('reject')

    expect(approveButton).toBeDefined()
    expect(rejectButton).toBeDefined()

    act(() => {
      userEvent.click(rejectButton)
    })

    const dialogTitle: Element | null = renderResult.queryByText(getString('reject-invitation-dialog-header'))

    expect(dialogTitle).not.toBeNull()
  })

  it('should render camera icon', () => {
    const meetingElements: MessageCardElement = {
      icon: {
        type: 'CALL_ICON',
      },
      buttons: [ { ...cardViewMessageButton, cta_link: 'https://link.stage.global.id/call/48'}],
      primary_text: 'primary_text',
      secondary_text: 'secondary_text',
      title_text: 'title_text',
    }

    renderResult = render(<CardViewMessageContent classes={cardViewClassesMock} {...meetingElements}/>)

    const icon: Element | null = renderResult.queryByAltText('camera-icon')

    expect(icon).not.toBeNull()
  })

  it('should render mobile icon', () => {
    const mobileElements: MessageCardElement = {
      icon: {
        type: 'GROUP_ICON',
      },
      primary_text: 'primary_text',
      secondary_text: 'secondary_text',
      title_text: 'title_text',
    }

    renderResult = render(<CardViewMessageContent classes={cardViewClassesMock} {...mobileElements}/>)

    const icon: Element | null = renderResult.queryByAltText('mobile-icon')

    expect(icon).not.toBeNull()
  })
})
