import React from 'react'
import { ListCounterProps } from './interfaces'
import { useStyles } from './styles'

export const ChannelListCounter: React.FC<ListCounterProps> = ({ unreadMessagesCount }: ListCounterProps) => {
  const { unreadMessagesCountCircle, unreadMessagesCountNumber } = useStyles(
    { unreadMessageLength: unreadMessagesCount.length }
  )

  return (
    <div className={unreadMessagesCountCircle}>
      <span className={unreadMessagesCountNumber}>{unreadMessagesCount}</span>
    </div>
  )
}
