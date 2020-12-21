import privateIcon from '../../../../assets/icons/private-icon-yellow.svg'
import React from 'react'
import { SystemMessageCard, ChatBeginningCardProps } from '.'
import { MessageDivider } from './message_divider'
import { InfoMessageCard } from './info_message_card'
import { getString } from '../../../../utils'

export const ChatBeginningCard: React.FC<ChatBeginningCardProps> = ({ isEncrypted, text }: ChatBeginningCardProps) => (
  <div data-testid='chat-beginning-card'>
    <SystemMessageCard key='beginning' text={text}/>
    {isEncrypted && <>
      <MessageDivider/>
      <InfoMessageCard
        key='beginning-encryption'
        icon={privateIcon}
        text={getString('encryption-chat-message')}
        linkText={getString('encryption-chat-more-message')}
        link={'/app/help'}
      />
    </>}
  </div>
)
