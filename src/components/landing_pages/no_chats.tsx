import React from 'react'
import { useStyles } from './styles'
import BackgroundIcon from '../../assets/icons/no_chats_icon.svg'
import { getString } from '../../utils'

export const NoChats: React.FC = () => {
  const classes = useStyles()
  const {
    contentWrapper,
    backgroundPic,
    comingSoon,
    description,
  } = classes

  return (
    <div className={contentWrapper}>
      <img
        className={backgroundPic}
        src={BackgroundIcon}
        alt='Background icon'
      />
      <span className={comingSoon}>
        {getString('no-chats-title')}
      </span>
      <span className={description}>
        {getString('no-chats-description')}
      </span>
    </div>
  )
}
