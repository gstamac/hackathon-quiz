import { useDispatch } from 'react-redux'
import { ThunkDispatch } from 'RootType'
import { BASE_MESSAGES_URL } from '../../../constants'
import { ToggledStateResult } from '../../../hooks/interfaces'
import { useToggledState } from '../../../hooks/use_toggled_state'
import { MeetingResponse } from '../../../services/api/interfaces'
import { initiateMeeting } from '../../../store/meetings_slice'
import { UseVideoCallResponse } from './interfaces'
import { ChannelIdProps } from './../../interfaces'

export const useInitVideoCall = ({channelId}: ChannelIdProps): UseVideoCallResponse => {

  const dispatch: ThunkDispatch = useDispatch()

  const initiateVideoCall = async (): Promise<void> => {
    const meeting: MeetingResponse | undefined
     = <MeetingResponse | undefined> (await dispatch(initiateMeeting({ channelId }))).payload

    if (meeting !== undefined) {
      window.open(`${BASE_MESSAGES_URL}/${channelId}/meetings/${meeting.meetingId}`)
    }
  }

  const [isInitializingVideoCall, initiateVideoCallCallback]: ToggledStateResult
   = useToggledState({ initialState: false, command: initiateVideoCall })

  return {
    initiateVideoCallCallback,
    isInitializingVideoCall,
  }
}

