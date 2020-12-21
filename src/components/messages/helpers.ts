import { MessageContext } from './messenger_chat/chat_message_cards/interfaces'
import { createConversation } from './../../utils/channel_helpers'
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  isToday,
  isWithinInterval,
  isYesterday,
  lastDayOfYear,
  parseISO,
  isThisYear,
  startOfYear,
} from 'date-fns'
import { MessageTemplateText, Folder } from '@globalid/messaging-service-sdk'
import {
  DATE_FORMAT_HOURS,
  MINS,
  DATE_FORMAT_WEEK_DAY_SHORT,
  TIMESTAMP_DATE_FORMAT,
  TIMESTAMP_FULL_DATE_FORMAT,
  TIMESTAMP_TIME_FORMAT,
  DATE_FORMAT_MONTH,
  DATE_FORMAT_YEAR,
  NOW,
  KEEP_POOLING_CONSENT_NOT_APPROVED_YET,
} from '../../constants'
import { getString, removeConsentUuid, getConsentUuid, navigateToChannelPage } from '../../utils'
import { EncryptionStatus, MessagesType } from './interfaces'
import { ConsentStatus } from '../../services/api/interfaces'
import { consentPolling } from '../../services/api/consent_api'
import { ConsentRequest } from '@globalid/consent-types'
import { deviceKeyManager } from '../../init'
import { MyDevicesInfoResponse } from '@globalid/keystore-service-sdk'
import { getMyDevices } from '../../services/api/keystore_api'
import { setToastError } from 'globalid-react-ui'
import { Dispatch } from '@reduxjs/toolkit'
import { ThunkDispatch } from '../../store'
import { History } from 'history'
import { Identity, PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { GroupMemberWithIdentityFields } from '../../store/interfaces'
import { GroupResponse, Member } from '@globalid/group-service-sdk'

export const parseMessageContent = (content: string): MessageTemplateText => JSON.parse(content)

export const getFormattedDate = (createdDate: string | undefined): string | null => {
  if (!createdDate) {
    return null
  }

  const providedDate: Date = new Date(createdDate)
  const currentDate: Date = new Date()

  const minutes: number = differenceInMinutes(currentDate, providedDate)
  const messageHoursTimeDiff: number = differenceInHours(currentDate, providedDate)

  if (minutes < 1) {
    return NOW
  }

  if (messageHoursTimeDiff === 0) {
    return `${minutes}${MINS}`
  }
  const today: boolean = isToday(providedDate)

  if (messageHoursTimeDiff <= 12 && today) {
    return format(providedDate, DATE_FORMAT_HOURS)
  }

  const lessThenSevenDays: number = differenceInDays(currentDate, providedDate)

  if (lessThenSevenDays <= 7) {
    return format(providedDate, DATE_FORMAT_WEEK_DAY_SHORT)
  }

  const monthLastDay: Date = lastDayOfYear(currentDate)
  const monthFirstDay: Date = startOfYear(currentDate)
  const isInCurrentYear: boolean = isWithinInterval(providedDate, { start: monthFirstDay, end: monthLastDay })

  if (isInCurrentYear) {
    return format(providedDate, DATE_FORMAT_MONTH)
  }

  return format(providedDate, DATE_FORMAT_YEAR)
}

export const getTimestampDate = (dateString: string): string => {
  const date: Date = new Date(dateString)

  const yesterday: boolean = isYesterday(date)
  const today: boolean = isToday(date)

  if (yesterday) {
    return getString('yesterday')
  }

  if (today) {
    return getString('today')
  }

  const thisYear: boolean = isThisYear(date)

  if (!thisYear) {
    return format(parseISO(dateString), TIMESTAMP_FULL_DATE_FORMAT)
  }

  return format(parseISO(dateString), TIMESTAMP_DATE_FORMAT)
}

export const getFormattedFullDateTimestamp = (dateString: string): string => {

  const timestampDate: string = getTimestampDate(dateString)
  const timestampTime: string = format(parseISO(dateString), TIMESTAMP_TIME_FORMAT).replace('AM', 'am').replace('PM', 'pm')

  return `${timestampDate}, ${timestampTime}`
}

export const initializeDeviceKeyManager = async (): Promise<void> => {
  await deviceKeyManager.init()
}

export const statusMatcher = (currentStatus: EncryptionStatus, statusArray: EncryptionStatus[]): boolean =>
  statusArray.some((status: EncryptionStatus) => status === currentStatus)

const waitForConsentStatus = async (dispatch: Dispatch): Promise<ConsentStatus | undefined> => {
  try {
    return await consentPolling()
  } catch (error) {
    if ((<Error>error).message === KEEP_POOLING_CONSENT_NOT_APPROVED_YET) {
      dispatch(setToastError({
        title: getString('notification-request-error-title'),
        message: getString('something-went-wrong'),
      }))
    }
  }
}

export const handleConsentFromCookie = async (dispatch: Dispatch): Promise<EncryptionStatus> => {
  const consentStatus: ConsentStatus | undefined = await waitForConsentStatus(dispatch)

  removeConsentUuid()

  if (consentStatus?.status === ConsentRequest.ConsentStatus.completed) {
    await deviceKeyManager.enableEncryption()

    return EncryptionStatus.ENABLED
  }

  return EncryptionStatus.DISABLED
}

export const checkEncryptionAllowedDevices = async (): Promise<EncryptionStatus | null> => {
  const consentUuid: string | null = getConsentUuid()

  if (consentUuid !== null) {

    return EncryptionStatus.POLLING
  }

  const deviceId: string | undefined = deviceKeyManager.getDeviceId()

  if (deviceId !== undefined) {
    const myDevices: MyDevicesInfoResponse[] = await getMyDevices()

    const encryptionEnabled: boolean = await deviceKeyManager.isEncryptionEnabled(myDevices)

    if (encryptionEnabled) {
      return EncryptionStatus.ENABLED
    }
  }

  return null
}

export const handleClickToSendMessageButton = async (
  dispatch: ThunkDispatch,
  history: History,
  identity: PublicIdentity | Identity,
  loggedInIdentity: PublicIdentity | Identity,
  folders: Folder[],
  isMobileOrTablet: boolean,
): Promise<void> => {

  const devicesStatus: EncryptionStatus | null = await checkEncryptionAllowedDevices()

  if (devicesStatus === null || devicesStatus !== EncryptionStatus.ENABLED) {
    if (!isMobileOrTablet) {
      dispatch(setToastError({
        title: getString('chat-open-disabled-encryption-error-title'),
        message: getString('chat-open-disabled-encryption-error-message'),
      }))
    }

    return navigateToChannelPage(history, MessagesType.PRIMARY, '')
  }

  await createConversation(
    [identity.gid_uuid],
    loggedInIdentity.gid_uuid,
    folders,
    dispatch,
    history,
    { currentPath: history.location.pathname }
  )
}

export const disableCreateChannelButton = (
  group: GroupResponse | undefined,
  members: GroupMemberWithIdentityFields[] | undefined,
  isHidden: boolean | undefined,
  loggedInUser: string | undefined,
): boolean => {

  const groupNotSelected: boolean = group === undefined
  const memberVisibilityHidden: boolean =
    group?.member_visibility === Member.MemberVisibility.hidden && loggedInUser !== group.owner_uuid
  const loggedInUserOnlyMember: boolean = members?.length === 1
  const loggedInUserHidden: boolean = isHidden ?? false

  return groupNotSelected || memberVisibilityHidden || loggedInUserOnlyMember || loggedInUserHidden
}

export const isMessageAuthor = (
  identity: PublicIdentity,
  messageContext: MessageContext
): boolean => identity.gid_uuid === messageContext.message.author
