import { AsyncThunkReturnAction, GetMeetingParams } from './../store/interfaces'
import { Identity } from '@globalid/identity-namespace-service-sdk'
import { AttendeeResponse } from 'amazon-chime-sdk-component-library-react/lib/providers/MeetingProvider/types'
import { ThunkAPI} from 'RootType'
import { JoinInfo } from '../components/meetings/interfaces'
import { MeetingResponse } from '../services/api/interfaces'
import { fetchIdentityByGidUUID } from '../store/identities_slice'
import { fetchMeeting as fetchMeetingThunk } from '../store/meetings_slice'
import { TIME_TILL_REDIRECT } from '../constants'

export const fetchMeeting = ({ getState, dispatch }: ThunkAPI) => async (
  meetingId: string,
  channelId: string
): Promise<JoinInfo> => {
  let meeting: MeetingResponse | undefined = getState().meetings.meetings[meetingId]

  if (meeting === undefined) {
    const result: AsyncThunkReturnAction<MeetingResponse, GetMeetingParams> =
        await dispatch(fetchMeetingThunk({ meetingId, channelId }))

    if (result.type !== fetchMeetingThunk.fulfilled.type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error((<any>result).error.message)
    }

    meeting = <MeetingResponse> result.payload
  }

  if (meeting.mediaPlacement === null) {
    throw new Error('MEETING_ERROR')
  }

  return {
    meeting: {
      ExternalMeetingId: null,
      MediaPlacement: Object.assign(meeting.mediaPlacement),
      MediaRegion: meeting.mediaRegion,
      MeetingId: meetingId,
      Title: meetingId,
    },
    attendee: meeting.attendee,
  }
}

export const getAttendee = ({
  getState,
  dispatch,
}: ThunkAPI) => async (
  _chimeAttendeeId: string,
  externalUserId?: string
): Promise<AttendeeResponse> => {
  const attendeeId: string = externalUserId ? externalUserId : ''

  const attendeeName: string | undefined = getState().identities.identities[attendeeId]?.gid_name

  if (attendeeName === undefined) {
    const result: Identity = <Identity>(await dispatch(fetchIdentityByGidUUID(attendeeId))).payload

    return {
      name: result.gid_name,
    }
  }

  return {
    name: attendeeName,
  }
}

export const handleMeetingEnd = (): void => {
  window.open('','_self')?.close()
}

export const handleNoMeeting = (): void => {
  setTimeout(handleMeetingEnd, TIME_TILL_REDIRECT)
}
