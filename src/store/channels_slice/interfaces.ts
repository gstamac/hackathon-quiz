export type NonServiceChannelTypes = 'PERSONAL' | 'MULTI' | 'GROUP'

export interface ChannelQueryParams {
  folder_id?: string | null
  groupUuid?: string
  channelTypes: NonServiceChannelTypes[]
}

export interface FetchCountersParams {
  channel_id: string
  group_uuid?: string
}
