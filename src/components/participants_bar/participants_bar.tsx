import React from 'react'
import { useStyles } from './styles'
import { ParticipantsBarProps } from './interfaces'
import { Participant } from '../../store/interfaces'
import { RemovableItem } from '../global/removable_item'
import { RemovableItemProps } from '../global/removable_item/interfaces'
import { UserAvatar } from '../global/user_avatar'
import _ from 'lodash'

export const ParticipantsBar: React.FC<ParticipantsBarProps> = ({
  participants,
  removeFromParticipants,
}: ParticipantsBarProps) => {
  const classes = useStyles()

  if (_.isEmpty(participants)) {
    return null
  }

  const showParticipants = (): (JSX.Element | string)[] => (
    participants.map((participant: Participant | undefined) => {
      if (participant === undefined) {
        return ''
      }

      const itemProperties: RemovableItemProps = {
        label: participant.gidName,
        image: <UserAvatar gidUuid={participant.gidUuid} imageUrl={participant.imageUrl} />,
        onRemove: () => { removeFromParticipants(participant.gidUuid) },
      }

      return <RemovableItem key={participant.gidUuid} {...itemProperties} />
    })
  )

  return (
    <div data-testid='participants-bar' className={classes.participantsWrapper}>
      {showParticipants()}
    </div>
  )
}
