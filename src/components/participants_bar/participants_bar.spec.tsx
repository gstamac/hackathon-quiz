import React from 'react'
import { ParticipantsBar } from '.'
import { ParticipantsBarProps } from './interfaces'
import { act, cleanup, render, RenderResult, userEvent } from '../../../tests/test_utils'

describe('Participants Bar Component', () => {

  const removeFromParticipantsMock: jest.Mock = jest.fn()

  const participantsBarProperties: ParticipantsBarProps = {
    participants: [{
      gidName: 'participant name',
      gidUuid: 'participant uuid',
      imageUrl: 'participant image',
    }],
    removeFromParticipants: removeFromParticipantsMock,
  }

  let renderResult: RenderResult

  beforeEach(() => {
    act(() => {
      renderResult = render(<ParticipantsBar {...participantsBarProperties} />)
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('should render the Participants Bar Component properly', () => {
    const participantsBar: Element = renderResult.getByTestId('participants-bar')
    const participant: Element = renderResult.getByText('participant name')
    const removeButton: Element = renderResult.getByAltText('remove item')

    expect(participantsBar.children).toHaveLength(1)
    expect(participant).toBeDefined()
    expect(removeButton).toBeDefined()
  })

  it('should call removeFromParticipants function when user clicks on the remove button', () => {
    const removeButton: Element = renderResult.getByAltText('remove item')

    act(() => {
      userEvent.click(removeButton)
    })

    expect(removeFromParticipantsMock).toHaveBeenCalled()
  })
})
