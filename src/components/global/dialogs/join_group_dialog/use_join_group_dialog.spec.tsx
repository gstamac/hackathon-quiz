import React from 'react'
import { Provider } from 'react-redux'
import configureStore, { MockStoreCreator, MockStoreEnhanced } from 'redux-mock-store'
import thunk from 'redux-thunk'
import { createAsyncThunk, Store, AnyAction } from '@reduxjs/toolkit'
import { act, renderHook, HookResult, RenderHookResult } from '@testing-library/react-hooks'
import * as groupsSlice from '../../../../store/groups_slice'
import { publicIdentityMock } from '../../../../../tests/mocks/identity_mock'
import { JoinGroupDialogHook, JoinGroupDialogHookProps } from './interfaces'
import { useJoinGroupDialog } from './use_join_group_dialog'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'

jest.mock('globalid-react-ui', () => {
  const muiCoreModule: Object = jest.requireActual('globalid-react-ui')

  return ({
    ...muiCoreModule,
    partiallyUpdateValueObject: jest.fn(),
  })
})
jest.mock('../../../../store/groups_slice')

const mockStore: MockStoreCreator = configureStore([thunk])
const createMockStore = (identity?: PublicIdentity): MockStoreEnhanced<{}, {}> => (
  mockStore({
    form: {
      forms: {
        'join-group-dialog': {},
      },
    },
    identity: {
      identity,
    },
  })
)

