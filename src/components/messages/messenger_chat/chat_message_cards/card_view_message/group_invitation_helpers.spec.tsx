import { handleRejectInvitation, handleInvitationButtonClick } from './group_invitation_helpers'
import { store } from '../../../../../store'
import { buttonAcceptTemplateMock, buttonRejectTemplateMock } from '../../../../../../tests/mocks/group_mocks'

describe('Group Invitation Helpers', () => {
  const openRejectInvitationDialogMock: jest.Mock = jest.fn()
  const closeRejectInvitationDialogMock: jest.Mock = jest.fn()
  const setInvitationUuidMock: jest.Mock = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('handleInvitationButtonClick', () => {
    it('should open the reject invitation dialog when action is REJECT', async () => {
      await handleInvitationButtonClick(
        buttonRejectTemplateMock,
        setInvitationUuidMock,
        store.dispatch,
        openRejectInvitationDialogMock,
      )

      expect(openRejectInvitationDialogMock).toHaveBeenCalled()
    })

    it('should not open the reject invitation dialog when action is APPROVE', async () => {
      await handleInvitationButtonClick(
        buttonAcceptTemplateMock,
        setInvitationUuidMock,
        store.dispatch,
        openRejectInvitationDialogMock,
      )

      expect(openRejectInvitationDialogMock).not.toHaveBeenCalled()
    })
  })

  describe('handleRejectInvitation', () => {
    it('should close the dialog after rejecting invitation', async () => {
      await handleRejectInvitation(
        'invitationUuid',
        store.dispatch,
        closeRejectInvitationDialogMock,
      )

      expect(closeRejectInvitationDialogMock).toHaveBeenCalled()
    })
  })
})
