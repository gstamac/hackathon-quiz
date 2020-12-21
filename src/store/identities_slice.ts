import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import {
  Identities,
  Identity,
  PaginationMetaParams,
} from '@globalid/identity-namespace-service-sdk'
import {
  getIdentitiesLookup,
  getIdentityPublic,
} from '../services/api'
import {
  createKeyFromIdentitiesParameters,
  getIdentitiesPaginationMetaByText,
  getIdentityByGidName,
  getIdentityByGidUUID,
  getIdentityFetchStatusByGidName,
  getIdentityFetchStatusByGidUUID,
  getIdentityFetchStatusByParameters,
} from './identities_selectors'
import {
  FetchIdentitiesParameters,
  FetchStatus,
  FulfilledAction,
  GidName,
  GidUUID,
  IdentitiesLookupResult,
  IdentitiesState,
  KeyValuePayload,
  RejectedAction,
} from './interfaces'
import { RootState } from 'RootType'
import { META_PER_PAGE } from '../constants'

const initialState: IdentitiesState = {
  identities: {},
  search: {},
  fetchStatusByGidName: {},
  fetchStatusByGidUUID: {},
  fetchStatusByParameters: {},
}

export const fetchIdentities = createAsyncThunk(
  'identities/fetchIdentities',
  async (parameters: FetchIdentitiesParameters, { dispatch }): Promise<Identities> => {
    dispatch(setFetchStatusByParameters({
      key: createKeyFromIdentitiesParameters(parameters),
      value: FetchStatus.PENDING,
    }))

    return getIdentitiesLookup({
      ...parameters,
      per_page: parameters.per_page ?? META_PER_PAGE,
      status: 'in_use',
      type: 'individual',
    })
  },
  {
    condition: (parameters: FetchIdentitiesParameters, { getState }): boolean => {
      const state: RootState = <RootState>getState()
      const fetchStatus: FetchStatus | undefined = getIdentityFetchStatusByParameters(state, parameters)

      if (fetchStatus === FetchStatus.PENDING || fetchStatus === FetchStatus.SUCCESS) {
        return false
      }
      const paginationMeta: PaginationMetaParams | undefined = getIdentitiesPaginationMetaByText(state, parameters.text)

      if (paginationMeta !== undefined && paginationMeta.page !== undefined && parameters.page <= paginationMeta.page) {
        return false
      }

      return true
    },
  }
)

export const fetchIdentityByGidName = createAsyncThunk(
  'identities/fetchIdentityByGidName',
  async (gidName: GidName, { dispatch }): Promise<Identity> => {
    dispatch(setFetchStatusByGidName({
      key: gidName,
      value: FetchStatus.PENDING,
    }))

    const identities: Identities = await getIdentitiesLookup({
      gid_name: gidName,
      status: 'in_use',
    })

    if (Array.isArray(identities.data) && identities.data.length > 0) {
      return identities.data[0]
    } else {
      throw new Error(`No identity found for ${gidName}`)
    }
  },
  {
    condition: (gidName: GidName, { getState }): boolean => {
      const state: RootState = <RootState>getState()
      const fetchStatus: FetchStatus | undefined = getIdentityFetchStatusByGidName(state, gidName)

      if (fetchStatus === FetchStatus.PENDING || fetchStatus === FetchStatus.SUCCESS) {
        return false
      }
      const identity: Identity | undefined = getIdentityByGidName(state, gidName)

      if (identity !== undefined) {
        return false
      }

      return true
    },
  },
)

export const fetchIdentityByGidUUID = createAsyncThunk(
  'identities/fetchIdentityByGidUUID',
  async (gidUuid: GidUUID, { dispatch }): Promise<Identity> => {
    dispatch(setFetchStatusByGidUUID({
      key: gidUuid,
      value: FetchStatus.PENDING,
    }))

    return getIdentityPublic({
      gid_uuid: gidUuid,
    })
  },
  {
    condition: (gidUuid: GidUUID, { getState }): boolean => {
      const state: RootState = <RootState>getState()
      const fetchStatus: FetchStatus | undefined = getIdentityFetchStatusByGidUUID(state, gidUuid)

      if (fetchStatus === FetchStatus.PENDING || fetchStatus === FetchStatus.SUCCESS) {
        return false
      }
      const identity: Identity | undefined = getIdentityByGidUUID(state, gidUuid)

      if (identity !== undefined) {
        return false
      }

      return true
    },
  },
)

