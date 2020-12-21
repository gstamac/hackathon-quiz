import { DevicesInfoResponse } from '@globalid/keystore-service-sdk'
import {
  AddChannelBody,
  ChannelWithParticipants,
  Folder,
  ParticipantChannelDeviceSecret,
} from '@globalid/messaging-service-sdk'
import { History } from 'history'
import * as UUID from 'uuid'
import { ChannelFoldersType, MessagesType } from '../components/messages/interfaces'
import { BASE_MESSAGES_URL } from '../constants'
import { getString } from './general_utils'
import { setToastError } from 'globalid-react-ui'
import {
  fetchExistingChannel,
  setChannel,
} from './../store/channels_slice/channels_slice'
import { ThunkDispatch } from './../store/store'
import { isEmpty, uniq } from 'lodash'
import { deviceKeyManager } from '../init'
import {
  createChannel,
  createChannelE2EE,
} from '../services/api/channels_api'
import { getUsersDevices } from '../services/api/keystore_api'
import {
  ChannelType,
  GidUUID,
  ChannelWithParticipantsAndParsedMessage,
} from '../store/interfaces'
import { GoToChannelParams } from './interfaces'

export const createChannelWithUserDeviceSecrets = async (
  participants: GidUUID[],
  ownerUuid: GidUUID,
  type: 'MULTI' | 'PERSONAL',
  groupUuid?: string,
): Promise<ChannelWithParticipants> => {
  const allParticipants: GidUUID[] = uniq([...participants, ownerUuid])
  const devices: DevicesInfoResponse[] = await getUsersDevices(allParticipants)
  const primaryDevices: DevicesInfoResponse[] = devices.filter((x: DevicesInfoResponse) => x.is_primary)
  const deviceOwners: string[] = primaryDevices.map((x: DevicesInfoResponse) => x.gid_uuid)

  const secrets: ParticipantChannelDeviceSecret[] = await deviceKeyManager.prepareSecrets(devices)

  const everyParticipantHasPrimaryDevice: boolean = allParticipants.every((x: string) => deviceOwners.includes(x))

  const addChannelBodyParams: AddChannelBody = {
    uuid: UUID.v4(),
    participants,
    exposed: true,
    type,
    group_uuid: groupUuid,
  }

  if (everyParticipantHasPrimaryDevice) {
    return createChannelE2EE({
      ...addChannelBodyParams,
      secrets,
    })
  } else {
    return createChannel({
      ...addChannelBodyParams,
    })
  }
}

export const createConversation = async (
  selectedIdentities: string[],
  loggedInIdentityUuid: string,
  folders: Folder[],
  dispatch: ThunkDispatch,
  history: History,
  params?: GoToChannelParams,
): Promise<void> => {
  try {
    if (isEmpty(selectedIdentities)) {
      throw new Error('PARTICIPANTS_EMPTY')
    }
    const channelType: ChannelType = selectedIdentities.length > 1 ? ChannelType.MULTI : ChannelType.PERSONAL

    let existingChannel: ChannelWithParticipants | undefined = <ChannelWithParticipants | undefined>(
      await dispatch(fetchExistingChannel({
        participants: [...selectedIdentities, loggedInIdentityUuid],
        groupUuid: params?.groupUuid,
      }))
    ).payload

    if (!existingChannel) {
      existingChannel = <ChannelWithParticipants> (
        await createNewChannel(selectedIdentities, loggedInIdentityUuid, channelType, dispatch, params?.groupUuid)
      )
    }
    goToChannel(
      history,
      existingChannel.id,
      getRouteFolderType(folders, existingChannel.folder_id, params?.groupUuid),
      params
    )
  } catch (error) {
    dispatch(setToastError({
      title: getString('chat-creation-error-title'),
      message: getString('chat-creation-error-description'),
    }))
  }
}

const createNewChannel = async (
  finalParticipants: string[],
  loggedInIdentityUuid: string,
  channelType: ChannelType,
  dispatch: ThunkDispatch,
  groupUuid?: string,
): Promise<ChannelWithParticipantsAndParsedMessage> => {
  if (!(channelType === ChannelType.MULTI || channelType === ChannelType.PERSONAL))
  {
    throw new Error('INCORRECT_CHANNEL_TYPE')
  }
  const participantsWithAuthor: GidUUID[]
      = channelType === ChannelType.MULTI ? [...finalParticipants, loggedInIdentityUuid] : finalParticipants
  const createdChannel: ChannelWithParticipants
     = await createChannelWithUserDeviceSecrets(participantsWithAuthor, loggedInIdentityUuid, channelType, groupUuid)

  return <ChannelWithParticipantsAndParsedMessage>(await dispatch(setChannel(createdChannel))).payload
}

export const getRouteFolderType = (
  folders: Folder[],
  folderId?: string | null,
  groupUuid?: string,
): MessagesType => {
  if (groupUuid !== undefined) {
    return MessagesType.GROUPS
  }
  if (!folderId) {
    return MessagesType.PRIMARY
  } else {
    const channelFolder: Folder | undefined = folders.find((folder: Folder) => folder.id === folderId)

    if (channelFolder !== undefined) {
      if (channelFolder.type === ChannelFoldersType.GENERAL) {
        return MessagesType.PRIMARY
      } else if (channelFolder.type === ChannelFoldersType.UNKNOWN) {
        return MessagesType.OTHER
      }
    }
  }

  return MessagesType.PRIMARY
}

export const goToChannel = (
  history: History,
  channelId: string,
  folderType: MessagesType,
  params?: GoToChannelParams
): void => {
  const route: string = params?.groupUuid ?
    `${BASE_MESSAGES_URL}/${folderType}/${params.groupUuid}/${channelId}` :
    `${BASE_MESSAGES_URL}/${folderType}/${channelId}`

  if (params?.currentPath !== undefined && route !== params.currentPath) {
    if (params.actionBeforeRedirect !== undefined) {
      params.actionBeforeRedirect()
    }
    history.push(route)
  } else if (params?.currentPath === undefined) {
    if (params?.actionBeforeRedirect !== undefined) {
      params.actionBeforeRedirect()
    }
    history.push(route)
  }
}
