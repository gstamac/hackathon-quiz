import {
  getFormattedDate,
  getTimestampDate,
  getFormattedFullDateTimestamp,
  statusMatcher,
  handleConsentFromCookie,
  checkEncryptionAllowedDevices,
  initializeDeviceKeyManager,
  handleClickToSendMessageButton,
  disableCreateChannelButton,
} from './helpers'
import {
  NOW,
  DATE_FORMAT_YEAR,
  DATE_FORMAT_MONTH,
  DATE_FORMAT_HOURS,
  MINS,
  TIMESTAMP_DATE_FORMAT,
  TIMESTAMP_FULL_DATE_FORMAT,
  TIMESTAMP_TIME_FORMAT,
} from '../../constants'
import { subMinutes, subHours, format, subDays, subYears } from 'date-fns'
import MockDate from 'mockdate'
import { EncryptionStatus } from './interfaces'
import * as consent_api from '../../services/api/consent_api'
import * as keystoreApi from '../../services/api/keystore_api'
import { approvedConsentStatusMock, declinedConsentStatusMock } from '../../../tests/mocks/consent_mock'
import { deviceKeyManager } from '../../init'
import { setConsentUuid, removeConsentUuid } from '../../utils'
import { deviceMock } from '../../../tests/mocks/keystore_mock'
import * as channel_helpers from '../../utils/channel_helpers'
import { store, history } from '../../store'
import { identityMock } from '../../../tests/mocks/identity_mock'
import * as channelsApi from '../../services/api/channels_api'
import { emptyChannelsResponseWithPaginationMetaMock, getChannelResponseMock } from '../../../tests/mocks/channels_mocks'
import { groupHiddenPrivacyMock, groupMemberWithIdentityFields, groupMock } from '../../../tests/mocks/group_mocks'
import { foldersMock } from '../../../tests/mocks/channels_mock'

jest.mock('../../services/api/keystore_api')
jest.mock('../../utils/channel_helpers')
jest.mock('../../services/api/contacts_api')

const consentPollingMock: jest.Mock = jest.fn()
const enableEncryptionMock: jest.Mock = jest.fn()
const isEncryptionEnabledMock: jest.Mock = jest.fn()
const getDeviceIdMock: jest.Mock = jest.fn()
const initMock: jest.Mock = jest.fn()
const createConversationMock: jest.Mock = jest.fn()
const getMyDevicesMock: jest.Mock = jest.fn()
const searchChannelsMock: jest.Mock = jest.fn()

