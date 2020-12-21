import React from 'react'

import { getString } from '../../../utils'
import { Overlay } from '../../global/overlay'
import { MeetingsProps } from '../interfaces'
import { useAppState } from '../providers/app_state_provider'
import { Meeting } from '../views'

export const MeetingHandler: React.FC<MeetingsProps> = props => {
  const { meetingId } = useAppState()

  if (meetingId === null) {
    return <Overlay isOpen text={getString('connecting')} />
  }

  return <Meeting {...props}/>
}
