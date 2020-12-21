import { Attendee, MediaPlacement } from '@globalid/messaging-service-sdk'

export interface ConsentStatus {
  redirect_url: string | null
  request_id: string
  status: string
  validTo: string
}

export interface ResendMessageMeta {
  resending: boolean
  uuid: string
}

export interface UpdatedIdentityValues {
  display_name?: string
  description?: string
}

export type IdentityRequestModelStatus = 'approved' | 'pending' | 'rejected'

export interface IdentityStatusArgs {
  status?: IdentityRequestModelStatus
  identity_update_request_uuid: string
  gid_uuid: string
  access_token: string
}

export type ValidateRequestStatusFunction<T> = (
  args: IdentityStatusArgs,
) => Promise<T>

export enum GrantTypes {
  implicit = 'implicit',
  password = 'password',
  authorization_code = 'authorization_code',
  refresh_token = 'refresh_token',
}

export interface AccessTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface GetChannelParams {
  encrypted?: boolean
}

export type MeetingResponse = {
  meetingId: string | null
  mediaRegion: string
  mediaPlacement: MediaPlacement | null
  attendee: Attendee
}

export interface RequestedGroupAttestation {
  uuid: string
  type: string
  public_attestor_note?: string
  public_data?: string
  related_attestations?: string
  data_hash: string
  salt_idx: number
}
