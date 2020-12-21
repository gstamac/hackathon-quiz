import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import useAsyncEffect from 'use-async-effect'
import {
  getAuthCodeAndDeviceIdFromQueryParameter,
  resolveIdentityAndRedirect,
  validateCredentials,
  registerDeviceId,
} from './helpers'
import {
  getAnyCodeVerifier,
  removeCodeVerifierLocalStorage,
  signOut,
} from '../../utils'
import { RedirectOnSignOut } from '../../utils/interfaces'
import { LoadingSplashScreen } from '../global/loading'
import { useDispatch } from 'react-redux'
import { AuthQueryParams } from './interfaces'

export const Auth: React.FC = () => {
  const location = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()

  useAsyncEffect(async () => {
    const queryParams: AuthQueryParams | null = getAuthCodeAndDeviceIdFromQueryParameter(location.search)

    const codeVerifier: string | undefined = getAnyCodeVerifier()
    const hasValidCredentials: boolean = await validateCredentials(queryParams?.authorizationCode, codeVerifier)

    await registerDeviceId(queryParams?.deviceId)

    removeCodeVerifierLocalStorage()
    if (hasValidCredentials) {
      await resolveIdentityAndRedirect(history)
    } else {
      await signOut(dispatch, RedirectOnSignOut.LOGIN)
    }
  }, [])

  return <LoadingSplashScreen />
}
