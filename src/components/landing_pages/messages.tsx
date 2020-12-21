import React from 'react'
import { useStyles } from './styles'
import messagesBackgroundIcon from '../../assets/icons/messages-background.svg'
import { getString } from '../../utils'
import { MessagesProps } from './interfaces'
import { MessagesType } from '../messages/interfaces'

export const Messages: React.FC<MessagesProps> = ({ type }: MessagesProps) => {
  const classes = useStyles()
  const {
    contentWrapper,
    backgroundPic,
    comingSoon,
  } = classes

  return (
    <div data-testid={'messages'} className={contentWrapper}>
      <img
        className={backgroundPic}
        src={messagesBackgroundIcon}
        alt='Messages background icon'
      />
      <span className={comingSoon}>
        {getString(type === MessagesType.GROUPS? 'messages-text-groups' : 'messages-text')}
      </span>
    </div>
  )
}
