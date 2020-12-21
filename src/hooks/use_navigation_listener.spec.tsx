import { useNavigationListener } from './use_navigation_listener'
import { testCustomHook, TestCustomHookType } from '../../tests/test_utils'
import { history, store } from '../store'
import { setRedirectToUrl } from '../store/route_slice'
import React from 'react'
import { Provider } from 'react-redux'
import { Route, Router } from 'react-router-dom'

describe('Use Navigation Listener', () => {

  const wrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element => (
    <Provider store={store}>
      <Router history={history}>
        <Route path={'/:string'}>
          {children}
        </Route>
      </Router>
    </Provider>
  )

  const getHookResult: TestCustomHookType<void, void>
    = testCustomHook(useNavigationListener, {}, { wrapper })

  it('should not redirect when url in the store is undefined', async () => {
    await getHookResult()

    const windowHref: string = window.location.href

    store.dispatch(setRedirectToUrl(undefined))

    expect(window.location.href).toEqual(windowHref)

    const redirectToUrl: string | undefined = store.getState().routing.redirectTo

    expect(redirectToUrl).toBeUndefined()
  })

  it('should redirect when url stored in the store', async () => {
    expect(window.location.href).not.toContain('redirect-to-this-url')

    store.dispatch(setRedirectToUrl('redirect-to-this-url'))
    await getHookResult()

    expect(window.location.href).toContain('redirect-to-this-url')

    const redirectToUrl: string | undefined = store.getState().routing.redirectTo

    expect(redirectToUrl).toBeUndefined()
  })

})
