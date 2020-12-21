import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import useAsyncEffect from 'use-async-effect'
import { handleAuthentication, loadIdentity, validateToken } from './helpers'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { useState } from 'react'
import { UserAuthenticationHookProps } from './interfaces'

export const useUserAuthentication = ({
  isPrivate,
  redirectOnSignOut,
}: UserAuthenticationHookProps): [boolean, boolean, PublicIdentity | undefined] => {
  const [hasValidToken, setHasValidToken] = useState<boolean>(true)

  const identity: PublicIdentity | undefined =
    useSelector((root: RootState) => root.identity.identity)

  const isLoggedIn: boolean =
    useSelector((root: RootState) => root.identity.isLoggedIn)

  useAsyncEffect(async (isMounted: () => boolean) => {
    const isValidToken: boolean = await validateToken()

    if (isMounted()) {
      setHasValidToken(isValidToken)
    }

    if (isPrivate) {
      await handleAuthentication(redirectOnSignOut, identity)
    } else {
      await loadIdentity(identity)
    }

  }, [isLoggedIn])

  const hasIdentityLoaded: boolean = identity !== undefined
  const isLoading: boolean = hasValidToken && !hasIdentityLoaded

  return [hasIdentityLoaded, isLoading, identity]
}
