import { getValidToken } from '../../components/auth'
import {
  GetChannelsQuery,
  ChannelsWithPaginationMeta,
  ChannelWithParticipants,
  getChannels as getChannelsSdk,
  getChannel as getChannelSdk,
  CountersWithPaginationMeta,
  getCounters,
  AddChannelWithDevicesBody,
  createMultiDeviceChannel,
  getFolders as getFoldersSdk,
  GetFoldersQuery,
  FoldersWithPaginationMeta,
  searchByChannels,
  SearchByChannelsBody,
  SearchChannelsQuery,
  updateChannel as updateChannelSdk,
  LeaveChannelResponse,
  leaveChannel,
  FileToken,
  getChannelFileToken,
  GetCountersQuery,
  createChannel as createChannelSDK,
  AddChannelBody,
} from '@globalid/messaging-service-sdk'
import { Identity } from '@globalid/identity-namespace-service-sdk'
import axios, { AxiosResponse } from 'axios'
import { deviceKeyManager } from '../../init'
import { EditChannelDetails } from '../../components/global/dialogs/edit_channel_dialog'
import { API_BASE_URL } from '../../constants'
import { GetChannelParams } from './interfaces'

export const getFolders = async (
  queryParams: GetFoldersQuery
): Promise<FoldersWithPaginationMeta> => {
  const token: string = await getValidToken()

  return getFoldersSdk(token, queryParams)
}

export const getChannels = async (
  queryParams: GetChannelsQuery
): Promise<ChannelsWithPaginationMeta> => {
  const token: string = await getValidToken()

  return getChannelsSdk(token, queryParams)
}

export const getChannel = async (channelId: string, params?: GetChannelParams): Promise<ChannelWithParticipants> => {
  const token: string = await getValidToken()

  const deviceId: string | undefined = params?.encrypted === true ? deviceKeyManager.getDeviceId() : undefined

  return getChannelSdk(token, { channel_id: channelId }, { device_id: deviceId })
}

export const getChannelMembers = async (uuids: string[]): Promise<Identity[]> => {

  const response: AxiosResponse<Identity[]> = await axios.post<Identity[]>(
    `${API_BASE_URL}/v1/identities/list`,
    { gid_uuid: uuids }
  )

  return response.data
}

export const getChannelCounters = async (
  query: GetCountersQuery
): Promise<CountersWithPaginationMeta> => {
  const token: string = await getValidToken()

  return getCounters(token, query)
}

export const createChannelE2EE = async (body: AddChannelWithDevicesBody): Promise<ChannelWithParticipants> => {
  const token: string = await getValidToken()

  return createMultiDeviceChannel(token, body)
}

export const createChannel = async (body: AddChannelBody): Promise<ChannelWithParticipants> => {
  const token: string = await getValidToken()

  return createChannelSDK(token, body)
}

export const searchChannels = async (
  params: SearchChannelsQuery,
  body: SearchByChannelsBody
): Promise<ChannelsWithPaginationMeta> => {
  const token: string = await getValidToken()

  return searchByChannels(token, params, body)
}

export const updateChannel = async (
  channel_id: string,
  body: EditChannelDetails,
): Promise<ChannelWithParticipants> => {
  const token: string = await getValidToken()

  return updateChannelSdk(token, { channel_id }, body)
}

export const leaveFromChannel = async (channel_id: string): Promise<LeaveChannelResponse> => {
  const token: string = await getValidToken()

  return leaveChannel(token, { channel_id })
}

export const getFileToken = async (channel_id: string): Promise<FileToken> => {
  const token: string = await getValidToken()

  return getChannelFileToken(token, { channel_id })
}
