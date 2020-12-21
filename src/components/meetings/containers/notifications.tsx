/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'

import { StateType } from 'amazon-chime-sdk-component-library-react/lib/providers/NotificationProvider/state'
import {
  useNotificationState,
  NotificationGroup,
} from 'amazon-chime-sdk-component-library-react'

export const Notifications: React.FC = () => {
  const { notifications }: StateType = useNotificationState()

  return notifications.length !== 0 ? <NotificationGroup /> : null
}
