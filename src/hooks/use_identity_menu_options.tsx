import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import useAsyncEffect from 'use-async-effect'
import {
  useTheme,
  Theme,
} from '@material-ui/core'
import { History } from 'history'
import { Identity } from '@globalid/identity-namespace-service-sdk'
import { BlockedUser, Folder } from '@globalid/messaging-service-sdk'
import {
  IdentityMenuOption,
  IdentityMenuOptionsParameters,
} from './interfaces'
import { useStyles } from './styles'
import { ActionCard } from '../components/global/action_card'
import { ActionCardProps } from '../components/global/action_card/interfaces'
import { useIsMobileOrTabletView } from '../components/global/helpers'
import {
  AlertTriangleIcon,
  AwardIcon,
  CheckCircleIcon,
  DollarSignIcon,
  SendIcon,
  SingleUserIcon,
  UserMinusIcon,
  UserPlusIcon,
  XCircleIcon,
} from '../components/global/icons'
import { UserAvatar } from '../components/global/user_avatar'
import { QuickMenuItemProps } from '../components/global/quick_menu/interfaces'
import { RootState } from 'RootType'
import {
  blockUser,
  unblockUser,
} from '../store/messaging_slice'
import {
  addUserToContacts,
  getString,
  navigateToProfilePage,
  removeUserFromContacts,
  reportUserByEmail,
  userExistsInContacts,
} from '../utils'
import {
  getBlockedUserByGidUUID,
  isBlockedUsersFetchInProgress,
} from '../store/messaging_selectors'
import { removeChannelIfExistsForParticipants, addChannelIfExistsForParticipants } from '../store/channels_slice/channels_slice'
import { isNil } from 'lodash'
import { handleClickToSendMessageButton } from '../components/messages/helpers'
import { ThunkDispatch } from '../store'

