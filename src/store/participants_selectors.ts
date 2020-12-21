import { Identity } from '@globalid/identity-namespace-service-sdk'
import {
  GidUUID,
  Participant,
} from './interfaces'
import { getIdentityByGidUUID } from './identities_selectors'
import { RootState } from 'RootType'

export const getParticipantsByGidUUIDs = (state: RootState, gidUuids: GidUUID[]): Participant[] =>
  gidUuids.reduce<Participant[]>((participants: Participant[], gidUuid: GidUUID): Participant[] => {
    const identity: Identity | undefined = getIdentityByGidUUID(state, gidUuid)

    if (identity === undefined) {
      return participants
    }

    return [...participants, {
      gidUuid,
      gidName: identity.gid_name,
      imageUrl: identity.display_image_url,
    }]
  }, [])

