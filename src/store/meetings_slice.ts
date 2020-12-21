import { createAsyncThunk, createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { setToastError } from 'globalid-react-ui'
import { CREATE_MEETING, FETCH_MEETING } from '../constants'
import { createMeeting, getMeeting } from '../services/api'
import { MeetingResponse } from '../services/api/interfaces'
import { getString } from '../utils'
import {
  CreateMeetingError,
  CreateMeetingParams,
  FulfilledAction,
  GetMeetingParams,
  KeyValuePayload,
  MeetingsSlice,
  RejectedAction,
  ThunkAPI,
} from './interfaces'

const initialState: MeetingsSlice = {
  isFetching: {},
  meetings: {},
}

export const initiateMeeting = createAsyncThunk<MeetingResponse, CreateMeetingParams, ThunkAPI>(
  'meetings/initiateMeeting',
  async (
    { channelId }: CreateMeetingParams,
    { dispatch, getState }
  ): Promise<MeetingResponse> => {
    const meeting: MeetingResponse | undefined = getState().meetings.meetings[channelId]

    if (meeting) {
      return meeting
    }

    dispatch(setIsFetching({
      key: `${channelId}${CREATE_MEETING}`,
      value: true,
    }))

    try {
      const result: MeetingResponse = await createMeeting(channelId)

      return result
    } catch (err) {
      const errorTitle: string = err.response?.data.error_code === CreateMeetingError.ERR_TOO_MANY_CALLS
        ? getString('too-many-meetings-created-title')
        : getString('create-meeting-failure-title')

      const errorDescription: string = err.response?.data.error_code === CreateMeetingError.ERR_TOO_MANY_CALLS
        ? getString('too-many-meetings-created-description')
        : getString('something-went-wrong')

      dispatch(setToastError({
        title: errorTitle,
        message: errorDescription,
      }))

      throw err
    }
  },
  {
    condition: (
      { channelId }: CreateMeetingParams,
      { getState }
    ) => {
      const meetingsState: MeetingsSlice = getState().meetings
      const isFetching: boolean | undefined = meetingsState.isFetching[`${channelId}${CREATE_MEETING}`]

      return !isFetching
    },
  }
)

export const fetchMeeting = createAsyncThunk<MeetingResponse, GetMeetingParams, ThunkAPI>(
  'meetings/fetchMeeting',
  async (
    params: GetMeetingParams,
    { dispatch }
  ): Promise<MeetingResponse> => {
    dispatch(setIsFetching({
      key: `${params.meetingId}${FETCH_MEETING}`,
      value: true,
    }))

    try {
      const response: MeetingResponse = await getMeeting(params.meetingId, params.channelId)

      return response
    } catch (err) {
      dispatch(setToastError({
        title: getString('join-meeting-failure-title'),
        message: getString('something-went-wrong'),
      }))

      throw err
    }
  },
  {
    condition: (
      { meetingId }:GetMeetingParams,
      { getState }
    ) => {
      const meetingsState: MeetingsSlice = getState().meetings
      const isFetching: boolean | undefined = meetingsState.isFetching[`${meetingId}${FETCH_MEETING}`]

      return !isFetching && meetingsState.meetings[meetingId] === undefined
    },
  }
)

const meetingsSlice: Slice<MeetingsSlice> = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    setIsFetching (state: MeetingsSlice, action: PayloadAction<KeyValuePayload<boolean>>) {
      state.isFetching[action.payload.key] = action.payload.value
    },
    setMeeting (state: MeetingsSlice, action: PayloadAction<KeyValuePayload<MeetingResponse>>) {
      state.meetings[action.payload.key] = action.payload.value
    },
  },
  extraReducers: {
    [initiateMeeting.fulfilled.type]: (
      state: MeetingsSlice,
      action: FulfilledAction<MeetingResponse, CreateMeetingParams>
    ): void => {
      const params: CreateMeetingParams = action.meta.arg
      const meetingDetails: MeetingResponse = action.payload

      if (meetingDetails.meetingId !== null) {
        state.meetings[meetingDetails.meetingId] = action.payload
      }

      state.isFetching[`${params.channelId}${CREATE_MEETING}`] = false
    },
    [initiateMeeting.rejected.type]: (
      state: MeetingsSlice,
      action: RejectedAction<CreateMeetingParams>
    ): void => {
      const params: CreateMeetingParams = action.meta.arg

      state.isFetching[`${params.channelId}${CREATE_MEETING}`] = false
    },
    [fetchMeeting.fulfilled.type]: (
      state: MeetingsSlice,
      action: FulfilledAction<MeetingResponse, GetMeetingParams>
    ): void => {
      const params: GetMeetingParams = action.meta.arg
      const meetingDetails: MeetingResponse = action.payload

      if (meetingDetails.meetingId !== null) {
        state.meetings[meetingDetails.meetingId] = action.payload
      }

      state.isFetching[`${params.meetingId}${FETCH_MEETING}`] = false
    },
    [fetchMeeting.rejected.type]: (
      state: MeetingsSlice,
      action: RejectedAction<GetMeetingParams>
    ): void => {
      const params: GetMeetingParams = action.meta.arg

      state.isFetching[`${params.meetingId}${FETCH_MEETING}`] = false
    },
  },
})

export const {
  setIsFetching,
  setMeeting,
  setMeetingId,
} = meetingsSlice.actions

export default meetingsSlice.reducer
