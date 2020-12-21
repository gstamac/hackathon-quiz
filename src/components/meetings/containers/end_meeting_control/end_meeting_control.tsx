import React from 'react'
import {
  ControlBarButton,
  Phone,
  Modal,
  ModalBody,
  ModalHeader,
  ModalButton,
  ModalButtonGroup,
  useMeetingManager,
  MeetingManager,
} from 'amazon-chime-sdk-component-library-react'
import { StyledP } from './end_meeting_control.styled'
import { getString } from '../../../../utils'
import { MeetingEndCallback } from '../../interfaces'

export const EndMeetingControl: React.FC<MeetingEndCallback> = ({ onMeetingEnd }) => {
  const [showModal, setShowModal] = React.useState<boolean>(false)

  const meetingManager: MeetingManager = useMeetingManager()
  const toggleModal = (): void => setShowModal(!showModal)

  const leaveMeeting = async (): Promise<void> => {
    await meetingManager.leave()
    onMeetingEnd()
  }

  return (
    <>
      <ControlBarButton icon={<Phone />} onClick={toggleModal} label={getString('meeting-leave')} />
      {showModal && (
        <Modal size='md' onClose={toggleModal} rootId='modal-root'>
          <ModalHeader title={getString('leave-meeting')} />
          <ModalBody>
            <StyledP>
              {getString('leave-meeting-description')}
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[
              <ModalButton
                key={'leave'}
                onClick={leaveMeeting}
                variant='primary'
                label={getString('leave-meeting')}
                closesModal
              />,
              <ModalButton key='cancel' variant='secondary' label={getString('button-text-cancel')} closesModal />,
            ]}
          />
        </Modal>
      )}
    </>
  )
}
