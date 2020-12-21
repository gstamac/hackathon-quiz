import {
  Identity,
  PaginationMetaParams,
} from '@globalid/identity-namespace-service-sdk'
import {
  FetchIdentitiesParameters,
  FetchStatus,
  GidName,
  GidUUID,
  IdentitiesLookupResult,
} from './interfaces'
import { RootState } from 'RootType'

export const createKeyFromIdentitiesParameters = (parameters: FetchIdentitiesParameters): string => (
  `${parameters.text}_${parameters.page}`
)

export const getIdentitiesByText = (state: RootState, text: string = ''): Identity[] => {
  if (text.length > 0) {
    const result: IdentitiesLookupResult | undefined = state.identities.search[text]

    if (result !== undefined) {
      return result.entries.reduce<Identity[]>((identities: Identity[], gidUuid: GidUUID): Identity[] => {
        const identity: Identity | undefined = getIdentityByGidUUID(state, gidUuid)

        if (identity !== undefined) {
          identities.push(identity)
        }

        return identities
      }, [])
    }
  }

  return []
}

export const getIdentitiesPaginationMetaByText = (state: RootState, text: string = ''): PaginationMetaParams | undefined => {
  if (text.length > 0) {
    const result: IdentitiesLookupResult | undefined = state.identities.search[text]

    if (result !== undefined) {
      return result.meta
    }
  }
}

export const getIdentityByGidName = (state: RootState, gidName: GidName): Identity | undefined => (
  (Object.values(state.identities.identities)).find((identity: Identity | undefined) => (
    identity && identity.gid_name.toUpperCase() === gidName.toUpperCase()
  ))
)

export const getIdentityByGidUUID = (state: RootState, gidUuid: GidUUID): Identity | undefined => (
  state.identities.identities[gidUuid]
)

export const getIdentityFetchStatusByGidName = (state: RootState, gidName: GidName): FetchStatus | undefined => (
  state.identities.fetchStatusByGidName[gidName]
)

export const getIdentityFetchStatusByGidUUID = (state: RootState, gidUuid: GidUUID): FetchStatus | undefined => (
  state.identities.fetchStatusByGidUUID[gidUuid]
)

export const getIdentityFetchStatusByParameters = (
  state: RootState,
  parameters: FetchIdentitiesParameters
): FetchStatus | undefined => {
  const key: string = createKeyFromIdentitiesParameters(parameters)

  return state.identities.fetchStatusByParameters[key]
}
