import React from 'react'
import { cleanup, RenderResult } from '@testing-library/react'
import { render, act } from '../../../../../tests/test_utils'
import { InfoMessageCard } from './info_message_card'
import privateIcon from '../../../../assets/icons/private-icon-yellow.svg'

describe('InfoMessageCard', () => {
  let renderResult: RenderResult

  const defaultText: string = 'This is infor message'
  const defaultLinkLabel: string = 'This is a link'
  const defaultLink: string = '/app/link'

  const renderInfoMessage = (): void => {
    act(() => {
      renderResult = render(<InfoMessageCard icon={privateIcon} text={defaultText} linkText={defaultLinkLabel} link={defaultLink} />)
    })
  }

  beforeEach(() => {
    renderInfoMessage()
  })

  afterEach(() => {
    cleanup()
  })

  it('Should render info message card with icon, text and link', () => {
    const icon: Element = renderResult.getByRole('img')

    expect(icon).toBeDefined()

    const text: Element = renderResult.getByText(defaultText)

    expect(text).toBeDefined()

    const link: Element = renderResult.getByText(defaultLinkLabel)

    expect(link).toBeDefined()
  })
})
