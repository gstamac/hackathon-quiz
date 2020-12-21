import { Middleware } from '@reduxjs/toolkit'
import configureStore from 'redux-mock-store'
import meetingsReducer, { fetchMeeting, initiateMeeting, setIsFetching } from './meetings_slice'
import thunk from 'redux-thunk'
import { CreateMeetingAction, FetchMeetingAction, MeetingsSlice } from './interfaces'
import * as messagingApi from '../services/api/messaging_api'
import { ThunkDispatch } from './store'
import { attendeeMock, getMeetingResponseMock, meetingMock } from '../../tests/mocks/meetings_mocks'
import { setToastError } from 'globalid-react-ui'
import { getString } from '../utils'

interface StoreType {
  meetings: ReturnType<typeof meetingsReducer>
}

const middlewares: Middleware[] = [thunk]
const mockStore = configureStore<StoreType, ThunkDispatch>(middlewares)

jest.mock('../services/api/messaging_api')

describe('Meetings reducer', () => {
  const createMeetingMock: jest.Mock = jest.fn()
  const getMeetingMock: jest.Mock = jest.fn()

  const initialState: MeetingsSlice = {
    isFetching: {},
    meetings: {},
  }

  beforeAll(() => {
    (<jest.Mock>messagingApi.createMeeting) = createMeetingMock;
    (<jest.Mock>messagingApi.getMeeting) = getMeetingMock
  })

  it('returns the initial state correctly', () => {
    const reducer = meetingsReducer(undefined, { type: undefined })

    expect(reducer).toEqual(initialState)
  })

  describe('initiateMeeting', () => {

    it('executes actions and update state upon successfully creating a new meeting', async () => {
      createMeetingMock.mockResolvedValue(meetingMock)

      const store = mockStore({
        meetings: initialState,
      })

      const finalAction: CreateMeetingAction = await store.dispatch(initiateMeeting({ channelId: 'channel_id' }))

      expect(createMeetingMock).toHaveBeenCalled()

      const actions = store.getActions()

      expect(actions[0].type).toEqual(initiateMeeting.pending.type)
      expect(actions[1].type).toEqual(setIsFetching.type)
      expect(actions[2].type).toEqual(initiateMeeting.fulfilled.type)

      const reducer: MeetingsSlice = meetingsReducer(store.getState().meetings, finalAction)

      expect(reducer).toEqual({
        ...initialState,
        meetings: {
          'meeting_id': meetingMock,
        },
        isFetching: {
          'channel_idCREATE_MEETING': false,
        },
      })
    })

    it('executes actions and state remains upon failing to create meeting', async () => {
      createMeetingMock.mockRejectedValue({})

      const store = mockStore({
        meetings: initialState,
      })

      const finalAction: CreateMeetingAction = await store.dispatch(initiateMeeting({ channelId: 'channel_id' }))

      expect(createMeetingMock).toHaveBeenCalled()

      const actions = store.getActions()

      expect(actions[0].type).toEqual(initiateMeeting.pending.type)
      expect(actions[1].type).toEqual(setIsFetching.type)
      expect(actions[2].type).toEqual(setToastError.type)
      expect(actions[2].payload).toEqual({
        title: getString('create-meeting-failure-title'),
        message: getString('something-went-wrong'),
      })
      expect(actions[3].type).toEqual(initiateMeeting.rejected.type)

      const reducer: MeetingsSlice = meetingsReducer(store.getState().meetings, finalAction)

      expect(reducer).toEqual({
        ...initialState,
        isFetching: {
          'channel_idCREATE_MEETING': false,
        },
      })
    })
  })

  describe('fetchMeeting', () => {

    it('executes actions and update state upon successfully fetching meeting', async () => {
      getMeetingMock.mockResolvedValue(getMeetingResponseMock)

      const store = mockStore({
        meetings: initialState,
      })

      const finalAction: FetchMeetingAction = await store.dispatch(fetchMeeting({ meetingId: `${meetingMock.meetingId}` }))

      expect(getMeetingMock).toHaveBeenCalled()

      const actions = store.getActions()

      expect(actions[0].type).toEqual(fetchMeeting.pending.type)
      expect(actions[1].type).toEqual(setIsFetching.type)
      expect(actions[2].type).toEqual(fetchMeeting.fulfilled.type)

      const reducer: MeetingsSlice = meetingsReducer(store.getState().meetings, finalAction)

      expect(reducer).toEqual({
        ...initialState,
        meetings: {
          'meeting_id': {
            ...meetingMock,
            attendee: {
              ...attendeeMock,
            },
          },
        },
        isFetching: {
          'meeting_idFETCH_MEETING': false,
        },
      })
    })

    it('executes actions and state remains upon failing to fetch meeting', async () => {
      getMeetingMock.mockRejectedValue({})

      const store = mockStore({
        meetings: initialState,
      })

      const finalAction: FetchMeetingAction = await store.dispatch(fetchMeeting({ meetingId: `${meetingMock.meetingId}` }))

      expect(getMeetingMock).toHaveBeenCalled()

      const actions = store.getActions()

      expect(actions[0].type).toEqual(fetchMeeting.pending.type)
      expect(actions[1].type).toEqual(setIsFetching.type)
      expect(actions[2].type).toEqual(setToastError.type)
      expect(actions[2].payload).toEqual({
        title: getString('join-meeting-failure-title'),
        message: getString('something-went-wrong'),
      })
      expect(actions[3].type).toEqual(fetchMeeting.rejected.type)

      const reducer: MeetingsSlice = meetingsReducer(store.getState().meetings, finalAction)

      expect(reducer).toEqual({
        ...initialState,
        isFetching: {
          'meeting_idFETCH_MEETING': false,
        },
      })
    })
  })
})
