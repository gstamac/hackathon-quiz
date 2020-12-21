import React, { useRef } from 'react'
import { MessageInputProps } from './interfaces'
import { TextField, SvgIcon, Fade, InputAdornment, InputProps } from '@material-ui/core'
import { sendMessageIcon } from '../../../global/icons'
import { useStyles } from './style'
import { useMessageInput, sentMessage } from './use_message_input'
import { useSelector } from 'react-redux'
import { getEncryptedChannelSecret } from '../../../../store/selectors'
import PickImageIcon from '../../../../assets/icons/pick_image_icon.svg'
import PickImageIconDisabled from '../../../../assets/icons/pick_image_disabled_icon.svg'
import RemoveIcon from '../../../../assets/icons/close-icon.svg'
import { IMAGE_PNG, IMAGE_JPEG } from '../../../../constants'

export const MessageInput: React.FC<MessageInputProps> = (props: MessageInputProps) => {

  const {
    channel_id,
    ...rest
  } = props

  const encryptedChannelSecret: string | undefined = useSelector(getEncryptedChannelSecret(channel_id))

  const inputReference: React.RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null)

  const onInputSendClick = sentMessage(channel_id, rest.gid_uuid, encryptedChannelSecret)

  const {
    message,
    onKeyPress,
    onChange,
    sendMessage,
    getIconStyle,
    getMultilineLimit,
    textPlaceholder,
    disabled,
    readOnly,
    inputElementRef,
    uploadedImageFile,
    handleInputChange,
    handleRemoveImage,
    onInputClick,
    channel,
  } = useMessageInput({
    ...rest,
    channel_id,
    onSend: onInputSendClick,
  })

  const classes = useStyles({ inputLength: message.length, disabled })
  const {
    messageInput,
    messageInputPlaceholder,
    messageSendIcon,
    messageInputContainer,
    messageInputWrapper,
    pickImageWrapper,
    displayNone,
    imagePlaceholder,
    removeIcon,
    imageText,
  } = classes

  if (channel === undefined) {
    return null
  }

  const triggerUploadButton = (): void => {
    if (inputReference.current !== null) {
      inputReference.current.click()
    }
  }

  const getAdornment = (): Partial<InputProps> => (uploadedImageFile ?
    {
      startAdornment:
        <InputAdornment position='start' className={imagePlaceholder}>
          <img className={removeIcon} src={RemoveIcon} alt='remove_image' onClick={handleRemoveImage}/>
          <span className={imageText}>{uploadedImageFile.name}</span>
        </InputAdornment>,
    } : {}
  )

  const getUploadButtonImage = (): string => disabled ? PickImageIconDisabled : PickImageIcon

  const getUploadButton = (): Partial<InputProps> => (
    <Fade in={message.length === 0} timeout={600} >
      <div className={pickImageWrapper} onClick={triggerUploadButton}>
        <input data-testid='image_upload' type={'file'} className={displayNone} disabled={message.length > 0 || disabled}
          accept={`${IMAGE_PNG}, ${IMAGE_JPEG}`} ref={inputReference} onChange={handleInputChange}/>
        <img src={getUploadButtonImage()} alt='pick_image'/>
      </div>
    </Fade>
  )

  return (
    <div className={messageInputWrapper}>
      <div className={messageInputContainer}>
        <TextField
          inputRef={inputElementRef}
          className={messageInput}
          onKeyPress={onKeyPress}
          onChange={onChange}
          multiline
          rowsMax={getMultilineLimit(props.isMobile)}
          disabled={disabled}
          placeholder={textPlaceholder}
          value={message}
          InputProps={{
            disableUnderline: true,
            readOnly,
            onClick: onInputClick,
            classes: { input: messageInputPlaceholder },
            ...getAdornment(),
          }}
        />
        <span data-testid='send_button' onClick={sendMessage} className={messageSendIcon}>
          <SvgIcon component={() => sendMessageIcon(getIconStyle())}/>
        </span>
      </div>
      {getUploadButton()}
    </div>
  )
}
