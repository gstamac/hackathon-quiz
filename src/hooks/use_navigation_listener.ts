import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { useEffect } from 'react'
import { ThunkDispatch } from '../store'
import { setRedirectToUrl } from '../store/route_slice'

export const useNavigationListener = (): void => {
  const history = useHistory()
  const dispatch: ThunkDispatch = useDispatch()
  const redirectTo: string | undefined = useSelector((root: RootState) => root.routing.redirectTo)

  useEffect(() => {
    if (redirectTo !== undefined) {
      history.push(redirectTo)
      dispatch(setRedirectToUrl(undefined))
    }
  }, [redirectTo])
}
