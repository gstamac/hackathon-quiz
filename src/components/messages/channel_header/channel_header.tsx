import React, { useRef } from 'react'
import { useHistory } from 'react-router-dom'
import {
  useTheme,
  Theme,
} from '@material-ui/core'
import {
  ChannelDetails,
  ChannelHeaderProps,
} from './interfaces'
import { ChannelHeaderBar } from './channel_header_bar'
import { ChannelMembersSidebar } from './channel_members_sidebar'
import { useStyles } from './styles'
import { useChannelDetails } from './use_channel_details'
import { ActionCard } from '../../global/action_card'
import { ActionCardProps } from '../../global/action_card/interfaces'
import { LeaveChannelDialog } from './leave_channel'
import {
  CornerUpLeftIcon,
  EditIcon,
} from '../../global/icons'
import { Popover } from '../../global/popover'
import { QuickMenu } from '../../global/quick_menu'
import { QuickMenuItemProps } from '../../global/quick_menu/interfaces'
import { ProfilePageTarget } from '../../../utils/interfaces'
import { useLeaveConversationHook } from './leave_channel/use_leave_conversation_hook'
import { EditChannelDialog, GlobalidLoader } from '../../global'
import { useChannelUpdate } from './use_channel_update'
import { useChannelHeader } from './use_channel_header'
import { ChannelType, GidUUID } from '../../../store/interfaces'
import { getString, navigateToProfilePage, openInNewTab } from '../../../utils'
import { useIdentityMenuOptions } from '../../../hooks/use_identity_menu_options'
import { IdentityMenuOption } from '../../../hooks/interfaces'
import { groupsIcon } from '../../global/icons/groups_icon'
import { BASE_GROUPS_URL, AV_ENABLED_GROUPS } from '../../../constants'
import { disableActionLink } from './helpers'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'

