import { store } from '../store'
import { setMeeting } from '../store/meetings_slice'
import { attendeeMock, getMeetingResponseMock, joinInfoMock, meetingMock } from '../../tests/mocks/meetings_mocks'
import * as messagingApi from '../services/api/messaging_api'
import * as identitiesApi from '../services/api/identities_api'
import {
  fetchMeeting,
  getAttendee,
  handleMeetingEnd,
  handleNoMeeting,
} from './meeting_utils'
import { publicIdentityMock } from '../../tests/mocks/identity_mock'
import { setIdentity } from '../store/identity_slice'

jest.mock('../services/api/messaging_api')

describe('Meeting utils', () => {
  const getMeetingMock: jest.Mock = jest.fn()
  const getIdentityPublicMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (<jest.Mock>messagingApi.getMeeting) = getMeetingMock.mockResolvedValue(getMeetingResponseMock);
    (<jest.Mock>identitiesApi.getIdentityPublic) = getIdentityPublicMock.mockResolvedValue(publicIdentityMock)

    store.dispatch(setMeeting({
      key: meetingMock.meetingId,
      value: meetingMock,
    }))
  })

  describe('fetchMeeting', () => {
    it('should return meeting response', async () => {
      expect(await fetchMeeting(store)(<string>meetingMock.meetingId, 'channel_id')).toStrictEqual(joinInfoMock)
    })

    it('should return fetch and return meeting response when its not in store', async () => {
      store.dispatch(setMeeting({
        key: meetingMock.meetingId,
        value: undefined,
      }))

      expect(await fetchMeeting(store)(<string>meetingMock.meetingId, 'channel_id')).toStrictEqual(
        {...joinInfoMock, attendee: attendeeMock }
      )
      expect(getMeetingMock).toHaveBeenCalledWith(meetingMock.meetingId, 'channel_id')
    })

    it('should return throw an error when fetching fails', async () => {
      getMeetingMock.mockRejectedValue('ERR')
      store.dispatch(setMeeting({
        key: meetingMock.meetingId,
        value: undefined,
      }))

      await expect(fetchMeeting(store)(<string>meetingMock.meetingId, meetingMock.mediaRegion)).rejects.toThrow('ERR')
    })
  })

  describe('getAttendee', () => {
    it('should fetch and return attendee name', async () => {
      expect(await getAttendee(store)('', publicIdentityMock.gid_uuid)).toEqual({ name: publicIdentityMock.gid_name })
      expect(getIdentityPublicMock).toHaveBeenCalledWith({ gid_uuid: publicIdentityMock.gid_uuid })
    })

    it('should return attendee name', async () => {
      store.dispatch(setIdentity(publicIdentityMock))

      expect(await getAttendee(store)('', publicIdentityMock.gid_uuid)).toStrictEqual({ name: publicIdentityMock.gid_name })
    })
  })

  describe('handleMeetingEnd and handleNoMeeting', () => {
    const closeMock: jest.Mock = jest.fn()

    jest.useFakeTimers()

    beforeAll(() => {
      window.open = () => ({
        close: closeMock,
      })
    })

    it('should call close function on window.open when handleNoMeetingRedirect and handleEndMeetingRedirect are called', () => {
      handleMeetingEnd()
      handleNoMeeting()
      jest.runOnlyPendingTimers()
      expect(closeMock).toHaveBeenCalledTimes(2)
    })
  })
})
