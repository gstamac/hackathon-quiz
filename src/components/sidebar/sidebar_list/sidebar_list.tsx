import { Location } from 'history'
import React, { useEffect, useState } from 'react'
import { List } from '@material-ui/core'
import { SidebarListItem } from './sidebar_list_item'
import { useStyles } from './style'
import { SidebarListProps } from './interfaces'
import { ListOption } from '../interfaces'
import { useHistory, useLocation } from 'react-router-dom'
import { openInNewTab, pushTo } from '../../../utils'
import { QuickMenu } from '../../global/quick_menu'
import { QuickMenuItemProps } from '../../global/quick_menu/interfaces'
import clsx from 'clsx'

export const SidebarList: React.FC<SidebarListProps> = ({
  options,
  openState,
  isMobileOrTablet,
  handleOpenState,
  isLoggedIn,
}: SidebarListProps) => {
  const { listItem, activeItem, getAppActive, list, bottomOptionsWrapper, quickMenu } = useStyles()

  const { openMoreOptions, openSideBar, openGetAppModal } = openState
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const [selectedOption, setSelectedOption] = useState<ListOption | null>(null)

  const history = useHistory()
  const location: Location = useLocation()

  const handleDesktopOnClick = (name: string, isSubmenu: boolean, option?: ListOption, value?: ListOption): void => {
    if (isSubmenu) {
      handleOpenState(name)
    } else {
      handleOpenState(name, value)
    }

    if (option?.href !== undefined) {
      if (option?.newTab) {
        openInNewTab(option.href)
      } else if (!window.location.href.includes(option.href)) {
        pushTo(history, option.href)
      }
    }
  }

  const highlightMenuListItemFromLocation = (): void => {
    options.filter((option: ListOption) => (option.href && option.canBeActive)).every((option: ListOption) => !location.pathname.includes(option.href as string))
  }

  useEffect(() => {
    highlightMenuListItemFromLocation()
  }, [location])

  const getMenuStyle = (name: string, href?: string, canBeActive?: boolean): string => {
    if (name === 'getApp' && openGetAppModal) {
      return openGetAppModal && name === 'getApp' ? getAppActive : ''
    }

    return (canBeActive && href && location.pathname.includes(href)) ? activeItem : ''
  }

  const createDesktopSidebar = (option: ListOption, index: number): JSX.Element => (
    <div
      key={option.key}
    >
      <SidebarListItem
        option={option}
        openSideBar={openSideBar}
        inset={false}
        className={clsx(listItem, getMenuStyle(option.name, option.href, option.canBeActive))}
        tabIndex={index}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          setAnchorEl(e.currentTarget)
          setSelectedOption(option)
          handleDesktopOnClick(option.name, false, option)
        }}
      />
    </div>
  )

  const createMobileSidebar = (option: ListOption, index: number): JSX.Element => {
    const menuState: string = option.subOptions && option.subOptions.length > 0 ? 'subMenu' : option.name
    const menuValue: ListOption | undefined = option.subOptions && option.subOptions.length > 0 ? option : undefined

    return (
      <div key={option.key}>
        <SidebarListItem
          option={option}
          openSideBar={openSideBar}
          inset={false}
          className={clsx(listItem, getMenuStyle(option.name, option.href))}
          tabIndex={index}
          onClick={() => handleDesktopOnClick(menuState, false, option, menuValue)}
        />
      </div>
    )
  }

  const createSidebar = (option: ListOption, index: number): JSX.Element => {
    if (isMobileOrTablet) {
      return createMobileSidebar(option, index)
    }

    return createDesktopSidebar(option, index)
  }

  const topOptions: ListOption[] = options.filter((option: ListOption) =>
    !option.bottomOption
  )

  const bottomOptions: ListOption[] = options.filter((option: ListOption) => option.bottomOption)

  const quickMenuItems: QuickMenuItemProps[] | undefined = selectedOption?.subOptions?.map((item: ListOption) => ({
    id: item.name,
    text: item.text,
    icon: item.icon ? item.icon() : undefined,
    onClick: () => {
      handleDesktopOnClick(item.name, true, item)
      handleDesktopOnClick(selectedOption?.name, true, selectedOption)
    },
    disabled: false,
  }))

  const createSideBarCallback = (option: ListOption, index: number): JSX.Element | null => {
    if (option.locked && !isLoggedIn) {
      return null
    }

    return createSidebar(option, index)
  }

  const renderQuickMenu = (): JSX.Element | null => {
    if (anchorEl && selectedOption && openMoreOptions && quickMenuItems && quickMenuItems.length > 0) {
      return <QuickMenu
        compact={false}
        title=''
        items={quickMenuItems}
        open={openMoreOptions}
        anchorEl={anchorEl}
        onClose={() => {
          handleDesktopOnClick(selectedOption?.name, true, selectedOption)
        }}
        className={quickMenu}
      />
    }

    return null
  }

  return (
    <List className={list}>
      {topOptions.map(createSideBarCallback)}

      <div className={bottomOptionsWrapper}>
        {bottomOptions.map(createSideBarCallback)}
      </div>

      {renderQuickMenu()}
    </List>
  )
}
