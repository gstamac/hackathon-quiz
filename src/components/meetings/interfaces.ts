import { AttendeeResponse } from 'amazon-chime-sdk-component-library-react/lib/providers/MeetingProvider/types'

export interface MeetingsProps {
  onNoMeetingRedirect: () => void
  handleMeetingRequest: (meetingId: string, channelId: string) => Promise<JoinInfo>
  getAttendeeCallback: (chimeAttendeeId: string, externalUserId?: string) => Promise<AttendeeResponse>
  onMeetingEnd: Fn<void>
}

export interface JoinInfo {
  meeting: {
    ExternalMeetingId: string | null
    MediaPlacement: {
      AudioFallbackUrl: string
      AudioHostUrl: string
      ScreenDataUrl: string
      ScreenSharingUrl: string
      ScreenViewingUrl: string
      SignalingUrl: string
      TurnControlUrl: string
    }
    MediaRegion: string
    MeetingId: string
    Title: string
  }
  attendee: {
    ExternalUserId?: string
    AttendeeId?: string
    JoinToken?: string
  }
}

export type MeetingEndCallback = { onMeetingEnd: Fn<void> }
