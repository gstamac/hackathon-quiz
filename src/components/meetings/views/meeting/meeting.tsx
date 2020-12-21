// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'

import { StyledLayout, StyledContent } from './meeting.styled'
import { useNavigation } from '../../providers/navigation_provider'
import { MeetingDetails } from '../../containers/meeting_details'
import { MeetingControls } from '../../containers/meeting_controls'
import { NavigationControl } from '../../containers/navigation/navigation_control'
import { DevicePermissionPrompt } from '../../containers/device_permission_prompt'
import { useMeetingEndRedirect } from '../../hooks/use_meeting_end_redirect'
import { NavigationContextType } from '../../providers/interfaces'
import {
  VideoTileGrid,
  UserActivityProvider,
} from 'amazon-chime-sdk-component-library-react'
import { MeetingEndCallback } from '../../interfaces'
import { useAppState } from '../../providers/app_state_provider'

export const Meeting: React.FC<MeetingEndCallback> = props => {
  useMeetingEndRedirect(props)
  const { showNavbar, showRoster }: NavigationContextType = useNavigation()
  const { layout } = useAppState()

  return (
    <UserActivityProvider>
      <StyledLayout showNav={showNavbar} showRoster={showRoster}>
        <StyledContent>
          <VideoTileGrid
            layout={layout}
            className='videos'
            noRemoteVideoView={<MeetingDetails />}
          />
          <MeetingControls {...props}/>
        </StyledContent>
        <NavigationControl />
      </StyledLayout>
      <DevicePermissionPrompt />
    </UserActivityProvider>
  )
}
