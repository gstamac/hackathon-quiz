import React from 'react'
import { SidebarSubMenuProps, ListOption } from './interfaces'
import backArrowBlack from '../../assets/icons/back_arrow_black.svg'
import { List, Drawer } from '@material-ui/core'
import { useStyles as useSideBarListStyles } from './sidebar_list/style'
import { SidebarListItem } from './sidebar_list/sidebar_list_item'
import { useStyles as sideBarStyles } from './styles'

export const SideBarSubMenu: React.FC<SidebarSubMenuProps> = (props: SidebarSubMenuProps) => {

  const {
    menuItem,
    onBack,
    onClick,
    openState,
  } = props

  const { list, listItem } = useSideBarListStyles()

  if (menuItem === undefined || menuItem.subOptions === undefined) {
    return null
  }

  const classes = sideBarStyles({})
  const { subMenuDrawer, subMenuWrapper, subMenuTitle, title, subMenu, backImage } = classes
  const { openSideBar } = openState

  const createMenuItem = (option: ListOption, index: number): JSX.Element => (
    <div key={menuItem.key}>
      <SidebarListItem
        option={option}
        openSideBar={openSideBar}
        inset={false}
        className={listItem}
        tabIndex={index}
        onClick={() => onClick(option)}
      />
    </div>
  )

  return (
    <Drawer variant='permanent' className={subMenuDrawer} role='drawer' transitionDuration={0}>
      <div className={subMenuWrapper}>
        <div onClick={onBack} className={subMenuTitle}>
          <img src={backArrowBlack} alt={'back'} className={backImage} /> <span className={title}>{menuItem.text}</span>
        </div>
        <div className={subMenu}>
          <List className={list}>
            { menuItem.subOptions.map((option: ListOption, index: number) => createMenuItem(option, index)) }
          </List>
        </div>
      </div>
    </Drawer>
  )
}
