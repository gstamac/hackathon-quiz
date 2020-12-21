import React from 'react'
import { Provider } from 'react-redux'
import configureStore, { MockStoreEnhanced } from 'redux-mock-store'
import thunk, { ThunkMiddleware } from 'redux-thunk'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { act, renderHook, HookResult, RenderHookResult } from '@testing-library/react-hooks'
import * as groupsSlice from '../../../../store/groups_slice'
import { publicIdentityMock } from '../../../../../tests/mocks/identity_mock'
import { LeaveGroupDialogHook, LeaveGroupDialogHookProps } from './interfaces'
import { useLeaveGroupDialog } from './use_leave_group_dialog'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'

jest.mock('../../../../store/groups_slice')

const middlewares: ThunkMiddleware[] = [thunk]
const mockStore = configureStore(middlewares)
const createMockStore = (identity?: PublicIdentity): MockStoreEnhanced<unknown, {}> => (
  mockStore({
    identity: {
      identity,
    },
  })
)

describe('useLeaveGroupDialog', () => {
  const leaveGroupPayloadCreatorMock: jest.Mock = jest.fn()
  const leaveGroupMock = createAsyncThunk(
    'test/leaveGroup',
    leaveGroupPayloadCreatorMock
  )

  const getHookResult = async (
    store: any,
    props: LeaveGroupDialogHookProps
  ): Promise<HookResult<LeaveGroupDialogHook>> => {

    const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => (
      <Provider store={store}>
        {children}
      </Provider>
    )

    let renderHookResult: RenderHookResult<Record<string, unknown>, LeaveGroupDialogHook>

    await act(async () => {
      renderHookResult = renderHook(() => useLeaveGroupDialog(props), { wrapper })
    })

    return renderHookResult.result
  }

  beforeAll(() => {
    (groupsSlice.leaveGroup as jest.Mock) = leaveGroupMock
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should handle open state accordingly upon calling open/close methods', async () => {
    const result: HookResult<LeaveGroupDialogHook> = await getHookResult(createMockStore(), { groupUuid: 'open-close' })

    expect(result.current.leaveGroupDialogOpen).toBe(false)

    await act(async () => {
      result.current.openLeaveGroupDialog()
    })

    expect(result.current.leaveGroupDialogOpen).toBe(true)

    await act(async () => {
      result.current.closeLeaveGroupDialog()
    })

    expect(result.current.leaveGroupDialogOpen).toBe(false)
  })

  it('should trigger respective actions upon successfully leaving group on confirmation', async () => {
    leaveGroupPayloadCreatorMock.mockResolvedValue({})

    const groupUuid: string = 'leave-group-success'
    const store = createMockStore(publicIdentityMock)
    const result: HookResult<LeaveGroupDialogHook> = await getHookResult(store, { groupUuid })

    await act(async () => {
      await result.current.handleLeaveGroupOnFormSubmit()
    })

    const actions: any[] = store.getActions()

    expect(actions[0].type).toEqual(leaveGroupMock.pending.type)
    expect(actions[0].meta.arg).toEqual({
      group_uuid: groupUuid,
      gid_uuid: publicIdentityMock.gid_uuid,
    })
    expect(leaveGroupPayloadCreatorMock).toHaveBeenCalled()
    expect(actions[1].type).toEqual(leaveGroupMock.fulfilled.type)
  })

  it('should trigger respective actions upon failing to leave group on confirmation', async () => {
    leaveGroupPayloadCreatorMock.mockRejectedValue({})

    const groupUuid: string = 'leave-group-failure'
    const store = createMockStore(publicIdentityMock)
    const result: HookResult<LeaveGroupDialogHook> = await getHookResult(store, { groupUuid })

    await act(async () => {
      await result.current.handleLeaveGroupOnFormSubmit()
    })

    const actions: Array = store.getActions()

    expect(actions[0].type).toEqual(leaveGroupMock.pending.type)
    expect(actions[0].meta.arg).toEqual({
      group_uuid: groupUuid,
      gid_uuid: publicIdentityMock.gid_uuid,
    })
    expect(leaveGroupPayloadCreatorMock).toHaveBeenCalled()
    expect(actions[1].type).toEqual(leaveGroupMock.rejected.type)
  })

  it('should not trigger any actions upon trying to leave group when user is logged out', async () => {
    const groupUuid: string = 'leave-group-when-logged-out'
    const store = createMockStore()
    const result: HookResult<LeaveGroupDialogHook> = await getHookResult(store, { groupUuid })

    await act(async () => {
      await result.current.handleLeaveGroupOnFormSubmit()
    })

    expect(store.getActions()).toEqual([])
    expect(leaveGroupPayloadCreatorMock).not.toHaveBeenCalled()
  })

  it('should close leave group dialog upon successfully leaving group', async () => {
    leaveGroupPayloadCreatorMock.mockResolvedValue({})

    const groupUuid: string = 'leave-group-success'
    const store = createMockStore(publicIdentityMock)
    const result: HookResult<LeaveGroupDialogHook> = await getHookResult(store, { groupUuid })

    await act(async () => {
      result.current.openLeaveGroupDialog()
    })

    expect(result.current.leaveGroupDialogOpen).toBe(true)

    await act(async () => {
      await result.current.handleLeaveGroupOnFormSubmit()
    })

    expect(result.current.leaveGroupDialogOpen).toBe(false)
  })

  it('should close leave group dialog upon failing to leave group', async () => {
    leaveGroupPayloadCreatorMock.mockRejectedValue({})

    const groupUuid: string = 'leave-group-failure'
    const store = createMockStore(publicIdentityMock)
    const result: HookResult<LeaveGroupDialogHook> = await getHookResult(store, { groupUuid })

    await act(async () => {
      result.current.openLeaveGroupDialog()
    })

    expect(result.current.leaveGroupDialogOpen).toBe(true)

    await act(async () => {
      await result.current.handleLeaveGroupOnFormSubmit()
    })

    expect(result.current.leaveGroupDialogOpen).toBe(false)
  })

  it('should close leave group dialog upon trying to leave group when user is logged out', async () => {
    const groupUuid: string = 'leave-group-when-logged-out'
    const result: HookResult<LeaveGroupDialogHook> = await getHookResult(createMockStore(), { groupUuid })

    await act(async () => {
      result.current.openLeaveGroupDialog()
    })

    expect(result.current.leaveGroupDialogOpen).toBe(true)

    await act(async () => {
      await result.current.handleLeaveGroupOnFormSubmit()
    })

    expect(result.current.leaveGroupDialogOpen).toBe(false)
  })
})
