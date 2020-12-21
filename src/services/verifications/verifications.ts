import { getAgencies } from './../api/attestations_api'
import { Agency, App } from '@globalid/attestations-types'
import { GroupResponse, VerificationResponse, CreateVerificationRequestBody, CreatedGroupVerificationRequest } from '@globalid/group-service-sdk'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { GROUP_ISSUED_VERIFICATION_AGENCY_UUID, GROUP_ISSUED_VERIFICATION_APP_UUID } from '../../constants'
import { getVerificationPubKey } from '../api/attestations_api'
import { createVerificationRequest } from '../api/groups_api'
import { createGroupVerificationRequestBody } from './crypto'
import { CustomValue } from './interfaces'

export const issueGroupVerification = async (
  issuingMember: PublicIdentity,
  issuingGroup: GroupResponse,
  attestee: PublicIdentity,
  groupVerificationType: VerificationResponse,
  data: CustomValue[],
): Promise<CreatedGroupVerificationRequest> => {
  const verificationEncryptionKey = await getVerificationPubKey()

  const agencies: Agency.Model[] = await getAgencies()

  const agency: Agency.Model | undefined = agencies.find(a => a.uuid === GROUP_ISSUED_VERIFICATION_AGENCY_UUID)

  if (agency?.apps === undefined) {
    throw new Error('AGENCY_HAS_NO_APPS')
  }

  const apps: App.Model[] = agency.apps.filter((a: App.Model) => a.uuid === GROUP_ISSUED_VERIFICATION_APP_UUID)

  if (apps.length === 0){
    throw new Error('AGENCY_APP_MISMATCH')
  }

  const verificationRequest: CreateVerificationRequestBody
   = await createGroupVerificationRequestBody(
     apps[0],
     verificationEncryptionKey.encryption_public_key,
     groupVerificationType,
     issuingMember,
     issuingGroup,
     attestee,
     data,
   )

  return createVerificationRequest(
    verificationRequest,
    issuingGroup.gid_uuid
  )
}
