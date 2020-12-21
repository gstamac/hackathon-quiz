import { getString, getAvatarUrl } from '../../../../utils'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { useMessageGroupingStyles, MessageGroupingClasses } from './styles'
import React from 'react'
import { Skeleton } from '../../../global/skeletons'
import { getFormattedFullDateTimestamp } from '../../helpers'
import { MESSAGE_TIMESTAMP_15_MINUTES_LIMIT } from '../../../../constants'
import { ChatMessageHooksResponse, ChatMessageHooksProps, MessageDataParsed } from './interfaces'
import { MessageData } from '../../../../store/interfaces'
import { MessageType } from '../interfaces'

export const areMessagesFromSameAuthor = (messageA: MessageData | null, messageB: MessageData | null): boolean => (
  messageA !== null && messageB !== null && messageA.author === messageB.author
)

export const getIsGroupFirstMessage = (
  prevMessage: MessageData | null,
  message: MessageData,
): boolean => {
  if (prevMessage === null) {
    return true
  }

  const isTimestampSeparated: boolean = areTimestampSeparatedMessages(prevMessage, message)

  if (isTimestampSeparated) {
    return true
  }

  const isPrevMessageFromSameAuthor: boolean = areMessagesFromSameAuthor(prevMessage, message)
  const prevIsSystemMessage: boolean = getIsSystemMessage(prevMessage)

  return prevIsSystemMessage || !isPrevMessageFromSameAuthor
}

export const getIsGroupMiddleMessage = (
  prevMessage: MessageData | null,
  message: MessageData,
  nextMessage: MessageData | null
): boolean => {
  if (prevMessage === null || nextMessage === null) {
    return false
  }
  const isPrevTimestampSeparated: boolean = areTimestampSeparatedMessages(prevMessage, message)
  const isNextTimestampSeparated: boolean = areTimestampSeparatedMessages(message, nextMessage)

  if (isPrevTimestampSeparated || isNextTimestampSeparated) {
    return false
  }

  const isPrevMessageFromSameAuthor: boolean = areMessagesFromSameAuthor(prevMessage, message)
  const isNextMessageFromSameAuthor: boolean = areMessagesFromSameAuthor(nextMessage, message)

  return isPrevMessageFromSameAuthor && isNextMessageFromSameAuthor
}

export const getIsGroupLastMessage = (
  message: MessageData,
  nextMessage: MessageData | null
): boolean => {
  if (nextMessage === null) {
    return true
  }

  const isTimestampSeparated: boolean = areTimestampSeparatedMessages(message, nextMessage)

  if (isTimestampSeparated) {
    return true
  }

  const isNextMessageFromSameAuthor: boolean = areMessagesFromSameAuthor(nextMessage, message)
  const nextIsSystemMessage: boolean = getIsSystemMessage(nextMessage)

  return nextIsSystemMessage || !isNextMessageFromSameAuthor
}

export const getIsSystemMessage = (
  message: MessageData | null,
): boolean => (
  message !== null && message.type === MessageType.SYSTEM
)

export const getMessageSpacingStyle = (
  isFirstMessage: boolean,
  isMiddleMessage: boolean,
  isLastMessage: boolean,
  classes: MessageGroupingClasses
): string => {
  if (isFirstMessage) {
    return classes.groupFirstMessage
  }

  if (isLastMessage) {
    return classes.groupLastMessage
  }

  if (isMiddleMessage) {
    return classes.groupMiddleMessage
  }

  return classes.defaultMessageSpacing
}

export const areTimestampSeparatedMessages = (prevMessage: MessageData | null, message: MessageData): boolean => {

  if (prevMessage == null) {
    return true
  }

  const prevMessageTime: number = new Date(prevMessage.created_at).getTime()
  const currentMessageTime: number = new Date(message.created_at).getTime()

  return currentMessageTime - prevMessageTime > MESSAGE_TIMESTAMP_15_MINUTES_LIMIT
}

export const areMessagesFromOtherSides = (prevMessage: MessageData | MessageDataParsed | null, message: MessageData, loggedInUserGidUUID: string): boolean => {
  if (prevMessage !== null && prevMessage.author === loggedInUserGidUUID && message.author !== loggedInUserGidUUID) {
    return true
  }

  return prevMessage !== null && prevMessage.author !== loggedInUserGidUUID && message.author === loggedInUserGidUUID
}

export const getTimestamp = (
  message: MessageData,
): string => getFormattedFullDateTimestamp(message.created_at)

export const getAdminSuffix = (
  admin: string | undefined,
  hideOwner: boolean,
): string => admin !== undefined && !hideOwner ?
  ` ${getString('group-owner')}`
  : ''

export const useChatMessageHooks = (
  { messageContext, me, author, admin, hideOwner }: ChatMessageHooksProps
): ChatMessageHooksResponse => {

  const {
    prevMessage,
    message,
    nextMessage,
  } = messageContext

  const iAmAuthor: boolean = me.gid_uuid === message.author
  const deletedByMe: boolean = message.deleted_by ? me.gid_name === message.deleted_by : false
  const authorIsAdmin: boolean = admin === message.author

  const isTimestampSeparated: boolean = areTimestampSeparatedMessages(prevMessage, message)
  const isSideSeparated: boolean = areMessagesFromOtherSides(prevMessage, message, me.gid_uuid)
  const prevIsSystemMessage: boolean = getIsSystemMessage(prevMessage)

  const classes = useMessageGroupingStyles({
    isSideSeparated,
    iAmAuthor,
    prevIsSystemMessage,
  })

  const displayNameText: string = author ? `${author.gid_name}${authorIsAdmin ? getAdminSuffix(admin, hideOwner) : ''}` : ''

  useSelector((state: RootState) => state.channels.members[author?.gid_uuid ?? '']?.display_image_url)

  const imageSrc: string = author?.display_image_url ?? getAvatarUrl(message.author)

  const image = <Skeleton loading={!imageSrc} className={classes.userImage} variant='circle' component='div'>
    <img className={classes.userImage} src={imageSrc} alt='user avatar'/>
  </Skeleton>

  const isGroupFirstMessage: boolean = getIsGroupFirstMessage(prevMessage, message)
  const isGroupMiddleMessage: boolean = getIsGroupMiddleMessage(prevMessage, message, nextMessage)
  const isGroupLastMessage: boolean = getIsGroupLastMessage(message, nextMessage)
  const isLastMessage: boolean = nextMessage === null

  const messageContainerStyle: string = getMessageSpacingStyle(
    isGroupFirstMessage,
    isGroupMiddleMessage,
    isGroupLastMessage,
    classes,
  )

  const displayName: JSX.Element | null = !iAmAuthor && isGroupFirstMessage
    ? <div className={classes.userName}>
      {displayNameText}
    </div>
    : null

  const avatar: JSX.Element | null = !iAmAuthor && isGroupLastMessage
    ? image
    : null

  const timestampString: string | null = getTimestamp(message)

  const timestamp = isTimestampSeparated
    ? <div className={classes.timestamp}>
      {timestampString}
    </div>
    : null

  return {
    iAmAuthor,
    deletedByMe,
    displayName,
    avatar,
    messageContainerStyle,
    timestamp,
    timestampString,
    isLastMessage,
  }
}
