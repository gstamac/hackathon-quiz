import { cleanup } from '@testing-library/react-hooks'
import * as groupsApi from '../../../../services/api/groups_api'
import { RemoveRoleDialogHook, RemoveRoleDialogHookProps } from './interfaces'
import { useRemoveRoleDialog } from './use_remove_role_dialog'
import { TestCustomHookType, testCustomHook } from '../../../../../tests/test_utils'

jest.mock('../../../../services/api/groups_api')

describe('useRemoveRoleDialog tests', () => {
  const removeRoleMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (<jest.Mock> groupsApi.removeRole) = removeRoleMock.mockResolvedValue({})
  })

  const hookProps: RemoveRoleDialogHookProps = {
    groupUuid: 'groupUuid',
    roleName: 'roleName',
    roleUuid: 'roleUuid',
  }

  const getHookResult: TestCustomHookType<RemoveRoleDialogHookProps, RemoveRoleDialogHook>
    = testCustomHook(useRemoveRoleDialog, hookProps)

  afterEach(async () => {
    await cleanup()
    jest.resetAllMocks()
  })

  it('should return default and defined values', async () => {
    const result: RemoveRoleDialogHook = (await getHookResult({})).current

    expect(result.handleRemoveRoleOnFormSubmit).toBeDefined()
    expect(result.isRemoveRoleDialogOpen).toEqual(false)
    expect(result.openRemoveRoleDialog).toBeDefined()
    expect(result.closeRemoveRoleDialog).toBeDefined()
  })

  it('should call removeRole api function when onSubmit is called', async () => {
    const result: RemoveRoleDialogHook = (await getHookResult({})).current

    await result.handleRemoveRoleOnFormSubmit()

    expect(removeRoleMock).toHaveBeenCalled()
  })
})
