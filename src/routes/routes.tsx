import _ from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { RootState } from 'RootType'
import { MainLayout, RouteWithLayout } from '../components'
import { Auth } from '../components/auth/auth'
import { useIsMobileOrTabletView } from '../components/global/helpers'
import { Messages } from '../components/messages'
import { PageNotFound } from '../components/not_found_pages'
import { APP_PUBLIC_URL } from '../constants'
import { LastVisitedFolderState } from '../store/interfaces'
import { getBaseUrlFromEnv, getLastVisitedMessagesUrl, getString } from '../utils'
import { RedirectOnSignOut } from '../utils/interfaces'
import {
  fetchMeeting,
  getAttendee,
  handleMeetingEnd,
  handleNoMeeting,
} from '../utils/meeting_utils'
import { Meetings } from '../components/meetings'
import { store } from '../store'

const getDefaultRedirectForEnv = (): JSX.Element | undefined =>
  !_.isEmpty(APP_PUBLIC_URL) && !_.isNil(APP_PUBLIC_URL) ? undefined : <Redirect from='/' to='/app/login' />

export const Routes = (): JSX.Element => {
  const baseUrl: string = getBaseUrlFromEnv()

  const isMobileOrTablet: boolean = useIsMobileOrTabletView()

  const lastVisitedFolder: LastVisitedFolderState = useSelector((state: RootState) => state.channels.lastVisitedFolder)

  return <BrowserRouter basename={baseUrl}>
    <Switch>
      <Route component={Auth} exact path='/app/login'/>

      <RouteWithLayout
        component={Messages}
        isPrivate
        redirectOnSignOut={RedirectOnSignOut.LOGIN}
        exact
        layout={MainLayout}
        layoutProps={{
          headerTitle: getString('messages-title'),
          headerFullwidth: isMobileOrTablet,
        }}
        path='/app/messages/:type(t|m)/:channelId?'
      />

      <Route path={'/app/messages/:channelId?/meetings/:meetingId?'}>
        <Meetings
          handleMeetingRequest={fetchMeeting(store)}
          onNoMeetingRedirect={handleNoMeeting}
          getAttendeeCallback={getAttendee(store)}
          onMeetingEnd={handleMeetingEnd}
        />
      </Route>
      <RouteWithLayout
        component={PageNotFound}
        exact
        layout={MainLayout}
        path='/page_not_found'
      />
      <Redirect
        from='/app/messages'
        to={getLastVisitedMessagesUrl(lastVisitedFolder)}
      />
      <Redirect from='/:any/:any' to='/page_not_found'/>

      {getDefaultRedirectForEnv()}
      <Redirect to='/page_not_found'/>
    </Switch>
  </BrowserRouter>
}
