import React from 'react'
import { ParticipantsHeader } from '.'
import { ParticipantsHeaderProps } from './interfaces'
import { act, cleanup, render, RenderResult } from '../../../tests/test_utils'

describe('Participants Header Component', () => {
  const headerProperties: ParticipantsHeaderProps = {
    participantsCount: 6,
  }

  let renderResult: RenderResult

  beforeEach(() => {
    act(() => {
      renderResult = render(<ParticipantsHeader {...headerProperties} />)
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('should render the Participants Header Component properly', () => {
    const header: Element = renderResult.getByTestId('participants-header')
    const title: Element = renderResult.getByText('New message')

    expect(header).toBeDefined()
    expect(title).toBeDefined()
  })

  it('should show the right number of participants', () => {
    const participants: Element = renderResult.getByText('6/36')

    expect(participants).toBeDefined()
  })
})
