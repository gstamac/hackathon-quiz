import React from 'react'
import { cleanup, act } from '@testing-library/react'
import { Wallet } from './wallet'
import { RenderResult, render } from '../../../tests/test_utils'
import { getString } from '../../utils'

describe('Wallet', () => {
  let renderResult: RenderResult

  beforeEach(async () => {
    await act(async () => {
      renderResult = render(<Wallet />)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render the wallet component', () => {
    const background_icon: Element | null = renderResult.getByAltText('Wallet background icon')
    const coming_soon_text: Element | null = renderResult.getByText(getString('wallet-coming-soon'))
    const description_text: Element | null = renderResult.getByText(getString('wallet-description'))

    expect(background_icon).not.toBeNull()
    expect(coming_soon_text).not.toBeNull()
    expect(description_text).not.toBeNull()
  })
})
