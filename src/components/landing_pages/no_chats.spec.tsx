import React from 'react'
import { cleanup, act } from '@testing-library/react'
import { NoChats } from './no_chats'
import { RenderResult, render } from '../../../tests/test_utils'
import { getString } from '../../utils'

describe('No Chats Component', () => {
  let renderResult: RenderResult

  beforeEach(async () => {
    await act(async () => {
      renderResult = render(<NoChats />)
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('Should render the no chats component', () => {
    const backgroundIcon: Element = renderResult.getByAltText('Background icon')
    const titleText: Element = renderResult.getByText(getString('no-chats-title'))
    const descriptionText: Element = renderResult.getByText(getString('no-chats-description'))

    expect(backgroundIcon).not.toBeNull()
    expect(titleText).not.toBeNull()
    expect(descriptionText).not.toBeNull()
  })
})
