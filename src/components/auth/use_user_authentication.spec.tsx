import { publicIdentityMock } from '../../../tests/mocks/identity_mock'
import { useUserAuthentication } from './use_user_authentication'
import * as helpers from './helpers'
import { testCustomHook, TestCustomHookType } from '../../../tests/test_utils'
import { RedirectOnSignOut } from '../../utils/interfaces'
import { UserAuthenticationHookProps } from './interfaces'
import { store } from '../../store'
import {
  setLoggedIn,
  setIdentity,
  setLoggedOut,
  removeIdentity,
} from '../../store/identity_slice'
import { HookResult } from '@testing-library/react-hooks'

jest.mock('./helpers')

const initialProps: UserAuthenticationHookProps = {
  isPrivate: true,
  redirectOnSignOut: RedirectOnSignOut.LANDING_PAGE,
}

const getHookResult: TestCustomHookType<UserAuthenticationHookProps, [boolean, boolean]>
= testCustomHook(useUserAuthentication, initialProps)

describe('User authentication hook', () => {
  describe('User authentication hook test', () => {
    const handleAuthenticationMock: jest.Mock = jest.fn()
    const loadIdentityMock: jest.Mock = jest.fn()
    const validateTokenMock: jest.Mock = jest.fn()

    beforeEach(() => {
      (helpers.handleAuthentication as jest.Mock) = handleAuthenticationMock;
      (helpers.loadIdentity as jest.Mock) = loadIdentityMock;
      (helpers.validateToken as jest.Mock) = validateTokenMock.mockResolvedValue(true)
      store.dispatch(setLoggedIn())
      store.dispatch(setIdentity(publicIdentityMock))
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call handleAuthenticationMock with identity if present when component is private', async () => {
      const result: HookResult<[boolean, boolean]> = await getHookResult({})

      expect(result.current[0]).toBe(true)
      expect(result.current[1]).toBe(false)

      expect(handleAuthenticationMock).toHaveBeenCalledTimes(1)
      expect(handleAuthenticationMock).toHaveBeenCalledWith(RedirectOnSignOut.LANDING_PAGE, publicIdentityMock)
    })

    it('should call handleAuthenticationMock with identity if not present when component is private', async () => {
      store.dispatch(setLoggedOut())
      store.dispatch(removeIdentity())
      const result: HookResult<[boolean, boolean]> = await getHookResult({})

      expect(result.current[0]).toBe(false)
      expect(result.current[1]).toBe(true)

      expect(handleAuthenticationMock).toHaveBeenCalledTimes(1)
      expect(handleAuthenticationMock).toHaveBeenCalledWith(RedirectOnSignOut.LANDING_PAGE, undefined)
    })

    it('should call loadIdentities with gid_name when component is not private', async () => {
      store.dispatch(setLoggedOut())
      store.dispatch(removeIdentity())
      const result: HookResult<[boolean, boolean]> = await getHookResult({isPrivate: false})

      expect(result.current[0]).toBe(false)
      expect(result.current[1]).toBe(true)

      expect(loadIdentityMock).toHaveBeenCalledTimes(1)
      expect(loadIdentityMock).toHaveBeenCalledWith(undefined)
    })

    it('should call loadIdentities with gid_name and identity when component is not private and user is logged in', async () => {
      const result: HookResult<[boolean, boolean]> = await getHookResult({isPrivate: false})

      expect(result.current[0]).toBe(true)
      expect(result.current[1]).toBe(false)

      expect(loadIdentityMock).toHaveBeenCalledTimes(1)
      expect(loadIdentityMock).toHaveBeenCalledWith(publicIdentityMock)
    })
  })
})
