/* eslint-disable complexity */
import React, { useEffect, useState } from 'react'
import { useTheme } from '@material-ui/core/styles'

import { useStyles } from './styles'
import { SidebarProfile } from './sidebar_profile'
import { SidebarList } from './sidebar_list'
import { SideBarOptions } from './sidebar_options'
import { DisconnectDialog, GetAppDialog } from '../global/dialogs'

import globalidLogo from '../../assets/icons/globalid_new_logo.svg'
import { Skeleton, SkeletonProvider } from '../global/skeletons'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { useHistory } from 'react-router-dom'
import { getAppIcon, messagesIcon, moreIcon, peopleIcon, profileIcon, groupsIcon } from '../global/icons'
import { SidebarDrawer } from './sidebar_drawer'
import { SideBarSubMenu } from './sidebar_submenu'
import { ListOption, OpenState, SidebarListOptions, OnSidebarItemClick, SidebarMenuTab } from './interfaces'
import { getString, openInNewTab, pushTo } from '../../utils'
import { useLayoutState, LayoutState } from '../layouts/layout_context'
import { useIsMobileOrTabletView } from '../global/helpers'
import { BASE_GROUPS_URL, BASE_MESSAGES_URL, BASE_CONTACTS_URL } from '../../constants'
import { useWindowSize } from '../../hooks/use_window_resize'
import { WindowSize } from '../../hooks/interfaces'
import { CombinedButton } from '../global/buttons/combined_button'
import { MobileViewContent } from '../global/buttons/combined_button/interfaces'
import disconnectIconLink from '../../../src/assets/icons/disconnect-icon.svg'
import { IdentityResponse } from '@globalid/identity-namespace-service-types'
import { getNumberOfUnreadMessages } from '../../utils/counter_helpers'
import { GeneralObject } from '../../utils/interfaces'

export const Sidebar: React.MemoExoticComponent<React.FC> = React.memo(() => {
  const theme = useTheme()
  const { darkGrey, almostCometGrey } = theme.palette.customColors

  const isMobileOrTablet: boolean = useIsMobileOrTabletView()
  const layoutState: LayoutState | undefined = useLayoutState()
  const identity: PublicIdentity | undefined = useSelector(
    (root: RootState) => root.identity.identity,
  )

  const isAppUser: boolean = identity?.signup_type === IdentityResponse.IdentitySignupType.Globalid
  const isLoggedIn: boolean = layoutState?.isLoggedIn ?? false
  const isLoading = layoutState?.isLoading ?? true

  const classes = useStyles({ transition: !isLoading })

  const history = useHistory()

  const [openState, setOpenState] = useState<OpenState>({
    openMoreOptions: false,
    openSideBar: false,
    openDisconnectModal: false,
    openGetAppModal: false,
    openSubMenu: false,
    transition: false,
  })

  const {
    openMoreOptions,
    openSideBar,
    openDisconnectModal,
    openGetAppModal,
    openSubMenu,
  } = openState

  const [currentMenuItem, setCurrentMenuItem] = useState<ListOption>()

  const counters: GeneralObject<number>
    = useSelector((state: RootState) => state.counters.counters)

  const handleDrawerClose = (): void => {
    setOpenState({ ...openState, openMoreOptions: false, openSideBar: false })
  }

  useEffect(() => {
    setOpenState({
      ...openState,
      openSideBar: !isMobileOrTablet,
    })
  }, [isMobileOrTablet])

  const handleSubmenuOptionClick = (option: ListOption): void => {
    if (option.href !== undefined) {
      if (option.newTab) {
        openInNewTab(option.href)
      } else {
        pushTo(history, option.href)
        handleSubMenuClose()
      }
    }
  }

  const handleSubMenuBack = (): void => {
    setCurrentMenuItem(undefined)
    setOpenState({ ...openState, openSubMenu: false })
  }

  const handleSubMenuClose = (): void => {
    setCurrentMenuItem(undefined)
    setOpenState({ ...openState, openMoreOptions: false, openSideBar: false, openSubMenu: false })
  }

  const handleOpenState = (value?: string, _menuItem?: ListOption): void => {
    if (value === 'disconnect') {
      setOpenState({
        ...openState,
        openDisconnectModal: !openDisconnectModal,
      })
    }
    const openSideBarState = isMobileOrTablet ? !openSideBar : true

    if (value === SidebarMenuTab.MESSAGES) {
      setOpenState({
        ...openState,
        openSideBar: openSideBarState,
        openMoreOptions: false,
      })
    }
  }

  const { height }: WindowSize = useWindowSize()

  const menuList = SideBarOptions({
    isAppUser,
    isMobileOrTablet,
    color: darkGrey,
    iconColor: almostCometGrey,
    windowInnerHeight: height ?? window.innerHeight,
    hasUnreadMessages: getNumberOfUnreadMessages(counters) > 0,
  })

  const sidebarListOptions: SidebarListOptions = {
    isLoggedIn,
    options: menuList,
    isMobileOrTablet,
    openState,
  }

  const sidebarElements = getSidebarElements(identity, sidebarListOptions, isMobileOrTablet, classes, handleDrawerClose, handleOpenState, isLoading)

  const sidebarDrawerProps = { isMobileOrTablet, openSideBar, isLoading, isLoggedIn }

  const subMenuElements = (): JSX.Element => getSubMenuElements(currentMenuItem, openState, handleSubMenuBack, handleSubmenuOptionClick)

  return (
    <SkeletonProvider loading={isLoading}>
      <SidebarDrawer {...sidebarDrawerProps}>{sidebarElements}</SidebarDrawer>
      {isMobileOrTablet && openSubMenu && subMenuElements()}
      <DisconnectDialog
        open={openDisconnectModal}
        handleOpenState={() => handleOpenState('disconnect')}
      />
      <GetAppDialog
        open={openGetAppModal}
        handleOpenState={() => handleOpenState('getApp')}
      />
    </SkeletonProvider>
  )
})

const getSidebarElements = (
  identity: PublicIdentity | undefined,
  sidebarListOptions: SidebarListOptions,
  isMobileOrTablet: boolean,
  classes: ReturnType<typeof useStyles>,
  handleDrawerClose: () => void,
  handleOpenState: (value?: string | undefined) => void,
  isLoading: boolean,
): JSX.Element => (<>
  {!isMobileOrTablet && identity === undefined && (
    <Skeleton wrapperClassName={classes.globalidLogo} className={classes.skeletonGlobalidLogo}>
      <img src={globalidLogo}/>
    </Skeleton>
  )}
  <SidebarProfile
    isLoading={isLoading}
    user={identity}
    handleOpenState={handleOpenState}
    handleDrawerClose={handleDrawerClose}
  />
  <SidebarList
    {...sidebarListOptions}
    handleOpenState={handleOpenState}
  />

  {identity && isMobileOrTablet &&
    <CombinedButton
      active={sidebarListOptions.openState.openDisconnectModal}
      handleClick={() => handleOpenState('disconnect')}
      title='Disconnect'
      mobileViewContent={MobileViewContent.TEXT}
      icon={disconnectIconLink}
      className={classes.disconnectButton}
    />
  }
</>)

const getSubMenuElements = (
  menuItem: ListOption | undefined,
  openState: OpenState,
  onBack: () => void,
  onClick: OnSidebarItemClick,
): JSX.Element => <SideBarSubMenu menuItem={menuItem} openState={openState} onBack={onBack} onClick={onClick}/>