// eslint-disable-next-line complexity
export const ChannelHeader = ({
  channelId,
  gidUuid,
  showOwner,
  readOnly,
  hiddenMembers,
}: ChannelHeaderProps): JSX.Element | null => {
  const classes = useStyles({})
  const history = useHistory()
  const theme: Theme = useTheme()

  const settingsRef: React.MutableRefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)

  const channelDetails: ChannelDetails | null = useChannelDetails(channelId, gidUuid)

  const {
    handleLeaveChannel,
    leaveChannelDialogOpen,
    leaveChannelInProgress,
    openLeaveChannelDialog,
    closeLeaveChannelDialog,
  } = useLeaveConversationHook({ channelId })

  const {
    editChannelOpen,
    openChannelEditDialog,
    closeChannelEditDialog,
    onChannelUpdate,
  } = useChannelUpdate({ channelId })

  const {
    closeChannelSettings,
    closeMembersSidebar,
    openChannelSettings,
    openMembersSidebar,
    channelSettingsOpen,
    membersSidebarOpen,
  } = useChannelHeader()

  const handleViewGroups = (uuid: string): void => {
    closeChannelSettings()
    openInNewTab(`${BASE_GROUPS_URL}/${uuid}`)
  }

  const getViewGroupItems = (uuid: GidUUID | null | undefined): QuickMenuItemProps[] => {
    if (uuid === undefined || uuid === null) {
      return []
    }

    return [
      {
        id: 'view-group',
        text: getString('view-group'),
        icon: groupsIcon({ color: theme.palette.customColors.electricBlue }),
        onClick: () => handleViewGroups(uuid),
      },
    ]
  }

  const getMenuOptions = (): IdentityMenuOption[] =>
    channelDetails?.isBotChannel ?
      [IdentityMenuOption.REPORT_USER] :
      [
        IdentityMenuOption.ADD_OR_REMOVE_CONTACT,
        IdentityMenuOption.BLOCK_OR_UNBLOCK_USER,
        IdentityMenuOption.REPORT_USER,
      ]

  const menuOptions: QuickMenuItemProps[] | undefined = useIdentityMenuOptions({
    identity: channelDetails?.otherMemberIdentity,
    open: channelSettingsOpen,
    onClick: closeChannelSettings,
    options: getMenuOptions(),
  })

  const groupGidName: string | undefined = useSelector((root: RootState) => root.groups.groups[channelDetails?.groupUuid ?? '']?.gid_name)

  if (channelDetails === null) {
    return null
  }

  const {
    getChannelAvatar,
    channelType,
    description,
    memberUuids,
    membersDescription,
    title,
    otherMemberIdentity,
    owner,
    groupUuid,
  }: ChannelDetails = channelDetails

  const isGroup = channelType === ChannelType.GROUP
  const isOneOnOne = channelType === ChannelType.PERSONAL

  const actionLabel: string = isOneOnOne ? getString('user-settings-view-profile') : getString('view-members')
  const handleOnAction = (): void => {
    closeChannelSettings()

    if (isOneOnOne) {
      if (otherMemberIdentity !== undefined) {
        navigateToProfilePage(history, otherMemberIdentity.gid_name, ProfilePageTarget.BLANK)
      }
    } else {
      openMembersSidebar()
    }
  }

  const actionCardProperties: ActionCardProps = {
    image: getChannelAvatar({
      avatarClassName: channelType === ChannelType.MULTI && memberUuids.length > 1 ? classes.channelDetailsLogoMulti : classes.channelDetailsLogoSingle,
      avatarWrapperClassName: classes.channelDetailsLogoWrapper,
      badgePositionClassName: classes.badgePositionClassName,
    }),
    ...(!channelDetails.isBotChannel ? { action: actionLabel, onAction: handleOnAction} : {}),
    subtitle: description ?? '',
    title: title,
    actionDisabled: disableActionLink(isOneOnOne, hiddenMembers),
  }

  const firstItem: QuickMenuItemProps = {
    id: 'view-details',
    text: <ActionCard {...actionCardProperties} />,
  }

  const loadingSpinner: QuickMenuItemProps = {
    id: 'loading-option',
    text: <GlobalidLoader className={classes.loaderWrapper}/>,
  }

  const activeIconColor: string = theme.palette.customColors.electricBlue

  const multiMenuOptions: QuickMenuItemProps[] = [{
    id: 'edit-conversation',
    icon: EditIcon(activeIconColor),
    text: getString('edit-conversation'),
    onClick: () => {
      openChannelEditDialog()
      closeChannelSettings()
    },
    disabled: readOnly,
  },
  {
    id: 'leave-conversation',
    icon: CornerUpLeftIcon(activeIconColor),
    text: getString('leave-conversation'),
    onClick: openLeaveChannelDialog,
  }]

  const getItems = (): QuickMenuItemProps[] => {
    if (channelType === ChannelType.PERSONAL) {
      return menuOptions ?? [loadingSpinner]
    } else if (channelType === ChannelType.MULTI) {
      return multiMenuOptions
    } else if (channelType === ChannelType.GROUP) {
      return getViewGroupItems(groupUuid)
    }

    return []
  }

  const popoverProperties = {
    open: channelSettingsOpen,
    cursorAt: settingsRef,
    onClose: closeChannelSettings,
  }

  const settings = (): JSX.Element => {
    if (channelType === ChannelType.PERSONAL || channelType === ChannelType.MULTI || channelType === ChannelType.GROUP) {
      const menuItems: QuickMenuItemProps[] = [firstItem, ...getItems()]

      return (
        <QuickMenu
          className={classes.channelSettingsWithActionCard}
          items={menuItems}
          {...popoverProperties}
        />
      )
    }

    return (
      <Popover
        className={classes.channelSettingsPopover}
        {...popoverProperties}
      >
        <ActionCard {...actionCardProperties} />
      </Popover>
    )
  }

  const showVideoCall: boolean = (!isGroup || (groupGidName !== undefined && AV_ENABLED_GROUPS.includes(groupGidName))) && !readOnly

  return (
    <header data-testid='channel-header' className={classes.channelHeader}>
      <ChannelHeaderBar
        channelAvatar={getChannelAvatar()}
        isGroup={isGroup}
        onOptionsClick={openChannelSettings}
        channelId={channelId}
        settings={settings()}
        settingsRef={settingsRef}
        subtitle={membersDescription ?? null}
        title={title}
        showVideoCall={showVideoCall}
      />

      <ChannelMembersSidebar
        channelId={channelId}
        memberUuids={memberUuids}
        onExit={closeMembersSidebar}
        open={membersSidebarOpen}
        owner={owner}
        showOwner={showOwner}
        channelType={channelType}
      />

      <LeaveChannelDialog
        open={leaveChannelDialogOpen}
        handleLeaveChannel={handleLeaveChannel}
        inProgress={leaveChannelInProgress}
        onExit={closeLeaveChannelDialog}
        title={getString('leave-channel-header-title')}
      />

      <EditChannelDialog
        open={editChannelOpen}
        title={'Delete'}
        onExit={() => {
          closeChannelSettings()
          closeChannelEditDialog()
        }}
        channel={{ description, title }}
        onFormSubmit={onChannelUpdate}
        formKey={`${channelId}-${Math.random()}`}
      />
    </header>
  )
}
