import React, { ChangeEvent, RefObject, KeyboardEvent } from 'react'
import { ComplexIconInterface } from '../../../global/icons/interfaces'
import { ChannelWithParticipantsAndParsedMessage } from '../../../../store/interfaces'

export interface MessageInputProps {
  disabled: boolean
  isMobile: boolean
  gid_uuid: string
  channel_id: string
}

export enum SendComponentState {
  INACTIVE,
  ACTIVE,
  DISABLED,
  PICTURE_INPUT,
}

export interface MessageInputHooksProps {
  disabled: boolean
  onSend: Function
  channel_id: string
  gid_uuid: string
}

export interface MessageInputHooksResponse {
  message: string
  onChange: (changeEvent: ChangeEvent<HTMLInputElement>) => void
  onKeyPress: (keyboardEvent: KeyboardEvent<HTMLDivElement>) => Promise<void>
  sendMessage: () => Promise<void>
  getIconStyle: () => ComplexIconInterface
  getMultilineLimit: (isMobile: boolean) => number
  textPlaceholder: string
  disabled: boolean
  inputElementRef: RefObject<HTMLInputElement>
  readOnly: boolean
  uploadedImageFile: File | null
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveImage: () => void
  onInputClick: () => void
  channel: ChannelWithParticipantsAndParsedMessage | undefined
}

export interface ComposerProps {
  iconInterface: ComplexIconInterface
  placeholder: string
}

export interface MessageStates {
  [key: number]: ComposerProps
}

export interface MessageInputHookResult {
  message: string
  onChange: (changeEvent: ChangeEvent<HTMLInputElement>) => Promise<void>
  onKeyPress: (keyboardEvent: KeyboardEvent<HTMLDivElement>) => Promise<void>
  sendMessage: () => Promise<void>
  getIconStyle: () => ComplexIconInterface
  getMultilineLimit: (isMobile: boolean) => number
  textPlaceholder: string
  disabled: boolean
  readOnly: boolean
  inputElementRef: RefObject<HTMLInputElement>
  uploadedImageFile: File | null
  handleInputChange: (changeEvent: ChangeEvent<HTMLInputElement>) => void
  handleRemoveImage: () => void
  onInputClick: () => void
  channel: ChannelWithParticipantsAndParsedMessage | undefined
}
