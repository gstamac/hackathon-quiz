import React from 'react'
import { Sidebar } from '..'
import { useStyles } from './style'
import { LayoutContext, LayoutState } from './layout_context'
import { PageContentHeader } from '../page_content_header'
import { Header } from '../header'
import clsx from 'clsx'
import { RouteComponentProps } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { useNavigationListener } from '../../hooks/use_navigation_listener'

const mainLayoutCustomerContent = (layoutState: LayoutState, classes: ReturnType<typeof useStyles>): JSX.Element => {
  const { fullWidthContainer, content, layoutMargin, containerMargin } = classes

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Children: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any> = layoutState.content

  const containerClassname = clsx(fullWidthContainer, {
    [containerMargin]: !layoutState.isLoggedIn,
  })

  return (
    <>
      <div>
        {!layoutState.isLoading && <Sidebar/>}
        <div className={containerClassname}>
          {!layoutState.isPrivate && !layoutState.isLoggedIn && !layoutState.isLoading && <Header/>}
          {layoutState.title !== undefined && layoutState.titleFullwidth &&
          <PageContentHeader title={layoutState.title} border={true}/>}
          <main className={clsx(content, { [layoutMargin]: (!layoutState.isLoggedIn && !layoutState.isLoading)})}>
            <Children {...layoutState.contentProps} />
          </main>
        </div>
      </div>
    </>
  )
}

export const MainLayout: React.FC = () => {
  const isBrowserNotificationsPromptVisible: boolean =
    useSelector((state: RootState) => state.browserNotifications.isPromptVisible)

  useNavigationListener()

  const classes = useStyles({ isBrowserNotificationsPromptVisible })
  const { root } = classes

  return (
    <div className={root}>
      <LayoutContext.Consumer>
        {(layoutState: LayoutState | undefined) => {
          if (!layoutState) {
            return null
          }

          return mainLayoutCustomerContent(layoutState, classes)
        }}
      </LayoutContext.Consumer>
    </div>
  )
}
