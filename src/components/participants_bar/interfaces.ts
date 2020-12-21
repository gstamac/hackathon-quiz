import { GidUUID, Participant } from '../../store/interfaces'

export interface ParticipantsBarProps {
  participants: (Participant|undefined)[]
  removeFromParticipants: (gidUuid: GidUUID) => void
}