describe('Helpers', () => {
  const currentDate = '2020-06-25T18:53:03.765Z'
  const dispatchMock: jest.Mock = jest.fn()

  beforeAll(() => {
    MockDate.set(currentDate);
    (<jest.Mock>consent_api.consentPolling) = consentPollingMock;
    (<jest.Mock>deviceKeyManager.enableEncryption) = enableEncryptionMock;
    (<jest.Mock>deviceKeyManager.getDeviceId) = getDeviceIdMock;
    (<jest.Mock>deviceKeyManager.isEncryptionEnabled) = isEncryptionEnabledMock;
    (<jest.Mock>deviceKeyManager.init) = initMock;
    (<jest.Mock>channel_helpers.createConversation) = createConversationMock;
    (<jest.Mock>keystoreApi.getMyDevices) = getMyDevicesMock;
    (<jest.Mock>channelsApi.searchChannels) = searchChannelsMock
  })

  beforeEach(() => {
    removeConsentUuid()
  })

  afterAll(() => {
    MockDate.reset()
  })

  describe('getLastMessageFormattedTime', () => {
    it(`should return ${NOW} when provided date difference in minutes with a new date less than a minute`, () => {
      expect(getFormattedDate(new Date().toString())).toEqual(NOW)
    })

    it('should return formatted date when provided date difference in hours with a new date less than a hour', () => {
      const date: Date = subMinutes(new Date(), 30)

      expect(getFormattedDate(date.toString())).toContain(MINS)
    })

    it('should return formatted date when provided date difference in hours with a new date more than a hour but less then 12 hours', () => {

      const date: Date = subHours(new Date(currentDate), 3)

      expect(getFormattedDate(date.toString())).toEqual(format(date, DATE_FORMAT_HOURS))
    })

    it.skip('should return formatted date when provided date is in current month', () => {
      const date: Date = subDays(new Date(currentDate), 7)

      expect(getFormattedDate(date.toString())).toEqual(format(date, DATE_FORMAT_MONTH))
    })

    it.skip('should return formatted date when provided date is in current year', () => {
      const date: Date = subDays(new Date(currentDate), 50)

      expect(getFormattedDate(date.toString())).toEqual(format(date, DATE_FORMAT_YEAR))
    })
  })

  describe('getTimestampDate', () => {
    it('should return today if the date is today', () => {
      expect(getTimestampDate(new Date(currentDate).toISOString())).toEqual('Today')
    })

    it('should return yesterday if the date is yesterday', () => {
      const date: Date = subDays(new Date(currentDate), 1)

      expect(getTimestampDate(date.toISOString())).toEqual('Yesterday')
    })

    it('should return date if the date is this year', () => {
      const date: Date = subDays(new Date(currentDate), 3)

      expect(getTimestampDate(date.toISOString())).toEqual(format(date, TIMESTAMP_DATE_FORMAT))
    })

    it('should return date if the date is not this year', () => {
      const date: Date = subYears(new Date(currentDate), 2)

      expect(getTimestampDate(date.toISOString())).toEqual(format(date, TIMESTAMP_FULL_DATE_FORMAT))
    })
  })

  describe('getFormattedFullDateTimestamp', () => {
    it('should formatted timestamp', () => {
      const date: Date = new Date(currentDate)

      expect(
        getFormattedFullDateTimestamp(date.toISOString())
      ).toEqual(
        `Today, ${format(date, TIMESTAMP_TIME_FORMAT).replace('AM', 'am').replace('PM', 'pm')}`
      )
    })
  })

  describe('handleConsentFromCookie', () => {
    it('should return status enabled when polled consent is approved', async () => {
      consentPollingMock.mockResolvedValue(approvedConsentStatusMock)

      expect(await handleConsentFromCookie(dispatchMock)).toEqual(EncryptionStatus.ENABLED)
      expect(enableEncryptionMock).toHaveBeenCalled()
    })

    it('should return status disabled when polled consent is not approved', async () => {
      consentPollingMock.mockResolvedValue(declinedConsentStatusMock)

      expect(await handleConsentFromCookie(dispatchMock)).toEqual(EncryptionStatus.DISABLED)
      expect(enableEncryptionMock).toHaveBeenCalled()
    })
  })

  describe('statusMatcher', () => {
    it('should return true when the provided status is in the array of statuses', () => {
      expect(statusMatcher(EncryptionStatus.DISABLED, [EncryptionStatus.DISABLED, EncryptionStatus.ENABLED])).toEqual(true)
    })

    it('should return false when the provided status is not in the array of statuses', () => {
      expect(statusMatcher(EncryptionStatus.DISABLED, [EncryptionStatus.ENABLED])).toEqual(false)
    })
  })

  describe('checkEncryptionAllowedDevices', () => {
    it('should return status POOLING when consent uuid is saved in cookie', async () => {
      setConsentUuid('test')

      expect(await checkEncryptionAllowedDevices()).toEqual(EncryptionStatus.POLLING)
    })

    it('should return null when deviceId is not set in the store', async () => {
      expect(await checkEncryptionAllowedDevices()).toBeNull()
    })

    it('should return status ENABLED when user has a device with enabled e2e encryption', async () => {
      getDeviceIdMock.mockReturnValue('deviceid')

      getMyDevicesMock.mockResolvedValue([deviceMock])

      isEncryptionEnabledMock.mockResolvedValue(true)

      expect(await checkEncryptionAllowedDevices()).toEqual(EncryptionStatus.ENABLED)
    })

    it('should return null when user has no devices with enabled e2e encryption', async () => {
      getDeviceIdMock.mockReturnValue('deviceid')

      getMyDevicesMock.mockResolvedValue([deviceMock])

      isEncryptionEnabledMock.mockResolvedValue(false)

      expect(await checkEncryptionAllowedDevices()).toBeNull()
    })
  })

  describe('initializeDeviceKeyManager', () => {
    it('should call initializing function for device key manager', async () => {
      await initializeDeviceKeyManager()

      expect(initMock).toHaveBeenCalled()
    })
  })

  describe('handleClickToSendMessageButton', () => {

    beforeEach(() => {
      getDeviceIdMock.mockReturnValue('test')
      createConversationMock.mockResolvedValue(getChannelResponseMock)
      getMyDevicesMock.mockResolvedValue([])
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should call createChannelWithUserDeviceSecrets if encryption is enabled and channel not yet defined', async () => {

      isEncryptionEnabledMock.mockResolvedValue(true)
      searchChannelsMock.mockResolvedValue(emptyChannelsResponseWithPaginationMetaMock)

      await handleClickToSendMessageButton(dispatchMock, history, identityMock, identityMock, foldersMock, false)

      expect(createConversationMock).toHaveBeenCalledTimes(1)
      expect(createConversationMock).toHaveBeenCalledWith(
        [identityMock.gid_uuid],
        identityMock.gid_uuid,
        foldersMock,
        dispatchMock,
        history,
        {currentPath: '/'}
      )
    })

    it('should not call createChannelWithUserDeviceSecrets if encryption is disabled', async () => {

      isEncryptionEnabledMock.mockResolvedValue(false)
      searchChannelsMock.mockResolvedValue(emptyChannelsResponseWithPaginationMetaMock)

      await handleClickToSendMessageButton(store.dispatch, history, identityMock, identityMock, foldersMock, false)

      expect(createConversationMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('disableCreateChannelButton', () => {
    it('should disable the create channel button when loggedIn user is the only member of the group', () => {
      const results: boolean =
        disableCreateChannelButton(groupMock, [groupMemberWithIdentityFields], false, 'gid_uuid')

      expect(results).toEqual(true)
    })

    it('should disable the create channel button when group has member visibility set to hidden', () => {
      const results: boolean = disableCreateChannelButton(
        groupHiddenPrivacyMock,
        [groupMemberWithIdentityFields, groupMemberWithIdentityFields],
        false,
        'gid_uuid',
      )

      expect(results).toEqual(true)
    })

    it('should not disable the create channel button when group has member visibility set to hidden and loggedIn user is the owner', () => {
      const results: boolean = disableCreateChannelButton(
        groupHiddenPrivacyMock,
        [groupMemberWithIdentityFields, groupMemberWithIdentityFields],
        false,
        groupHiddenPrivacyMock.owner_uuid,
      )

      expect(results).toEqual(false)
    })

    it('should disable the create channel button when member is hidden', () => {
      const results: boolean = disableCreateChannelButton(
        groupMock,
        [groupMemberWithIdentityFields, groupMemberWithIdentityFields],
        true,
        'gid_uuid',
      )

      expect(results).toEqual(true)
    })

    it('should not disable the create channel button', () => {
      const results: boolean = disableCreateChannelButton(
        groupMock,
        [groupMemberWithIdentityFields, groupMemberWithIdentityFields],
        false,
        'gid_uuid',
      )

      expect(results).toEqual(false)
    })
  })
})
