import React from 'react'
import { NotificationProvider, MeetingProvider} from 'amazon-chime-sdk-component-library-react'
import { AppStateProvider } from './providers/app_state_provider'
import { NavigationProvider } from './providers/navigation_provider'
import { ErrorProvider } from './providers/error_provider'
import { MeetingsProps } from './interfaces'
import { Notifications } from './containers/notifications'
import { NoMeetingRedirect } from './containers/no_meeting_redirect'
import { Theme } from './theme'
import { MeetingHandler } from './containers/meeting_handler'

export const Meetings: React.FC<MeetingsProps> = (props: MeetingsProps) => (
  <AppStateProvider>
    <Theme>
      <NotificationProvider>
        <Notifications />
        <ErrorProvider>
          <MeetingProvider>
            <NavigationProvider>
              <NoMeetingRedirect {...props}>
                <MeetingHandler {...props} />
              </NoMeetingRedirect>
            </NavigationProvider>
          </MeetingProvider>
        </ErrorProvider>
      </NotificationProvider>
    </Theme>
  </AppStateProvider>
)