const addIdentityOnSuccess = (state: IdentitiesState, action: PayloadAction<Identity>): void => {
  const gidName: GidName = action.payload.gid_name
  const gidUuid: GidUUID = action.payload.gid_uuid

  state.fetchStatusByGidName[gidName] = FetchStatus.SUCCESS
  state.fetchStatusByGidUUID[gidUuid] = FetchStatus.SUCCESS
  state.identities[gidUuid] = action.payload
}

const identitiesSlice = createSlice({
  name: 'identities',
  initialState,
  reducers: {
    setFetchStatusByGidName (state: IdentitiesState, action: PayloadAction<KeyValuePayload<FetchStatus>>): void {
      state.fetchStatusByGidName[action.payload.key] = action.payload.value
    },
    setFetchStatusByGidUUID (state: IdentitiesState, action: PayloadAction<KeyValuePayload<FetchStatus>>): void {
      state.fetchStatusByGidUUID[action.payload.key] = action.payload.value
    },
    setFetchStatusByParameters (state: IdentitiesState, action: PayloadAction<KeyValuePayload<FetchStatus>>): void {
      state.fetchStatusByParameters[action.payload.key] = action.payload.value
    },
  },
  extraReducers: {
    [fetchIdentities.fulfilled.type]: (
      state: IdentitiesState,
      action: FulfilledAction<Identities, FetchIdentitiesParameters>
    ): void => {
      const parameters: FetchIdentitiesParameters = action.meta.arg
      const existingResult: IdentitiesLookupResult | undefined = state.search[parameters.text]
      const existingEntries: GidUUID[] = existingResult !== undefined ? existingResult.entries : []

      action.payload.data.forEach((identity: Identity) => {
        const gidUuid: GidUUID = identity.gid_uuid

        state.identities[gidUuid] = identity
      })
      const result: IdentitiesLookupResult = {
        entries: action.payload.data.reduce<GidUUID[]>((entries: GidUUID[], identity: Identity): GidUUID[] => {
          const gidUuid: GidUUID = identity.gid_uuid

          if (!entries.includes(gidUuid)) {
            entries.push(gidUuid)
          }

          return entries
        }, existingEntries),
        meta: action.payload.meta,
      }

      state.search[parameters.text] = result
      const key: string = createKeyFromIdentitiesParameters(action.meta.arg)

      state.fetchStatusByParameters[key] = FetchStatus.SUCCESS
    },
    [fetchIdentities.rejected.type]: (state: IdentitiesState, action: RejectedAction<FetchIdentitiesParameters>): void => {
      const key: string = createKeyFromIdentitiesParameters(action.meta.arg)

      state.fetchStatusByParameters[key] = FetchStatus.ERROR
    },
    [fetchIdentityByGidName.fulfilled.type]: addIdentityOnSuccess,
    [fetchIdentityByGidName.rejected.type]: (state: IdentitiesState, action: RejectedAction<string>): void => {
      const gidName: GidName = action.meta.arg

      state.fetchStatusByGidName[gidName] = FetchStatus.ERROR
    },
    [fetchIdentityByGidUUID.fulfilled.type]: addIdentityOnSuccess,
    [fetchIdentityByGidUUID.rejected.type]: (state: IdentitiesState, action: RejectedAction<string>): void => {
      const gidName: GidName = action.meta.arg

      state.fetchStatusByGidUUID[gidName] = FetchStatus.ERROR
    },
  },
})

const {
  setFetchStatusByGidName,
  setFetchStatusByGidUUID,
  setFetchStatusByParameters,
} = identitiesSlice.actions

export default identitiesSlice.reducer
