import { App, AppType, Type } from '@globalid/attestations-types'
import { GroupResponse, VerificationResponse, CreateVerificationRequestBody } from '@globalid/group-service-sdk'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { aes, hmac, rsa, util } from 'globalid-crypto'
import { v4 } from 'uuid'
import { AES_SECRET_SIZE } from '../../constants'
import { GeneralObject } from '../../utils/interfaces'
import { RequestedGroupAttestation } from '../api/interfaces'
import { CustomValue, GroupIssuedVerificationPII, RootHash, RootHashes } from './interfaces'

export const createGroupVerificationRequestBody = async (
  app: App.Model,
  publicEncryptionKey: string,
  groupVerificationType: VerificationResponse,
  issuingMember: PublicIdentity,
  issuingGroup: GroupResponse,
  attestee: PublicIdentity,
  data: CustomValue[],
): Promise<CreateVerificationRequestBody> => {

  const piiValue: GroupIssuedVerificationPII = {
    issuing_member_gid_name: issuingMember.gid_name,
    issuing_member_gid_uuid: issuingMember.gid_uuid,
    issuing_group_gid_uuid: issuingGroup.gid_uuid,
    issuing_group_gid_name: issuingGroup.gid_name,
    group_verification_type_uuid: groupVerificationType.uuid,
    group_verification_type_name: groupVerificationType.name,
    group_verification_type_description: groupVerificationType.description,
    group_verification_category: groupVerificationType.category,
    data,
  }

  const cryptoMaterial: CreateVerificationRequestBody = {
    app_uuid: app.uuid,
    root_hashes: {},
    root_passwords: {},
    salts: {},
    pii: '',
    pii_pass: '',
    tracking_id: v4(),
    attestee_uuid: attestee.gid_uuid,
    attestations: [],
  }

  const appTypes: AppType.Model[] | undefined = app.app_types

  if (appTypes === undefined) {
    throw new Error('NO_APP_TYPES')
  }

  return generateRootHashesForAppTypes(
    appTypes,
    app.agency_uuid,
    cryptoMaterial,
    attestee.public_encryption_key,
    publicEncryptionKey,
    JSON.stringify(piiValue),
    groupVerificationType.name
  )
}

// eslint-disable-next-line max-lines-per-function
const generateRootHashesForAppTypes = async (
  appTypes: AppType.Model[],
  appUUID: string,
  cryptoMaterial: CreateVerificationRequestBody,
  identityPublicEncryptionKey: string,
  attestationPublicEncryptionKey: string,
  piiValue: string,
  publicData: string,
): Promise<CreateVerificationRequestBody> => {
  const tempRootHashes: RootHashes = {}
  const tempPasswords: RootHashes = {}
  const tempSalts: RootHashes = {}
  const attestations: RequestedGroupAttestation[] = []
  const pii: GeneralObject<string> = {}

  const appTypeChain: Promise<void>[] = appTypes.map(async (appType: AppType.Model) => {
    if (appType.type === undefined) {
      return
    }

    const typeOptions: Type.Model = appType.type

    if (!Object.keys(tempRootHashes).includes(typeOptions.type)) {
      tempRootHashes[typeOptions.type] = []
    }

    if (!Object.keys(tempPasswords).includes(typeOptions.type)) {
      tempPasswords[typeOptions.type] = []
    }

    if (!Object.keys(tempSalts).includes(typeOptions.type)) {
      tempSalts[typeOptions.type] = []
    }

    for (let i: number = 0; i < appType.max_att_number; i += 1) {
      const rootHash: RootHash
         = await generateRootHash(appUUID, typeOptions.type, identityPublicEncryptionKey, `${cryptoMaterial.tracking_id}`)

      const dataHash: string = await hmac.sha512(piiValue, rootHash.salt)

      const attestation: RequestedGroupAttestation = {
        uuid: v4(),
        type: typeOptions.type,
        related_attestations: '',
        data_hash: dataHash,
        public_attestor_note: '',
        public_data: publicData,
        salt_idx: i,
      }

      pii[attestation.uuid] = piiValue
      attestations.push(attestation)
      tempRootHashes[rootHash.appType].push(rootHash.rootHash)
      tempPasswords[rootHash.appType].push(rootHash.password)
      tempSalts[rootHash.appType].push(rootHash.salt)
    }
  })

  await Promise.all(appTypeChain)

  cryptoMaterial.root_hashes = tempRootHashes
  cryptoMaterial.root_passwords = tempPasswords
  cryptoMaterial.salts = tempSalts
  cryptoMaterial.attestations = attestations

  if (Object.keys(cryptoMaterial.root_hashes).length === 0 &&
    Object.keys(cryptoMaterial.root_passwords).length === 0 &&
    Object.keys(cryptoMaterial.salts).length === 0 &&
    Object.keys(pii).length === 0 &&
    attestations.length === 0
  ) {
    throw new Error('ERR_FAILED_GENERATING_ROOT_HASHES')
  }

  const randomPIIPass: string = util.bytesToHex(await util.randomBytes(AES_SECRET_SIZE))

  cryptoMaterial.pii_pass = await rsa.encrypt(attestationPublicEncryptionKey, randomPIIPass)
  cryptoMaterial.pii = await aes.encrypt(JSON.stringify(pii), randomPIIPass)

  return cryptoMaterial
}

const generateRootHash = async (
  agencyUUID: string,
  appType: string,
  encryptionKey: string,
  trackingId: string
): Promise<RootHash> => {
  try {
    const randomPass: string = util.bytesToHex(await util.randomBytes(AES_SECRET_SIZE))

    const rootHash: string = await hmac.sha512(`${appType}-${agencyUUID}`, randomPass)

    const salt: string = await hmac.sha512(`${trackingId}`, rootHash)

    const password: string = await rsa.encrypt(encryptionKey, randomPass)

    return {
      appType,
      password,
      rootHash,
      salt,
    }
  } catch (error) {
    throw new Error('ERR_FAILED_GENERATING_ROOT_HASH')
  }
}
