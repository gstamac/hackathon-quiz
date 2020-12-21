import { useCardViewMessage } from './use_card_view_message'
import { renderHook, RenderHookResult, act, cleanup } from '@testing-library/react-hooks'
import { UseCardViewMessageHookResult } from './interfaces'
import { ButtonState } from 'globalid-react-ui'
import * as groupApi from '../../../../../services/api/groups_api'
import { cardViewMessageRejectButton, cardViewMessageApproveButton, meetingInvitationMessageCard } from '../../../../../../tests/mocks/messages_mock'
import { Provider } from 'react-redux'
import { store } from '../../../../../store'
import React, { PropsWithChildren } from 'react'
import { acceptInvitationResponseMock, rejectInvitationResponseMock } from '../../../../../../tests/mocks/group_mocks'
import * as meetingHelpers from './meeting_helpers'

const mockHistory: jest.Mock = jest.fn()

jest.mock('react-router-dom', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...jest.requireActual('react-router-dom') as {},
  useHistory: () => mockHistory,
}))
jest.mock('../../../../../services/api/groups_api')

describe('useCardViewMessage', () => {
  let renderResult: RenderHookResult<undefined, UseCardViewMessageHookResult>
  const approveInvitationMock: jest.Mock = jest.fn()
  const rejectInvitationMock: jest.Mock = jest.fn()
  const handleJoinMeetingMock: jest.Mock = jest.fn()
  const channelId: string = 'channelId'

  beforeEach(() => {
    (groupApi.approveInvitation as jest.Mock) = approveInvitationMock.mockResolvedValue(acceptInvitationResponseMock);
    (groupApi.rejectInvitation as jest.Mock) = rejectInvitationMock.mockResolvedValue(rejectInvitationResponseMock);
    (meetingHelpers.handleMeetingButtonClick as jest.Mock) = handleJoinMeetingMock
  })

  afterEach(async () => {
    await cleanup()
    jest.clearAllMocks()
  })

  const renderChatHook = async (): Promise<void> => {
    await act(async () => {
      renderResult = renderHook(useCardViewMessage, {
        wrapper: ({ children }: PropsWithChildren<{}>) => (
          <Provider store={store}>
            {children}
          </Provider>
        ),
        initialProps: channelId,
      })
    })
  }

  it('should return buttons default state', async () => {
    await renderChatHook()

    const result: UseCardViewMessageHookResult = renderResult.result.current

    expect(result.buttonElementsState.PRIMARY).toEqual(ButtonState.DEFAULT)
    expect(result.buttonElementsState.SECONDARY).toEqual(ButtonState.DEFAULT)
    expect(result.buttonElementsState.ADDITIONAL).toEqual(ButtonState.DEFAULT)
  })

  it('should change rejectInvitationDialogOpen accordingly', async () => {
    await renderChatHook()

    expect(renderResult.result.current.rejectInvitationDialogOpen).toEqual(false)

    await act(async () => {
      renderResult.result.current.openRejectInvitationDialog()
    })

    expect(renderResult.result.current.rejectInvitationDialogOpen).toEqual(true)

    await act(async () => {
      renderResult.result.current.closeRejectInvitationDialog()
    })

    expect(renderResult.result.current.rejectInvitationDialogOpen).toEqual(false)
  })

  it('should handle the approval of the invitation', async () => {
    await renderChatHook()

    const result: UseCardViewMessageHookResult = renderResult.result.current

    await act(async () => {
      await result.handleClickToButtons(cardViewMessageApproveButton)
    })

    expect(approveInvitationMock).toHaveBeenCalledWith('65fe5f2a-879d-4d5a-8147-d6e989a54d49')
  })

  it('should handle the rejection of the invitation', async () => {
    await renderChatHook()

    const result: UseCardViewMessageHookResult = renderResult.result.current

    await act(async () => {
      await result.handleClickToButtons(cardViewMessageRejectButton)
    })

    expect(renderResult.result.current.rejectInvitationDialogOpen).toEqual(true)

    await act(async () => {
      await result.handleRejectInvitation()
    })

    expect(rejectInvitationMock).toHaveBeenCalledTimes(1)
    expect(result.rejectInvitationDialogOpen).toEqual(false)
  })

  it('should handle accepting the invitation meeting', async () => {
    await renderChatHook()

    const result: UseCardViewMessageHookResult = renderResult.result.current

    await act(async () => {
      await result.handleClickToButtons(meetingInvitationMessageCard)
    })

    expect(handleJoinMeetingMock).toHaveBeenCalledWith(channelId, meetingInvitationMessageCard, store.dispatch)
  })
})
