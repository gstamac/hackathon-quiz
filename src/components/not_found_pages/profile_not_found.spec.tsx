import React from 'react'
import { cleanup } from '@testing-library/react'
import { ProfileNotFound } from '.'
import { RenderResult, render, userEvent } from '../../../tests/test_utils'
import * as utils from '../../utils/router_utils'
import { act } from 'react-dom/test-utils'
import { getString } from '../../utils'
import * as auth from '../../components/auth'

jest.mock('../../utils/router_utils')
jest.mock('../../components/auth')

const getRenderResult = (): RenderResult => render(<ProfileNotFound isLoggedIn={false}/>)

describe('Profile Not Found', () => {
  let renderResult: RenderResult
  const redirectToSignUpMock: jest.Mock = jest.fn()
  const validateTokenMock: jest.Mock = jest.fn()

  beforeEach(() => {
    (utils.redirectToSignUp as jest.Mock) = redirectToSignUpMock
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render profile not found component', () => {
    (auth.validateToken as jest.Mock) = validateTokenMock.mockReturnValue(true)

    renderResult = getRenderResult()

    const background_icon: Element | null = renderResult.getByAltText('Profile not found background icon')
    const title: Element | null = renderResult.getByText(getString('profile-not-found-title'))

    expect(background_icon).not.toBeNull()
    expect(title).not.toBeNull()
  })

  it('Should redirect to register page when user clicks the Claim_this_GlobaliD_name button', () => {
    (auth.validateToken as jest.Mock) = validateTokenMock.mockReturnValue(false)

    renderResult = getRenderResult()

    const register_button: Element | null = renderResult.getByText(getString('profile-not-found-button'))

    act(() => {
      userEvent.click(register_button)
    })

    expect(redirectToSignUpMock).toHaveBeenCalled()
  })
})
