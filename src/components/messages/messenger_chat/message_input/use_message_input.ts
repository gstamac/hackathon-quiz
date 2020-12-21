import { KeyEvent } from './../../../../constants'
import { GameManager } from './../../../../services/command_handlers/game_manager'
import { useState, KeyboardEvent, ChangeEvent, useEffect, useRef, useCallback, RefObject } from 'react'
import { Theme, useTheme } from '@material-ui/core'
import { SendComponentState, MessageInputHooksProps, ComposerProps, MessageStates, MessageInputHookResult } from './interfaces'
import { throttle } from 'lodash'
import { MIN_IMAGE_SIZE_BYTES, IMAGE_PNG, IMAGE_JPEG } from '../../../../constants'
import { Dispatch } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { setToastError } from 'globalid-react-ui'
import { ChannelWithParticipantsAndParsedMessage } from '../../../../store/interfaces'
import { RootState } from 'RootType'
import { trimTextLeftAndRightSideWhiteSpaces } from './helpers'
import { getString, sendImageToChannel, sendMessageToChannel } from '../../../../utils'
import { sendTypingNotification } from '../../../../services/api'
import { store } from '../../../../store'
import { Stack } from '../../../../services/stack/stack'
import { setGameQuizFormState } from '../../../../store/ui_slice'

const createStates = (theme: Theme): MessageStates => {
  const { electricBlue, white, brightGray } = theme.palette.customColors

  const stateSwitch: MessageStates = {
    [SendComponentState.ACTIVE]: {
      iconInterface: { lineColor: white, backgroundColor: electricBlue, opacity: 1 },
      placeholder: getString('empty-message-input'),
    },
    [SendComponentState.PICTURE_INPUT]: {
      iconInterface: {
        lineColor: white,
        backgroundColor: electricBlue,
        opacity: 1,
      }, placeholder: '',
    },
    [SendComponentState.DISABLED]: {
      iconInterface: {
        lineColor: brightGray,
        backgroundColor: electricBlue,
        opacity: 0.2,
      }, placeholder: getString('disabled-message-input'),
    },
    [SendComponentState.INACTIVE]: {
      iconInterface: { lineColor: white, backgroundColor: electricBlue, opacity: 0.5 },
      placeholder: getString('empty-message-input'),
    },
  }

  return stateSwitch
}

enum Command {
  GAME = 'game'
}

const isValidCommand = (command: string):command is Command => Object.values(Command).includes(<Command>command)

const isString = (x: string | File): x is string => typeof x === 'string'

const isCommand = (x: string): boolean => x.startsWith('/')

export const sentMessage = (channel_id: string, gid_uuid: string, encryptedChannelSecret?: string) =>
  async (data: string | File): Promise<boolean> => {
    if (isString(data)) {
      if (isCommand(data)){
        const command = data.replace('/', '')

        if (isValidCommand(command)){
          if (command === Command.GAME){
            const channel = (store.getState()).channels.channels[channel_id]?.channel

            if (channel)
            {
              store.dispatch(setGameQuizFormState(true))
            }
          }

          return true
        }

      }

      return sendMessageToChannel(data, channel_id, gid_uuid, undefined, encryptedChannelSecret)
    }

    const assetUuid: string | undefined = await sendImageToChannel(data, channel_id, gid_uuid, undefined)

    return assetUuid !== undefined
  }

const getMultilineLimit = (isMobile: boolean): number => isMobile ? 3 : 9

interface ChannelInput {
  [key: string]: string
}

