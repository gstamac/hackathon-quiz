// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'

import { useNavigation } from '../../providers/navigation_provider'
import { useAppState } from '../../providers/app_state_provider'
import { getString } from '../../../../utils'
import {
  AppStateValue,
  NavigationContextType } from '../../providers/interfaces'
import {
  Navbar,
  NavbarHeader,
  NavbarItem,
  Attendees,
  Eye,
} from 'amazon-chime-sdk-component-library-react'
import { Theme } from '../../enums'

export const Navigation: React.FC = () => {
  const { toggleRoster, closeNavbar }: NavigationContextType = useNavigation()
  const { theme, toggleTheme }: AppStateValue = useAppState()

  return (
    <Navbar className='nav' flexDirection='column' container>
      <NavbarHeader title={getString('meeting-navigation')} onClose={closeNavbar} />
      <NavbarItem
        icon={<Attendees />}
        onClick={toggleRoster}
        label={getString('meeting-attendees')}
      />
      <NavbarItem
        icon={<Eye />}
        onClick={toggleTheme}
        label={theme === Theme.LIGHT ? getString('dark-mode') : getString('light-mode')}
      />
    </Navbar>
  )
}
