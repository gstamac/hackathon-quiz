/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react'
import { getString } from '../../../utils'
import {
  MeetingStatus,
  useNotificationDispatch,
  Severity,
  ActionType,
  useMeetingStatus,
  Action,
} from 'amazon-chime-sdk-component-library-react'
import { MeetingEndCallback } from '../interfaces'

export const useMeetingEndRedirect = ({ onMeetingEnd }: MeetingEndCallback): void => {
  const dispatch: React.Dispatch<Action> = useNotificationDispatch()
  const meetingStatus: MeetingStatus = useMeetingStatus()

  useEffect(() => {
    if (meetingStatus === MeetingStatus.Ended) {
      dispatch({
        type: ActionType.ADD,
        payload: {
          severity: Severity.INFO,
          message: getString('meeting-ended-message'),
          autoClose: true,
          replaceAll: true,
        },
      })
      onMeetingEnd()
    }
  }, [meetingStatus])
}