// eslint-disable-next-line max-lines-per-function
export const useMessageInput = (props: MessageInputHooksProps): MessageInputHookResult => {
  const inputElementRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null)
  const { disabled, onSend, channel_id } = props
  const defaultState: SendComponentState = disabled ? SendComponentState.DISABLED : SendComponentState.INACTIVE
  const [componentState, setComponentState] = useState<SendComponentState>(defaultState)
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null)
  const [channelMessages, setChannelMessage] = useState<ChannelInput | undefined>(undefined)

  const dispatch: Dispatch = useDispatch()

  const setMessage = (newMessage: string): void => {
    setChannelMessage((prevValue: ChannelInput | undefined) => ({
      ...prevValue,
      [channel_id]: newMessage,
    }))
  }

  const channel: ChannelWithParticipantsAndParsedMessage | undefined = useSelector((state: RootState) => (
    state.channels.channels[props.channel_id]?.channel
  ))

  const message = channelMessages?.[channel_id] ?? ''

  useEffect(() => {
    focusInput()

    const clearText: boolean = channelMessages?.[channel_id] === undefined
      || channelMessages[channel_id].length === 0

    applyState(clearText)

    if (disabled) {
      setComponentState(SendComponentState.DISABLED)
    }
  }, [channel_id])

  const applyState = (textCleared: boolean): void => {
    setComponentState(textCleared ? SendComponentState.INACTIVE : SendComponentState.ACTIVE)
  }

  const sendMessage = async (): Promise<void> => {
    if (!disabled && componentState !== SendComponentState.INACTIVE) {
      setMessage('')
      applyState(true)

      if (message.length > 0) {
        const trimmed = trimTextLeftAndRightSideWhiteSpaces(message)

        await onSend(trimmed)

      } else if (uploadedImageFile !== null) {

        const imageFile: File = uploadedImageFile

        setUploadedImageFile(null)

        await onSend(imageFile)
      }
    }
  }

  // eslint-disable-next-line complexity
  const onKeyPress = async (keyboardEvent: KeyboardEvent<HTMLDivElement>): Promise<void> => {
    if (keyboardEvent.key === KeyEvent.Enter) {
      if (!keyboardEvent.shiftKey){
        keyboardEvent.preventDefault()
        await sendMessage()
      }
    }
  }

  const throttleSendTypingNotification = useCallback(throttle(sendTypingNotification, 5000), [])

  const onChange = async (changeEvent: ChangeEvent<HTMLInputElement>): Promise<void> => {
    setMessage(changeEvent.target.value)

    const messageText: string = trimTextLeftAndRightSideWhiteSpaces(changeEvent.target.value)

    if (messageText.length > 0) {

      applyState(false)
      await throttleSendTypingNotification(channel_id)

      return
    }

    if (messageText.length === 0) {
      applyState(true)
    }

    await throttleSendTypingNotification(channel_id)
  }

  const focusInput = (): void => {
    if (inputElementRef.current) {
      inputElementRef.current.focus()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files !== null && e.target.files.length === 1) {

      const imageFile: File = e.target.files[0]

      if (![IMAGE_PNG, IMAGE_JPEG].includes(imageFile.type)) {

        dispatch(setToastError({
          title: getString('image-data-format-error-title-toast'),
          message: getString('image-data-format-error-toast'),
        }))

        return
      }

      if (imageFile.size <= MIN_IMAGE_SIZE_BYTES) {

        dispatch(setToastError({
          title: getString('image-data-size-error-title'),
          message: getString('image-data-size-error'),
        }))

        return
      }

      setUploadedImageFile(imageFile)
      setComponentState(SendComponentState.PICTURE_INPUT)
      focusInput()
    }

    e.target.value = ''
  }

  const handleRemoveImage = (): void => {
    setUploadedImageFile(null)
    setComponentState(SendComponentState.INACTIVE)
  }

  const theme: Theme = useTheme()
  const composerCharacteristics = createStates(theme)
  const getComposerProperties: ComposerProps = composerCharacteristics[componentState]

  const readOnly: boolean = uploadedImageFile !== null

  return {
    message,
    onChange,
    onKeyPress,
    sendMessage,
    getIconStyle: () => getComposerProperties.iconInterface,
    getMultilineLimit,
    textPlaceholder: getComposerProperties.placeholder,
    disabled,
    readOnly,
    inputElementRef,
    uploadedImageFile,
    handleInputChange,
    handleRemoveImage,
    onInputClick: focusInput,
    channel,
  }
}
