import { MessageTemplateButtonItem } from '@globalid/messaging-service-sdk'
import { getString } from '../../../../../utils'
import { MEETING_ID_REGEX } from '../../../../auth'
import { setToastError } from 'globalid-react-ui'
import { ThunkDispatch } from '../../../../../store'
import { BASE_MESSAGES_URL } from '../../../../../constants'

export const handleMeetingButtonClick = (
  channelId: string,
  button: MessageTemplateButtonItem,
  dispatch: ThunkDispatch,
): void => {
  const meetingId: string | undefined = MEETING_ID_REGEX.exec(button.cta_link)?.[1]

  if (!meetingId) {
    dispatch(setToastError({
      title: getString('join-meeting-failure-title'),
      message: getString('join-meeting-toast-error-description'),
    }))
  }

  else {
    window.open(`${BASE_MESSAGES_URL}/${channelId}/meetings/${meetingId}`)
  }
}
