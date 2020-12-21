import React from 'react'
import { CardViewButtonsType, CardViewMessageButtonsWrapperProps, ButtonTypes } from './interfaces'
import { MessageTemplateButtonItem } from '@globalid/messaging-service-sdk'
import { CardViewPrimaryButton, CardViewSecondaryButton } from './card_view_message_buttons'

export const CardViewMessageButtonsWrapper: React.FC<CardViewMessageButtonsWrapperProps> = (
  { buttons, ...rest }: CardViewMessageButtonsWrapperProps
) => {

  const cardViewButtonsMap: Map<ButtonTypes, CardViewButtonsType> = new Map([
    [ButtonTypes.PRIMARY, (button: MessageTemplateButtonItem) => <CardViewPrimaryButton button={button} {...rest} />],
    [ButtonTypes.SECONDARY, (button: MessageTemplateButtonItem) => <CardViewSecondaryButton button={button} {...rest} />],
    [ButtonTypes.ADDITIONAL, (button: MessageTemplateButtonItem) => <CardViewPrimaryButton button={button} {...rest} />],
  ])

  const buttonElements: JSX.Element[] | undefined = buttons?.map(
    (button: MessageTemplateButtonItem, index: number) => <div key={index}>
      {cardViewButtonsMap.get(button.mode as ButtonTypes)?.(button, index)}
    </div>)

  return (<>{buttonElements}</>)
}
