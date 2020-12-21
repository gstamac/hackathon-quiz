import React from 'react'

import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { Folder } from '@globalid/messaging-service-sdk'
import { addSeconds, isAfter, isBefore } from 'date-fns'

import { ChannelType } from '../../../store/interfaces'
import { getAvatarUrl, getString } from '../../../utils'
import { ChannelFoldersType } from '../interfaces'
import { SystemMessageCard } from './chat_message_cards'
import { MessageDivider } from './chat_message_cards/message_divider'
import { TypingMessageCard } from './chat_message_cards/typing_message_card'
import { ChatMessageCards, classesType, TypingDetails } from './interfaces'

const getTypingCard = (participant: PublicIdentity | undefined): JSX.Element | null => {
  if (participant === undefined) {
    return null
  }

  const imageSrc: string = participant.display_image_url ?? getAvatarUrl(participant.gid_uuid)

  return <TypingMessageCard key={'typing-card'} avatar={imageSrc} />
}

const addTyping = (
  typingDetails: TypingDetails
): ChatMessageCards[] => {
  if (typingDetails.typing === undefined) {
    return typingDetails.mappedMessages
  }

  const typingCard: ChatMessageCards | null = typingDetails.channelType === ChannelType.PERSONAL ? getTypingCard(typingDetails.identities[typingDetails.membersWithoutUser[0]]) : null
  const timeNow: number = Date.now()
  const typingStartedAt: Date = new Date(typingDetails.typing.started_at)
  const typingExpirationTime: Date = addSeconds(typingStartedAt, 7)

  if (
    typingDetails.typing && typingCard !== null
    && isAfter(typingExpirationTime, timeNow)
    && (typingDetails.lastMessageTime === undefined || isBefore(new Date(typingDetails.lastMessageTime), typingStartedAt))
  ) {
    return [typingCard, ...typingDetails.mappedMessages]
  }

  return typingDetails.mappedMessages
}

export const addBottomCards = (
  typingDetails: TypingDetails,
  folderId: string | undefined | null,
  folders: Folder[],
  classes: classesType,
): ChatMessageCards[] => {
  const otherFolderId: string | undefined = folders.find((folder: Folder) => folder.type === ChannelFoldersType.UNKNOWN)?.id

  if (folderId === otherFolderId) {
    const systemMessageText: string = typingDetails.channelType === ChannelType.PERSONAL ? getString('change-folder-description-personal') : getString('change-folder-description-multi')

    return [
      <div key={'add_to_contact_message'} className={classes.moveChatText}><SystemMessageCard text={systemMessageText} /></div>,
      <div key={'add_to_contact_divider'} className={classes.moveChatDivider}><MessageDivider/></div>,
      ...addTyping(typingDetails),
    ]
  }

  return addTyping(typingDetails)
}
