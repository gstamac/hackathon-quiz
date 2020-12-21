import { applyMiddleware, createStore, Dispatch, Action } from 'redux'
import { combineReducers } from '@reduxjs/toolkit'
import { default as thunk, ThunkDispatch as ThunkDispatchStore } from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'
import { createBrowserHistory, History } from 'history'
import { initFormStore, formSlice, toastSlice, qrWidgetSlice } from 'globalid-react-ui'

import identityReducer from './identity_slice'
import channelsReducer from './channels_slice/channels_slice'
import messagesReducer from './messages_slice'
import identitiesReducer from './identities_slice'
import messagingReducer from './messaging_slice'
import contactsReducer from './contacts_slice'
import groupsReducer from './groups_slice'
import imageReducer from './image_slice'
import countersReducer from './counters_slice'
import meetingsReducer from './meetings_slice'
import browserNotificationsReducer from './browser_notifications_slice'
import routeReducer from './route_slice'
import uiReducer from './ui_slice'
import { RootState } from 'RootType'

export const rootReducer = combineReducers({
  identity: identityReducer,
  identities: identitiesReducer,
  form: formSlice,
  qrWidget: qrWidgetSlice,
  toast: toastSlice,
  channels: channelsReducer,
  messages: messagesReducer,
  messaging: messagingReducer,
  contacts: contactsReducer,
  image: imageReducer,
  groups: groupsReducer,
  counters: countersReducer,
  meetings: meetingsReducer,
  browserNotifications: browserNotificationsReducer,
  routing: routeReducer,
  ui: uiReducer,
})

export const history: History = createBrowserHistory()

export const store = createStore(
  rootReducer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  composeWithDevTools(applyMiddleware<Dispatch<any>>(...[
    thunk,
  ])),
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThunkDispatch = ThunkDispatchStore<RootState, any, Action>

initFormStore(store)

