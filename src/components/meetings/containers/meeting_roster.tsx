/* eslint-disable unicorn/filename-case */
// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, ChangeEvent } from 'react'
import { useNavigation } from '../providers/navigation_provider'
import { RosterAttendeeType } from 'amazon-chime-sdk-component-library-react/lib/types'
import { getString } from '../../../utils'
import {
  Roster,
  RosterHeader,
  RosterGroup,
  useRosterState,
  RosterAttendee,
} from 'amazon-chime-sdk-component-library-react'
import { NavigationContextType, RosterContextValue } from '../providers/interfaces'

export const MeetingRoster: React.FC = () => {
  const { roster }: RosterContextValue = useRosterState()
  const [filter, setFilter] = useState<string>('')
  const { closeRoster }: NavigationContextType = useNavigation()

  let attendees: RosterAttendeeType[] = Object.values(roster)

  if (filter) {
    attendees = attendees.filter(attendee =>
      attendee?.name?.toLowerCase().includes(filter.trim().toLowerCase())
    )
  }

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    setFilter(e.target.value)
  }

  const attendeeItems: JSX.Element[] = attendees.map(attendee => {
    const { chimeAttendeeId } = attendee || {}

    return (
      <RosterAttendee key={chimeAttendeeId} attendeeId={chimeAttendeeId} />
    )
  })

  return (
    <Roster className='roster'>
      <RosterHeader
        searchValue={filter}
        onSearch={handleSearch}
        onClose={closeRoster}
        title={getString('meeting-present')}
        badge={attendees.length}
      />
      <RosterGroup>{attendeeItems}</RosterGroup>
    </Roster>
  )
}
