/* eslint-disable complexity */
import React, { useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { History } from 'history'
import { Identity } from '@globalid/identity-namespace-service-sdk'
import { useStyles } from './styles'
import { getSubstringIndices, isMutualContact } from './helpers'
import { Checkbox } from '../global/checkbox'
import { QuickMenu } from '../global/quick_menu'
import { QuickMenuItemProps } from '../global/quick_menu/interfaces'
import { UserAvatar } from '../global/user_avatar'
import { useIdentityMenuOptions } from '../../hooks/use_identity_menu_options'
import { navigateToProfilePage, getString } from '../../utils'
import MutualContactsIcon from '../../assets/icons/mutual_contact_icon.svg'
import OptionsIcon from '../../assets/icons/options_icon.svg'
import clsx from 'clsx'
import { Tooltip } from '../global/tooltip'
import { TooltipProps } from '../global/tooltip/interfaces'
import { BlockedUser } from '@globalid/messaging-service-sdk'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { getBlockedUserByGidUUID } from '../../store/messaging_selectors'
import { IdentityListItemProps, TextType } from './interfaces'
import { useIsMobileOrTabletView } from '../global/helpers'
import _ from 'lodash'

export const IdentityListItem: React.FC<IdentityListItemProps> = ({
  isSelected = false,
  onSelect,
  showCheckbox = false,
  isOwner,
  hideOwner,
  selectDisabled,
  adornment,
  adornmentCondition,
  itemDisabled,
  disabledItemTooltip,
  matches,
  ...props
}: IdentityListItemProps) => {
  const hasAdornment: boolean = adornment !== undefined && adornmentCondition !== undefined && adornmentCondition(props)

  const classes = useStyles({ checkbox: showCheckbox, adornment: hasAdornment })
  const history: History = useHistory()
  const isMobileOrTablet: boolean = useIsMobileOrTabletView()

  const userInfoWrapperElement: React.MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)
  const settingsIconElement: React.MutableRefObject<HTMLImageElement | null> = useRef<HTMLImageElement>(null)
  const [userSettingsOpen, setUserSettingsOpen] = useState<boolean>(false)
  const [isTooltipOpen, setTooltipOpen] = useState<boolean>(false)

  const blockedUser: BlockedUser | undefined = useSelector((state: RootState) => (
    props !== undefined ? getBlockedUserByGidUUID(state, props.gid_uuid) : undefined
  ))

  const isIdentityBlocked: boolean = blockedUser !== undefined
  const canEngageWithIdentity: boolean = !isIdentityBlocked

  const closeUserSettings = (): void => {
    setUserSettingsOpen(false)
  }

  const itemIsEnabled: boolean = itemDisabled === undefined || !itemDisabled(props)

  const isCheckboxEnabled: boolean = showCheckbox
    && canEngageWithIdentity
    && !selectDisabled
    && itemIsEnabled

  const isCheckboxDisabled: boolean = showCheckbox
    && (
      !canEngageWithIdentity
      || selectDisabled
      || !itemIsEnabled
    )

  const openUserSettings = (event: React.MouseEvent<HTMLDivElement | HTMLImageElement>): void => {
    event.stopPropagation()
    // Prevent opening of user settings in case user settings is being closed with click event,
    // which is sequentially propagated to list item, that will re-open user settings (on mobile)
    if (userSettingsOpen) {
      return
    }
    setUserSettingsOpen(true)
  }

  const menuItems: QuickMenuItemProps[] | undefined = useIdentityMenuOptions({
    identity: props as Identity,
    onClick: closeUserSettings,
    open: userSettingsOpen,
    profilePageTarget: props.profilePageTarget,
  })

  const getMutualContactIcon = (): JSX.Element | undefined => isMutualContact(props) ?
    <img src={MutualContactsIcon} className={classes.mutualContactIcon} alt='mutual contacts'/> : undefined

  const handleClickToItemCard = (event: React.MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation()
    if (isCheckboxEnabled) {
      return onSelect && onSelect(!isSelected)
    }
    if (userSettingsOpen) {
      return
    }
    if (!showCheckbox) {
      if (isMobileOrTablet) {
        openUserSettings(event)
      } else {
        navigateToProfilePage(history, props.gid_name, props.profilePageTarget)
      }
    }
  }

  const displayName: string | null = props.display_name
    ? `${props.display_name} • `
    : null

  const getTooltipHeading = (): string => {
    if (!itemIsEnabled && disabledItemTooltip) {
      return disabledItemTooltip
    }

    return isIdentityBlocked
      ? getString('tooltip-blocked-user-only-heading')
      : getString('tooltip-webclient-user-only-heading')
  }

  const getTooltipForItem = (): JSX.Element => {
    const heading: string = getTooltipHeading()

    const description: string = isIdentityBlocked ?
      getString('tooltip-blocked-user-only-description') :
      getString('tooltip-webclient-user-only-description')

    const tooltipProps: Omit<TooltipProps, 'children'> = {
      open: isTooltipOpen,
      enabled: showCheckbox && isCheckboxDisabled && !selectDisabled,
      heading,
      description,
    }

    return (<Tooltip
      {...tooltipProps}
    >
      <div className={classes.userAvatarWrapper}>
        <UserAvatar gidUuid={props.gid_uuid} imageUrl={props.display_image_url}/>
        {getMutualContactIcon()}
      </div>
    </Tooltip>)
  }

  const highlightText = (type: TextType, text: string | null): JSX.Element | null => {
    if (text === null) {
      return null
    }

    const indices: number[] = getSubstringIndices(matches, type)

    if (_.isEmpty(indices)) {
      return <span>{text}</span>
    }

    return <>
      <span>{text.slice(0, indices[0])}</span>
      <span className={classes.highlightedText}>{text.slice(indices[0], indices[1] + 1)}</span>
      <span>{text.slice(indices[1] + 1)}</span>
    </>
  }

  return (
    <div
      className={clsx(classes.listItemWrapper, { [classes.disabled]: isCheckboxDisabled })}
      onClick={handleClickToItemCard}
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
      data-testid='identity-list-item'
    >
      <div className={classes.listItem}>
        {showCheckbox && <Checkbox checked={isSelected} />}
        {getTooltipForItem()}
        <div
          className={classes.userInfoWrapper}
          data-testid='user-info-wrapper'
          ref={userInfoWrapperElement}
        >
          <div className={classes.userNameAndSettingsIcon}>
            <a className={classes.userName}>
              {highlightText(TextType.GID_NAME, props.gid_name)}
              {isOwner && !hideOwner && <span>{getString('group-owner')}</span>}
            </a>
            {!isMobileOrTablet && !showCheckbox && <img
              className={`${classes.settingsIcon} ${userSettingsOpen ? classes.settingsIconVisible : ''}`}
              src={OptionsIcon}
              alt='settings'
              ref={settingsIconElement}
              onClick={openUserSettings}
            />}
            <QuickMenu
              className={isMobileOrTablet ? classes.settingsWithActionCard : undefined}
              cursorAt={isMobileOrTablet ? userInfoWrapperElement : settingsIconElement}
              items={menuItems}
              onClose={closeUserSettings}
              open={userSettingsOpen}
              title={'People'}
            />
          </div>
          <div className={classes.description}>
            {highlightText(TextType.DISPLAY_NAME, displayName)}
            {props.country_name}
          </div>
        </div>
        {hasAdornment && <div className={classes.adornmentStyle}>
          {adornment}
        </div>}
      </div>
    </div>
  )
}
