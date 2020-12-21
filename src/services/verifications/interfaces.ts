import { GeneralObject } from '../../utils/interfaces'

export type RootHashes = GeneralObject<string[]>

export interface RootHash {
  appType: string
  password: string
  rootHash: string
  salt: string
}

export interface GroupIssuedVerificationPII {
  issuing_member_gid_name: string
  issuing_member_gid_uuid: string
  issuing_group_gid_uuid: string
  issuing_group_gid_name: string
  group_verification_type_uuid: string
  group_verification_type_name: string
  group_verification_type_description: string
  group_verification_category: string
  data: CustomValue[]
}

export interface CustomValue {
  label: string
  value: string
}
