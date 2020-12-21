import {
  messagesIcon,
  ellipsisIcon,
  LogoutIcon,
} from '../global'
import { Params, ListOption } from './interfaces'
import {
  BASE_MESSAGES_URL,
} from '../../constants'
import { getString } from '../../utils'

export const SideBarOptions = (params: Params): ListOption[] => {
  const { isMobileOrTablet, isAppUser, iconColor, windowInnerHeight, hasUnreadMessages } = params

  const listHiddenItems: ListOption[] = [
    {
      key: 'messages',
      text: getString('sidebar-option-messages'),
      name: 'messages',
      href: BASE_MESSAGES_URL,
      locked: true,
      icon: () => messagesIcon({ color: iconColor }),
      canBeActive: true,
      notificationMark: hasUnreadMessages,
    },
  ]

  const quickMenuOption: ListOption = {
    key: 'quickMenuOption',
    text: '',
    name: 'quickMenuOption',
    href: undefined,
    locked: true,
    icon: () => ellipsisIcon({ color: iconColor }),
    canBeActive: false,
    subOptions: listHiddenItems,
  }

  const desktopOptions: ListOption[] = [
    {
      key: 'disconnect',
      text: '',
      name: 'disconnect',
      href: undefined,
      locked: true,
      icon: () => LogoutIcon({ color: iconColor }),
      bottomOption: true,
    },
  ]

  const options: ListOption[] = desktopOptions

  const filteredItems: ListOption[] = isAppUser ? filterItemsForAppUser(options) : options

  if (isMobileOrTablet){
    return filteredItems
  }

  const sidebarItemSizeWithPaddings: number = 68

  const notHiddenItemsHeight: number = ((filteredItems.length + 1) * sidebarItemSizeWithPaddings) + sidebarItemSizeWithPaddings

  const countOfItemsCanBeDisplayed: number = Math.floor((windowInnerHeight - notHiddenItemsHeight) / sidebarItemSizeWithPaddings)

  const displayedItems: ListOption[] = listHiddenItems.slice(0, countOfItemsCanBeDisplayed)

  const subOptions: ListOption[] | undefined = quickMenuOption?.subOptions?.slice(countOfItemsCanBeDisplayed, listHiddenItems.length)

  if (countOfItemsCanBeDisplayed < listHiddenItems.length) {
    return [...displayedItems, ...filteredItems, {...quickMenuOption, subOptions}]
  }

  return [...filteredItems, ...listHiddenItems]
}

const filterItemsForAppUser = (
  options: ListOption[]
): ListOption[] => options.filter((listItem: ListOption) => listItem.key !== 'getApp')
