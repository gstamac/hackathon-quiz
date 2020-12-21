import { meetingInvitationMessageCard } from '../../../../../../tests/mocks/messages_mock'
import { handleMeetingButtonClick } from './meeting_helpers'
import { store } from '../../../../../store'
import { BASE_MESSAGES_URL } from '../../../../../constants'

describe('handleMeetingButtonClick', () => {
  const openMock: jest.Mock = jest.fn()
  const channelId: string = 'channelId'

  beforeAll(() => {
    window.open = openMock
  })

  it('should redirect user to the meeting provided in the invitation', () => {
    handleMeetingButtonClick(channelId, meetingInvitationMessageCard, store.dispatch)

    expect(openMock).toHaveBeenCalledWith(`${BASE_MESSAGES_URL}/${channelId}/meetings/95`)
  })

  it('should not redirect user to the meeting when meeting_id is not provided', () => {
    const currentDirectory: string = window.location.href

    handleMeetingButtonClick(channelId, { ...meetingInvitationMessageCard, cta_link: 'https://link.dev.global.id/wrong_url' }, store.dispatch)

    expect(openMock).not.toHaveBeenCalledWith(currentDirectory)
  })
})