export const useIdentityMenuOptions = ({
  identity,
  onClick,
  open,
  profilePageTarget,
  options,
}: IdentityMenuOptionsParameters): QuickMenuItemProps[] | undefined => {
  const classes = useStyles()
  const dispatch: ThunkDispatch = useDispatch()
  const history: History = useHistory()
  const theme: Theme = useTheme()

  const [identityInContacts, setIdentityInContacts] = useState<boolean>(false)
  const [isContactExistsRequestInProgress, setContactExistsRequestInProgress] = useState<boolean>(false)

  const folders: Folder[] = useSelector((state: RootState) => state.channels.folders)

  const blockedUser: BlockedUser | undefined | null = useSelector((state: RootState) => (
    identity !== undefined ? isBlockedUsersFetchInProgress(state) ? null : getBlockedUserByGidUUID(state, identity.gid_uuid) : undefined
  ))

  const areBlockedUsersFetching = blockUser === null

  const identityIsBlocked: boolean = !isNil(blockedUser)
  const loggedInIdentity: Identity | undefined = useSelector((state: RootState) => state.identity.identity)
  const isLoggedInIdentity: boolean = loggedInIdentity !== undefined && loggedInIdentity.gid_uuid === identity?.gid_uuid

  const menuOptions: IdentityMenuOption[] = options && options.length > 0 ? options : [
    IdentityMenuOption.VIEW_PROFILE,
    IdentityMenuOption.ADD_OR_REMOVE_CONTACT,
    IdentityMenuOption.SEND_MESSAGE,
    IdentityMenuOption.SEND_MONEY,
    IdentityMenuOption.REQUEST_VOUCH,
    IdentityMenuOption.BLOCK_OR_UNBLOCK_USER,
    IdentityMenuOption.REPORT_USER,
  ]
  const showContactOption: boolean = menuOptions.includes(IdentityMenuOption.ADD_OR_REMOVE_CONTACT)

  useAsyncEffect(async () => {
    if (!open || identity === undefined || !showContactOption || isLoggedInIdentity) {
      return
    }
    setContactExistsRequestInProgress(true)

    const contactExists: boolean = await userExistsInContacts(identity.gid_name)

    setIdentityInContacts(contactExists)

    setContactExistsRequestInProgress(false)
  }, [open, identity?.gid_name])

  const isMobileOrTablet: boolean = useIsMobileOrTabletView()

  if (identity === undefined) {
    return undefined
  }

  const {
    electricBlue: activeIconColor,
    red: destructiveIconColor,
  } = theme.palette.customColors

  const createQuickMenuItemByMenuOption =
  !loggedInIdentity ?
    undefined :
    {
      [IdentityMenuOption.ADD_OR_REMOVE_CONTACT]: (): QuickMenuItemProps => (
        !identityInContacts ? {
          id: 'add-contact',
          icon: UserPlusIcon(activeIconColor),
          text: getString('user-settings-add-contact'),
          disabled: isLoggedInIdentity,
          onClick: async (): Promise<void> => {
            await addUserToContacts(dispatch, identity.gid_uuid, identity.gid_name)

            onClick && onClick()
          },
        } : {
          id: 'remove-contact',
          icon: UserMinusIcon(activeIconColor),
          text: getString('user-settings-remove-contact'),
          disabled: isLoggedInIdentity,
          onClick: async (): Promise<void> => {
            await removeUserFromContacts(dispatch, identity.gid_name)

            onClick && onClick()
          },
        }
      ),
      [IdentityMenuOption.BLOCK_OR_UNBLOCK_USER]: (): QuickMenuItemProps => (
        !identityIsBlocked ? {
          id: 'block-user',
          icon: XCircleIcon(destructiveIconColor),
          text: getString('user-settings-block-user'),
          disabled: isLoggedInIdentity,
          onClick: async () => {
            await dispatch(blockUser({
              gidName: identity.gid_name,
              gidUuid: identity.gid_uuid,
            }))
            const channelParticipant: string[] = [identity.gid_uuid, loggedInIdentity.gid_uuid]

            await dispatch(removeChannelIfExistsForParticipants({ participants: channelParticipant }))

            onClick && onClick()
          },
        } : {
          id: 'unblock-user',
          icon: CheckCircleIcon(destructiveIconColor),
          text: getString('user-settings-unblock-user'),
          disabled: isLoggedInIdentity,
          onClick: async () => {
            await dispatch(unblockUser({
              gidName: identity.gid_name,
              gidUuid: identity.gid_uuid,
            }))

            if (blockedUser) {
              const channelParticipant: string[] = [identity.gid_uuid, loggedInIdentity.gid_uuid]

              await dispatch(addChannelIfExistsForParticipants({ participants: channelParticipant }))
            }

            onClick && onClick()
          },
        }
      ),
      [IdentityMenuOption.SEND_MESSAGE]: (): QuickMenuItemProps => ({
        id: 'send-message',
        icon: SendIcon(activeIconColor),
        text: getString('user-settings-send-message'),
        disabled: isLoggedInIdentity || identityIsBlocked,
        onClick: async () => {
          if (identity !== undefined && loggedInIdentity !== undefined){
            await handleClickToSendMessageButton(dispatch, history, identity, loggedInIdentity, folders, isMobileOrTablet)
          }

          onClick && onClick()
        },
      }),
      [IdentityMenuOption.SEND_MONEY]: (): QuickMenuItemProps => ({
        id: 'send-money',
        icon: DollarSignIcon(),
        text: getString('user-settings-send-money'),
        disabled: true,
        onClick,
      }),
      [IdentityMenuOption.REPORT_USER]: (): QuickMenuItemProps => ({
        id: 'report-user',
        icon: AlertTriangleIcon(destructiveIconColor),
        text: getString('user-settings-report-user'),
        disabled: isLoggedInIdentity,
        onClick: (): void => {
          reportUserByEmail(identity.gid_name, loggedInIdentity?.gid_name)

          onClick && onClick()
        },
      }),
      [IdentityMenuOption.REQUEST_VOUCH]: (): QuickMenuItemProps => ({
        id: 'request-vouch',
        icon: AwardIcon(),
        text: getString('user-settings-request-vouch'),
        disabled: true,
        onClick,
      }),
      [IdentityMenuOption.VIEW_PROFILE]: (): QuickMenuItemProps => {
        const viewProfileMenutItem = {
          id: 'view-profile',
          onClick: () => {
            navigateToProfilePage(history, identity.gid_name, profilePageTarget)

            onClick && onClick()
          },
        }

        if (isMobileOrTablet) {
          const actionCardProperties: ActionCardProps = {
            action: getString('user-settings-view-profile'),
            image: <UserAvatar className={classes.viewProfileMenuItemAvatar} gidUuid={identity.gid_uuid} imageUrl={identity.display_image_url}/>,
            subtitle: `${identity?.display_name ?? ''} • ${identity?.country_name ?? ''}`,
            title: identity.gid_name,
          }

          return {
            ...viewProfileMenutItem,
            text: <ActionCard {...actionCardProperties} />,
          }
        }

        return {
          ...viewProfileMenutItem,
          icon: SingleUserIcon(activeIconColor),
          text: getString('user-settings-view-profile'),
        }
      },
    }

  return !isContactExistsRequestInProgress && !areBlockedUsersFetching && createQuickMenuItemByMenuOption ?
    menuOptions.map((menuOption: IdentityMenuOption) => (
      createQuickMenuItemByMenuOption[menuOption]()
    )) :
    undefined
}
