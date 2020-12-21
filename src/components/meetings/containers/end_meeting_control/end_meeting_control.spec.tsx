import React from 'react'
import { mockComponentWithChildren, render } from '../../../../../tests/test_utils'
import { cleanup, RenderResult } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { EndMeetingControl } from '.'
import { getString } from '../../../../utils'

const mockUseMeetingManager: jest.Mock = jest.fn()

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ControlBarButton: mockComponentWithChildren('ControlBarButton'),
  Phone: mockComponentWithChildren('Phone'),
  Modal: mockComponentWithChildren('Modal'),
  ModalBody: mockComponentWithChildren('ModalBody'),
  ModalHeader: mockComponentWithChildren('ModalHeader '),
  ModalButton: mockComponentWithChildren('ModalButton '),
  ModalButtonGroup: mockComponentWithChildren('ModalButtonGroup '),
  MeetingProvider: mockComponentWithChildren('MeetingProvider'),
  useMeetingManager: () => mockUseMeetingManager(),
}),)

describe('EndMeetingControl tests', () => {
  let renderResult: RenderResult
  const onMeetingEndMock: jest.Mock = jest.fn()

  const renderComponent = (): void => {
    act(() => {
      renderResult = render(
        <EndMeetingControl onMeetingEnd={onMeetingEndMock}/>
      )
    })
  }

  afterEach(() => {
    cleanup()
  })

  it('Should render only ControlBarButton when Modal is closed', () => {
    renderComponent()

    const controlBarButton: Element = renderResult.getByTestId('ControlBarButton')
    const modal: Element | null = renderResult.queryByTestId('Modal')

    expect(controlBarButton).toBeDefined()
    expect(modal).toBeDefined()
  })

  it('Should render component with Modal', () => {
    const realUseState = React.useState

    jest.spyOn(React, 'useState').mockImplementationOnce(() => realUseState(true))

    renderComponent()

    const modal: Element = renderResult.getByTestId('Modal')
    const modalHeader: Element = renderResult.getByTestId('ModalHeader')
    const modalBody: Element = renderResult.getByTestId('ModalBody')
    const modalButtonGroup: Element = renderResult.getByTestId('ModalButtonGroup')
    const modalText: Element = renderResult.getByText(getString('leave-meeting-description'))

    expect(modal).toBeDefined()
    expect(modalHeader).toBeDefined()
    expect(modalBody).toBeDefined()
    expect(modalButtonGroup).toBeDefined()
    expect(modalText).toBeDefined()
  })

  it('Should call useMeetingManager hook', () => {
    renderComponent()

    expect(mockUseMeetingManager).toHaveBeenCalled()
  })
})
