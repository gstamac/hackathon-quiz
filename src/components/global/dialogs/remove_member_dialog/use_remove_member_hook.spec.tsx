import { RenderHookResult, act, renderHook, cleanup } from '@testing-library/react-hooks'
import { useRemoveMemberHook } from '.'
import { RemoveMemberHookResult, RemoveMemberHookProps } from './interfaces'
import * as groupsApi from '../../../../services/api/groups_api'
import React from 'react'
import { Provider } from 'react-redux'
import { store } from '../../../../store'

const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => <Provider store={store}>{children}</Provider>

describe('useRemoveMemberHook', () => {
  let renderHookResult: RenderHookResult<RemoveMemberHookProps, RemoveMemberHookResult>
  const removeGroupMemberMock: jest.Mock = jest.fn()

  const getHookResults = async (): Promise<void> => {
    await act(async () => {
      renderHookResult = renderHook(() =>
        useRemoveMemberHook({ gid_uuid: 'member_uuid', group_uuid: 'group_uuid', gidName: 'test', groupName: 'testGroup' }), { wrapper })
    })
  }

  beforeEach(async () => {
    (groupsApi.removeMembership as jest.Mock) = removeGroupMemberMock.mockResolvedValue({})

    await getHookResults()
  })

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  it('should change state after calling openRemoveMemberDialog function', async () => {
    await act(async () => {
      renderHookResult.result.current.openRemoveMemberDialog()
    })

    expect(renderHookResult.result.current.removeMemberDialogOpen).toEqual(true)
  })

  it('should change state after calling closeRemoveMemberDialog function', async () => {
    await act(async () => {
      renderHookResult.result.current.closeRemoveMemberDialog()
    })

    expect(renderHookResult.result.current.removeMemberDialogOpen).toEqual(false)
  })

  it('should call removeMembership api function', async () => {
    await act(async () => {
      await renderHookResult.result.current.handleRemoveMember()
    })

    expect(removeGroupMemberMock).toHaveBeenCalledWith({ gid_uuid: 'member_uuid', group_uuid: 'group_uuid' })
  })
})