describe('useJoinGroupDialog', () => {
  const fetchGroupMembersPayloadCreatorMock: jest.Mock = jest.fn()
  const fetchGroupMembersMock = createAsyncThunk(
    'test/fetchGroupMembers',
    fetchGroupMembersPayloadCreatorMock
  )
  const joinGroupMemberPayloadCreatorMock: jest.Mock = jest.fn()
  const joinGroupMemberMock = createAsyncThunk(
    'test/joinGroupMember',
    joinGroupMemberPayloadCreatorMock
  )

  const getHookResult = async (
    store: Store<any, AnyAction>,
    props: JoinGroupDialogHookProps
  ): Promise<HookResult<JoinGroupDialogHook>> => {

    const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => (
      <Provider store={store}>
        {children}
      </Provider>
    )

    let renderHookResult: RenderHookResult<{}, JoinGroupDialogHook>

    await act(async () => {
      renderHookResult = renderHook(() => useJoinGroupDialog(props), { wrapper })
    })

    return renderHookResult.result
  }

  const submitForm = async (result: HookResult<JoinGroupDialogHook>, isHidden: boolean = false): Promise<void> => {
    await act(async () => {
      await result.current.handleJoinGroupOnFormSubmit({
        values: {
          shown: {
            value: !isHidden,
            failed_validators: [],
            has_changed: true,
            messages: [],
          },
        },
        fieldDefinition: {},
      })
    })
  }

  beforeAll(() => {
    (groupsSlice.fetchGroupMembers as jest.Mock) = fetchGroupMembersMock;
    (groupsSlice.joinGroupMember as jest.Mock) = joinGroupMemberMock
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should handle open state accordingly upon calling open/close methods', async () => {
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(createMockStore(), { groupUuid: 'open-close', isGroupOwner: false })

    expect(result.current.joinGroupDialogOpen).toBe(false)

    await act(async () => {
      result.current.openJoinGroupDialog()
    })

    expect(result.current.joinGroupDialogOpen).toBe(true)

    await act(async () => {
      result.current.closeJoinGroupDialog()
    })

    expect(result.current.joinGroupDialogOpen).toBe(false)
  })

  it('should trigger respective actions upon successfully joining group on confirmation', async () => {
    joinGroupMemberPayloadCreatorMock.mockResolvedValue(undefined)

    const groupUuid: string = 'join-group-success'
    const hasPermission: boolean = true
    const isHidden: boolean = true
    const store = createMockStore(publicIdentityMock)
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(store, { groupUuid, isGroupOwner: hasPermission })

    await submitForm(result, isHidden)

    const actions: any[] = store.getActions()

    expect(actions[0].type).toEqual(joinGroupMemberMock.pending.type)
    expect(actions[0].meta.arg).toEqual({
      gid_uuid: publicIdentityMock.gid_uuid,
      group_uuid: groupUuid,
      is_hidden: isHidden,
    })
    expect(joinGroupMemberPayloadCreatorMock).toHaveBeenCalled()
    expect(actions[1].type).toEqual(joinGroupMemberMock.fulfilled.type)
    expect(actions[2].type).toEqual(fetchGroupMembersMock.pending.type)
    expect(actions[2].meta.arg).toEqual({
      group_uuid: groupUuid,
      hasPermission,
      page: 1,
    })
    expect(fetchGroupMembersPayloadCreatorMock).toHaveBeenCalled()
    expect(actions[3].type).toEqual(fetchGroupMembersMock.fulfilled.type)
  })

  it('should trigger respective actions upon failing to join group on confirmation', async () => {
    joinGroupMemberPayloadCreatorMock.mockRejectedValue(undefined)

    const groupUuid: string = 'join-group-failure'
    const isHidden: boolean = false
    const store = createMockStore(publicIdentityMock)
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(store, { groupUuid, isGroupOwner: false })

    await submitForm(result, isHidden)

    const actions: any[] = store.getActions()

    expect(actions[0].type).toEqual(joinGroupMemberMock.pending.type)
    expect(actions[0].meta.arg).toEqual({
      gid_uuid: publicIdentityMock.gid_uuid,
      group_uuid: groupUuid,
      is_hidden: isHidden,
    })
    expect(joinGroupMemberPayloadCreatorMock).toHaveBeenCalled()
    expect(actions[1].type).toEqual(joinGroupMemberMock.rejected.type)
    expect(actions[2]).toBeUndefined()
    expect(fetchGroupMembersPayloadCreatorMock).not.toHaveBeenCalled()
  })

  it('should not trigger any actions upon trying to join group when user is logged out', async () => {
    const groupUuid: string = 'join-group-when-logged-out'
    const store = createMockStore()
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(store, { groupUuid, isGroupOwner: false })

    await submitForm(result)

    expect(store.getActions()).toEqual([])
    expect(joinGroupMemberPayloadCreatorMock).not.toHaveBeenCalled()
  })

  it('should close join group dialog upon successfully joining group', async () => {
    joinGroupMemberPayloadCreatorMock.mockResolvedValue(undefined)

    const groupUuid: string = 'join-group-success'
    const store = createMockStore(publicIdentityMock)
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(store, { groupUuid, isGroupOwner: false })

    await act(async () => {
      result.current.openJoinGroupDialog()
    })

    expect(result.current.joinGroupDialogOpen).toBe(true)

    await submitForm(result)

    expect(result.current.joinGroupDialogOpen).toBe(false)
  })

  it('should close join group dialog upon failing to join group', async () => {
    joinGroupMemberPayloadCreatorMock.mockRejectedValue(undefined)

    const groupUuid: string = 'join-group-failure'
    const store = createMockStore(publicIdentityMock)
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(store, { groupUuid, isGroupOwner: false })

    await act(async () => {
      result.current.openJoinGroupDialog()
    })

    expect(result.current.joinGroupDialogOpen).toBe(true)

    await submitForm(result)

    expect(result.current.joinGroupDialogOpen).toBe(false)
  })

  it('should close join group dialog upon trying to join group when user is logged out', async () => {
    const groupUuid: string = 'join-group-when-logged-out'
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(createMockStore(), { groupUuid, isGroupOwner: false })

    await act(async () => {
      result.current.openJoinGroupDialog()
    })

    expect(result.current.joinGroupDialogOpen).toBe(true)

    await submitForm(result)

    expect(result.current.joinGroupDialogOpen).toBe(false)
  })

  it('should execute on join callback successfully joining group', async () => {
    joinGroupMemberPayloadCreatorMock.mockResolvedValue(undefined)

    const groupUuid: string = 'join-group-success'
    const store = createMockStore(publicIdentityMock)
    const onJoinMock: jest.Mock = jest.fn()
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(store, {
      groupUuid,
      onJoin: onJoinMock,
      isGroupOwner: false,
    })

    await act(async () => {
      result.current.openJoinGroupDialog()
    })

    await submitForm(result)

    expect(onJoinMock).toHaveBeenCalled()
  })

  it('should not execute on join callback failing to join group', async () => {
    joinGroupMemberPayloadCreatorMock.mockRejectedValue(undefined)

    const groupUuid: string = 'join-group-failure'
    const store = createMockStore(publicIdentityMock)
    const onJoinMock: jest.Mock = jest.fn()
    const result: HookResult<JoinGroupDialogHook> = await getHookResult(store, {
      groupUuid,
      onJoin: onJoinMock,
      isGroupOwner: false,
    })

    await act(async () => {
      result.current.openJoinGroupDialog()
    })

    await submitForm(result)

    expect(onJoinMock).not.toHaveBeenCalled()
  })
})
