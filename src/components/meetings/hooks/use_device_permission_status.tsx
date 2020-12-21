/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react'
import { MeetingManager, useMeetingManager } from 'amazon-chime-sdk-component-library-react'
import { DevicePermissionStatus } from '../enums'

export const useDevicePermissionStatus = (): string => {
  const meetingManager: MeetingManager = useMeetingManager()
  const [permission, setPermission] = useState<string>(DevicePermissionStatus.UNSET)

  useEffect(() => {
    const callback = (updatedPermission: string): void => {
      setPermission(updatedPermission)
    }

    meetingManager.subscribeToDevicePermissionStatus(callback)

    return () => {
      meetingManager.unsubscribeFromDevicePermissionStatus(callback)
    }
  }, [meetingManager])

  return permission
}
