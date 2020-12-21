import React from 'react'

import {
  ControlBar,
  AudioInputControl,
  VideoInputControl,
  ContentShareControl,
  AudioOutputControl,
  ControlBarButton,
  useUserActivityState,
  Dots,
  useLocalVideo,
} from 'amazon-chime-sdk-component-library-react'
import { useNavigation } from '../../providers/navigation_provider'
import { StyledControls } from './meeting_controls.styled'
import { getString } from '../../../../utils'
import { EndMeetingControl } from '../end_meeting_control'
import { NavigationContextType } from '../../providers/interfaces'
import { UserActivityState } from './interfaces'
import { MeetingEndCallback } from '../../interfaces'
import useAsyncEffect from 'use-async-effect'
import { LayoutControl } from '../layout_control'

export const MeetingControls: React.FC<MeetingEndCallback> = props => {
  const { toggleNavbar, closeRoster, showRoster }: NavigationContextType = useNavigation()
  const { isUserActive }: UserActivityState = useUserActivityState()
  const { toggleVideo } = useLocalVideo()

  useAsyncEffect(async () => {
    await toggleVideo()
  }, [])

  const handleToggle = (): void => {
    if (showRoster) {
      closeRoster()
    }

    toggleNavbar()
  }

  return (
    <StyledControls className='controls' active={!!isUserActive}>
      <ControlBar
        className='controls-menu'
        layout='undocked-horizontal'
        showLabels
      >
        <ControlBarButton
          className='mobile-toggle'
          icon={<Dots />}
          onClick={handleToggle}
          label={getString('menu')}
        />
        <AudioInputControl />
        <VideoInputControl />
        <ContentShareControl />
        <AudioOutputControl />
        <LayoutControl />
        <EndMeetingControl {...props}/>
      </ControlBar>
    </StyledControls>
  )
}
