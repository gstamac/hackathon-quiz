import React from 'react'
import { useAppState } from '../../providers/app_state_provider'
import { StyledList } from './meeting_details.styled'
import {
  Flex,
  Heading,
  MeetingManager,
  useMeetingManager,
} from 'amazon-chime-sdk-component-library-react'
import { getString } from '../../../../utils'
import { AppStateValue } from '../../providers/interfaces'

export const MeetingDetails: React.FC = () => {
  const { meetingId }: AppStateValue = useAppState()
  const manager: MeetingManager = useMeetingManager()

  return (
    <Flex container layout='fill-space-centered'>
      <Flex>
        <Heading level={4} tag='h1'>
          {getString('meeting-information')}
        </Heading>
        <StyledList>
          <dl>
            <dt>{getString('meeting-id')}</dt>
            <dd>{meetingId}</dd>
          </dl>
          <dl>
            <dt>{getString('meeting-hosted-region')}</dt>
            <dd>{manager.meetingRegion}</dd>
          </dl>
        </StyledList>
      </Flex>
    </Flex>
  )
}
