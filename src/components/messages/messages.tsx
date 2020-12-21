import React from 'react'
import { useStyles } from './styles'
import { ChannelsWrapper, MessagesContent } from '.'
import {
  MessagesType,
  UseMessagesResponse,
} from './interfaces'
import { MessagesMobile } from '../landing_pages'
import { useIsMobileOrTabletView } from '../global/helpers'
import { useMessages } from './use_messages'

export const Messages: React.FC = () => {
  const classes = useStyles()

  const {
    encryptionStatus,
    groupUuid,
    type,
    channelId,
    setEncryptionStatus,
  }: UseMessagesResponse = useMessages()

  if (useIsMobileOrTabletView()) {
    return (
      <MessagesMobile />
    )
  } else {
    return (
      <div className={classes.messagesPage}>
        <ChannelsWrapper folderType={type as MessagesType} groupUuid={groupUuid} encryptionStatus={encryptionStatus}/>
        <MessagesContent type={type as MessagesType}
          channelId={channelId}
          groupUuid={groupUuid}
          encryptionStatus={encryptionStatus}
          setEncryptionStatus={setEncryptionStatus}
        />
      </div>
    )
  }
}
