import React from 'react'
import { useStyles } from './styles'
import { ParticipantsHeaderProps } from './interfaces'
import { getString } from '../../utils'
import { CONVERSATION_PARTICIPANTS_LIMIT } from '../../constants'

export const ParticipantsHeader: React.FC<ParticipantsHeaderProps> = ({
  participantsCount,
}: ParticipantsHeaderProps) => {
  const classes = useStyles()

  return (
    <div className={classes.headerWrapper} data-testid='participants-header'>
      <div className={classes.infoField}>
        <span className={classes.titleText}>
          {getString('new-message')}
        </span>
        <span className={classes.participantsText}>
          {`${participantsCount}/${CONVERSATION_PARTICIPANTS_LIMIT}`}
        </span>
      </div>
    </div>
  )
}
