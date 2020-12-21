/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'

import { Navigation } from '.'
import { NavigationContextType } from '../../providers/interfaces'
import { useNavigation } from '../../providers/navigation_provider'
import { MeetingRoster } from '../meeting_roster'

export const NavigationControl: React.FC = () => {
  const { showNavbar, showRoster }: NavigationContextType = useNavigation()

  return (
    <>
      {showNavbar ? <Navigation /> : null}
      {showRoster ? <MeetingRoster /> : null}
    </>
  )
}
