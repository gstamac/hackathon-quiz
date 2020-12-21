import React from 'react'
import { Messages } from './messages'
import { RenderResult, act, render } from '../../../tests/test_utils'
import { getString } from '../../utils'
import { MessagesType } from '../messages/interfaces'

describe('Messages landing page', () => {
  let renderResult: RenderResult

  it('Should render Messages component', async () => {
    await act(async () => {
      renderResult = render(<Messages type={MessagesType.PRIMARY}/>)
    })

    const background_pic: Element | null = renderResult.getByAltText('Messages background icon')
    const messages_text: Element | null = renderResult.getByText(getString('messages-text'))

    expect(background_pic).not.toBeNull()
    expect(messages_text).not.toBeNull()
  })
})
