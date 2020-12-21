import { Folder } from '@globalid/messaging-service-sdk'
import { Dispatch } from '@reduxjs/toolkit'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'RootType'
import { fetchChannels } from '../../../store/channels_slice/channels_slice'
import { getChannelArray } from '../../../store/channels_slice/helpers'
import { GetChannelsHook, FetchChannelsParams, GetChannelsHookProps } from './interfaces'
import { actionByFolder, sortChannelsByDate } from './helpers'
import _ from 'lodash'
import { ChannelFoldersType, MessagesType, PaginationMetaParams } from '../interfaces'
import { CHANNELS_PER_PAGE } from '../../../constants'

import {
  ChannelsType,
  ChannelWithParticipantsAndParsedMessage,
  ChannelType,
  ChannelWithMembers,
} from '../../../store/interfaces'
import useAsyncEffect from 'use-async-effect'

const folderTypesParamMap = new Map<MessagesType,ChannelFoldersType | undefined>([
  [MessagesType.PRIMARY, ChannelFoldersType.GENERAL],
  [MessagesType.OTHER, ChannelFoldersType.UNKNOWN],
  [MessagesType.GROUPS, undefined],
]
)

export const useGetChannelsHook = ({
  folderType,
  folders,
  groupUuid,
}: GetChannelsHookProps): GetChannelsHook => {
  const channels: ChannelsType = useSelector((root: RootState) => root.channels.channels)
  const getFolder = (): Folder => folders.filter((folderItem: Folder) => folderItem.type === folderTypesParamMap.get(folderType))[0]
  const folder: Folder | undefined = getFolder()
  const channelStoreKey: string = groupUuid !== undefined ? groupUuid : folder?.id !== undefined ? folder?.id : ChannelType.GROUP

  const isListLoadingAll = useSelector((root: RootState) => root.channels.isFetching)
  const isListLoading: boolean = isListLoadingAll[channelStoreKey ?? ''] ?? false

  const total: number = useSelector((root: RootState) => root.channels.meta[channelStoreKey]?.total ?? 0)
  const page: number = useSelector((root: RootState) => root.channels.meta[channelStoreKey]?.page ?? 0)

  const dispatch = useDispatch()

  const channelArray: ChannelWithParticipantsAndParsedMessage[] = getChannelArray(channels).map((channel: ChannelWithMembers) => channel.channel)

  const sortedArrayOfChannels: ChannelWithParticipantsAndParsedMessage[] = channelArray.sort(sortChannelsByDate)
  const initialMeta: PaginationMetaParams = {
    total,
    per_page: CHANNELS_PER_PAGE,
    page: page,
  }

  const channelFilter: string | undefined = groupUuid ?? folder?.id

  const [channelsIds, meta] = actionByFolder(folderType)(sortedArrayOfChannels, { ...initialMeta }, channelFilter)

  const channelsIdList = _.isEmpty(channelsIds) && isListLoading ? undefined : channelsIds

  const hasNextPage: boolean = channelsIdList === undefined ? false : !meta.isLastPage

  const loadNextPage = async (currentPage: number): Promise<void> => {
    const params: FetchChannelsParams = getChannelsQueryParams(folder, folderType)
    const nextPage: number = currentPage + 1

    updateChannels(dispatch, nextPage, params, groupUuid)
  }

  const handleLoadNextPage = async (): Promise<void> => {
    if (isListLoading || _.isEmpty(channelsIdList)) {
      return
    }
    await loadNextPage(page)
  }

  useAsyncEffect(async () => {
    if (meta.filteredOneOrMorePage) {
      await handleLoadNextPage()
    }
  }, [channelArray.length])

  useEffect(() => {
    if (page !== undefined && page >= 1) {
      return
    }
    const params: FetchChannelsParams = getChannelsQueryParams(folder, folderType)

    updateChannels(dispatch, 1, params, groupUuid)
  }, [folderType])

  return {
    channelsIds: channelsIdList,
    loadNextPage: handleLoadNextPage,
    hasNextPage,
    areChannelsLoading: isListLoading,
  }
}

const updateChannels = (dispatch: Dispatch<any>, page: number, params: FetchChannelsParams, groupUuid?: string): void => {
  dispatch(fetchChannels({
    ...params,
    page,
    per_page: CHANNELS_PER_PAGE,
    groupUuid,
  }))
}

const getChannelsQueryParams = (folder: Folder | undefined, folderType: MessagesType): FetchChannelsParams => {
  if (folderType === MessagesType.GROUPS) {
    return {
      channelTypes: [ChannelType.GROUP, ChannelType.MULTI, ChannelType.PERSONAL],
    }
  }

  return {
    device_id: undefined,
    folder_id: folder?.id,
    channelTypes: [ChannelType.PERSONAL, ChannelType.MULTI],
  }
}
