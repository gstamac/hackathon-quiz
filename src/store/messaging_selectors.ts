import { BlockedUser } from '@globalid/messaging-service-sdk'
import {
  FetchBlockedUsersParameters,
  FetchStatus,
  GidUUID,
} from './interfaces'
import { RootState } from 'RootType'

export const createKeyFromBlockedUsersParameters = (props: FetchBlockedUsersParameters): string => (
  `${props.page ?? 1}`
)

export const getBlockedUserByGidUUID = (state: RootState, gidUuid: GidUUID): BlockedUser | undefined => (
  state.messaging.blockedUsers[gidUuid]
)

export const isBlockedUsersFetchInProgress = (
  state: RootState,
): boolean => {
  const fetchStatusArray = Object.values(state.messaging.blockedUsersFetchStatusByParameters)

  return fetchStatusArray.some((status: FetchStatus | undefined) => status === undefined || status === FetchStatus.PENDING)
}

export const getBlockedUsersFetchStatusByParameters = (
  state: RootState,
  parameters: FetchBlockedUsersParameters
): FetchStatus | undefined => {
  const key: string = createKeyFromBlockedUsersParameters(parameters)

  return state.messaging.blockedUsersFetchStatusByParameters[key]
}
