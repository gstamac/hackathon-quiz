/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, useState, PropsWithChildren } from 'react'
import { getString } from '../../../utils'
import { AppStateValue, LayoutType } from './interfaces'
import { Theme, Layout } from '../enums'

export const AppStateContext = React.createContext<AppStateValue | null>(null)

export const useAppState = (): AppStateValue => {
  const state: AppStateValue | null = useContext(AppStateContext)

  if (!state) {
    throw new Error(getString('meeting-useappstate-error'))
  }

  return state
}
export const AppStateProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [meetingId, setMeeting] = useState<string | null>(null)
  const [region, setRegion] = useState<string>('')
  const [localUserName, setLocalName] = useState<string>('')
  const [theme, setTheme] = useState<string>(() => {
    const storedTheme: string | null = localStorage.getItem('theme')

    return storedTheme ?? Theme.LIGHT
  })

  const [layout, setLayout] = useState<LayoutType>(() => {
    const storedTheme: string | null = localStorage.getItem('layout')

    return (storedTheme ?? Layout.Featured) as LayoutType
  })

  const toggleTheme = (): void => {
    if (theme === Theme.LIGHT) {
      setTheme(Theme.DARK)
      localStorage.setItem('theme', Theme.DARK)
    } else {
      setTheme(Theme.LIGHT)
      localStorage.setItem('theme', Theme.LIGHT)
    }
  }

  const toggleLayout = (): void => {
    if (layout === Layout.Featured) {
      setLayout(Layout.Standard)
      localStorage.setItem('layout', Layout.Standard)
    } else {
      setLayout(Layout.Featured)
      localStorage.setItem('layout', Layout.Featured)
    }
  }

  const setAppMeetingInfo = (
    _meetingId: string,
    _name: string,
    _region: string

  ): void => {
    setRegion(_region)
    setMeeting(_meetingId)
    setLocalName(_name)
  }

  const providerValue = {
    meetingId,
    localUserName,
    theme,
    layout,
    region,
    toggleTheme,
    toggleLayout,
    setAppMeetingInfo,
  }

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  )
}
