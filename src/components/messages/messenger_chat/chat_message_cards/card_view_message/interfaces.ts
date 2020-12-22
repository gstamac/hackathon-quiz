import { useCardViewStyles } from './styles'
import { MessageCardElement, MessageTemplateButtonItem } from '@globalid/messaging-service-sdk'
import { ButtonState } from 'globalid-react-ui'

export enum ButtonTypes {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  ADDITIONAL = 'ADDITIONAL'
}

export interface CardViewMessageButtonsWrapperProps extends CardViewMessageStyles {
  buttons?: MessageTemplateButtonItem[]
  onClick: (params: MessageTemplateButtonItem) => void
  buttonElementsState: ButtonElementsState
}

export type CardViewMessageStyles = {
  classes: ReturnType<typeof useCardViewStyles>
}

export interface CardViewMessageContentProps extends MessageCardElement, CardViewMessageStyles {
  channelId: string
}

export type CardViewButtonsType = (
  button: MessageTemplateButtonItem,
  index: number
) => JSX.Element

export type ButtonElementsState = { [key in ButtonTypes]: ButtonState }

export interface UseCardViewMessageHookResult {
  handleClickToButtons: (params: MessageTemplateButtonItem) => Promise<void>
  buttonElementsState: ButtonElementsState
  handleRejectInvitation: () => Promise<void>
  openRejectInvitationDialog: () => void
  closeRejectInvitationDialog: () => void
  rejectInvitationDialogOpen: boolean
}

export enum ButtonLinkType {
  DEEPLINK = 'DEEPLINK',
  URL = 'URL'
}

export enum MessageCardType {
  GROUP_INVITATION = 'group_invitation',
  MEETING_INVITATION = 'meeting_invitation',
  GAME = 'game',
  UNKNOWN = 'unknown',
}

export interface PrimaryButtonProps {
  text: string
  endIcon: JSX.Element | string
  className: string
}

export interface CardViewButtonProps extends CardViewMessageStyles {
  button: MessageTemplateButtonItem
  onClick: (params: MessageTemplateButtonItem) => void
  buttonElementsState: ButtonElementsState
}
