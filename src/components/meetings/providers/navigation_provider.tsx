/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  PropsWithChildren,
} from 'react'
import { useLocation } from 'react-router-dom'
import { MeetingManager, useMeetingManager } from 'amazon-chime-sdk-component-library-react'
import { NavigationContextType } from './interfaces'
import { Location } from 'history'
import { getString } from '../../../utils'

import useAsyncEffect from 'use-async-effect'

export const NavigationContext = React.createContext<NavigationContextType | null>(null)

const isDesktop = (): boolean => window.innerWidth > 768

export const NavigationProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [showNavbar, setShowNavbar] = useState<boolean>(() => isDesktop())
  const [showRoster, setShowRoster] = useState<boolean>(() => isDesktop())
  const isDesktopView: React.MutableRefObject<boolean> = useRef(isDesktop())

  const location: Location = useLocation()
  const meetingManager: MeetingManager = useMeetingManager()

  useAsyncEffect(async () => {
    if (location.pathname.includes(getString('meeting'))) {
      return async () => {
        await meetingManager.leave()
      }
    }
  }, [location.pathname])

  useEffect(() => {
    const handler = (): void => {
      const isResizeDesktop: boolean = isDesktop()

      if (isDesktopView.current === isResizeDesktop) {
        return
      }

      isDesktopView.current = isResizeDesktop

      if (!isResizeDesktop) {
        setShowNavbar(false)
        setShowRoster(false)
      } else {
        setShowNavbar(true)
      }
    }

    window.addEventListener('resize', handler)

    return () => window.removeEventListener('resize', handler)
  }, [])

  const toggleRoster = (): void => {
    setShowRoster(!showRoster)
  }

  const toggleNavbar = (): void => {
    setShowNavbar(!showNavbar)
  }

  const openNavbar = (): void => {
    setShowNavbar(true)
  }

  const closeNavbar = (): void => {
    setShowNavbar(false)
  }

  const openRoster = (): void => {
    setShowRoster(true)
  }

  const closeRoster = (): void => {
    setShowRoster(false)
  }

  const providerValue = {
    showNavbar,
    showRoster,
    toggleRoster,
    toggleNavbar,
    openRoster,
    closeRoster,
    openNavbar,
    closeNavbar,
  }

  return (
    <NavigationContext.Provider value={providerValue}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext)

  if (!context) {
    throw new Error(getString('meeting-usenavigation-error'))
  }

  return context
}
