/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import useAsyncEffect from 'use-async-effect'

import { useRouteMatch } from 'react-router-dom'
import { JoinInfo, MeetingsProps } from '../interfaces'
import { useAppState } from '../providers/app_state_provider'
import { getString } from '../../../utils'
import {
  useMeetingManager,
  useNotificationDispatch,
  Severity,
  ActionType,
  Action,
  MeetingManager,
} from 'amazon-chime-sdk-component-library-react'
import { AppStateValue } from '../providers/interfaces'
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js'

export const NoMeetingRedirect: React.FC<MeetingsProps> = ({
  children,
  onNoMeetingRedirect,
  handleMeetingRequest,
  getAttendeeCallback,
}) => {
  const dispatch: React.Dispatch<Action> = useNotificationDispatch()
  const meetingManager: MeetingManager = useMeetingManager()

  const { setAppMeetingInfo }: AppStateValue = useAppState()
  const routeMatch = useRouteMatch<{ meetingId?: string, channelId?: string }>()

  meetingManager.getAttendee = getAttendeeCallback

  const meetingIdParam: string | undefined = routeMatch.params.meetingId
  const channelIdParam: string | undefined = routeMatch.params.channelId

  const notifyMeetingErrorAndRedirect = (): void => {
    const payload: any = {
      severity: Severity.INFO,
      message: getString('no-meeting-redirect-message'),
      autoClose: true,
    }

    dispatch({
      type: ActionType.ADD,
      payload: payload,
    })
    onNoMeetingRedirect()
  }

  const fetchMeeting = async (meetingId: string, channelId: string): Promise<void> => {
    try {
      const joinInfo: JoinInfo = await handleMeetingRequest(meetingId, channelId)

      const attendeeName: string = (await getAttendeeCallback(joinInfo.attendee.AttendeeId ?? '', joinInfo.attendee.ExternalUserId)).name ?? ''

      const config: MeetingSessionConfiguration = new MeetingSessionConfiguration(joinInfo.meeting, joinInfo.attendee)

      config.enableSimulcastForUnifiedPlanChromiumBasedBrowsers = true
      config.enableUnifiedPlanForChromiumBasedBrowsers = true

      await meetingManager.initializeMeetingSession(config)
      await meetingManager.start()

      setAppMeetingInfo(meetingId, attendeeName, joinInfo.meeting.MediaRegion)
    }
    catch {
      notifyMeetingErrorAndRedirect()
    }
  }

  useAsyncEffect(async () => {
    if (!meetingManager.meetingSession && meetingIdParam !== undefined && channelIdParam !== undefined) {
      await fetchMeeting(meetingIdParam, channelIdParam)
    } else {

      notifyMeetingErrorAndRedirect()
    }
  }, [])

  return <>{children}</>
}
