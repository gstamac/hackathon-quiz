import React from 'react'
import { ChatMessages } from './chat_messages'
import { useStyles } from './styles'
import { GlobalidLoader } from '../../global/loading'
import { MessageInput } from './message_input/message_input'
import { ChatInformation } from '../interfaces'
import { useIsMobileOrTabletView } from '../../global/helpers'
import { ChannelHeader } from '../channel_header'
import { useChatContainer } from './use_chat_container'
import { ChatContainerProps } from './interfaces'

export const ChatContainer: React.FC<ChatContainerProps> = (props: ChatContainerProps) => {
  const classes = useStyles()
  const isMobile: boolean = useIsMobileOrTabletView()
  const {
    messagesType,
    channelId,
  } = props

  const chatInformation: ChatInformation | null = useChatContainer(messagesType, channelId)

  if (chatInformation === null) {
    return <div className={classes.centerLoader}>
      <GlobalidLoader />
    </div>
  }

  const {
    identity,
    showOwner,
    readOnly,
    isHiddenMember,
  } = chatInformation

  return (
    <div className={classes.chatContainer}>
      <ChannelHeader channelId={channelId} gidUuid={identity.gid_uuid} {...chatInformation} />
      <ChatMessages channelId={channelId} me={identity} showOwner={showOwner} isHiddenMember={isHiddenMember}/>
      <div className={classes.messageComponentWrapper}>
        <MessageInput disabled={readOnly} isMobile={isMobile} channel_id={channelId} gid_uuid={identity.gid_uuid} />
      </div>
    </div>
  )
}
