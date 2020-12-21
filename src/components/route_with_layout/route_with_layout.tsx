import React from 'react'
import { Route, RouteComponentProps } from 'react-router-dom'
import { useUserAuthentication } from '../auth'
import { RouteWithLayoutProps } from './interfaces'
import { RedirectOnSignOut } from '../../utils/interfaces'
import { LayoutContext } from '../layouts/layout_context'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'

export const RouteWithLayout: React.FC<RouteWithLayoutProps> = (props: RouteWithLayoutProps) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { layout: Layout, component: Component, layoutProps, ...rest } = props

  const isBrowserNotificationsPromptVisible: boolean =
    useSelector((state: RootState) => state.browserNotifications.isPromptVisible)

  const isPrivate: boolean = props.isPrivate ?? false
  const redirectOnSignOut: RedirectOnSignOut = props.redirectOnSignOut ?? RedirectOnSignOut.LANDING_PAGE

  const [isLoggedIn, isLoading, _identity]: [boolean, boolean, PublicIdentity | undefined] = useUserAuthentication({isPrivate, redirectOnSignOut})

  if (Component === undefined) {
    return null
  }

  return (
    <Route
      {...rest}
      render={(matchProps: RouteComponentProps<{}>) => (
        <LayoutContext.Provider value={{
          title: layoutProps?.headerTitle,
          content: Component,
          contentProps: matchProps,
          titleFullwidth: layoutProps?.headerFullwidth,
          isPrivate,
          isLoading,
          isLoggedIn,
          isBrowserNotificationsPromptVisible,
        }}>
          <Layout />
        </LayoutContext.Provider>
      )}
    />
  )
}

