import React from 'react'
import { Header } from '.'
import { mainTheme } from '../../assets/themes'
import { MuiThemeProvider } from '@material-ui/core/styles'
import * as auth from '../auth'
import * as utils from '../../utils'
import userEvent from '@testing-library/user-event'
import { render, RenderResult, cleanup, act } from '../../../tests/test_utils'

jest.mock('../auth')
jest.mock('../../utils')

const HeaderComponent: React.FC = () => (
  <MuiThemeProvider theme={mainTheme}>
    <Header />
  </MuiThemeProvider>
)

const getRenderResult = (): RenderResult => render(<HeaderComponent />)

describe('Header element', () => {
  const validateTokenMock: jest.Mock = jest.fn()
  const pushToMock: jest.Mock = jest.fn()
  const redirectToSignUpMock: jest.Mock = jest.fn()

  let renderResult: RenderResult

  beforeEach(() => {
    (auth.validateToken as jest.Mock) = validateTokenMock;
    (utils.pushTo as jest.Mock) = pushToMock;
    (utils.redirectToSignUp as jest.Mock) = redirectToSignUpMock
  })

  afterEach(() => {
    jest.resetAllMocks()
    cleanup()
  })

  it('Should render header component properly', () => {
    validateTokenMock.mockReturnValue(false)

    renderResult = getRenderResult()

    const headerElement: Element = renderResult.getByTestId('header')
    const buttonElements: Element[] = renderResult.getAllByRole('button')
    const logoElement: Element = renderResult.getByAltText('GlobaliD small icon')

    expect(headerElement).not.toBeUndefined()
    expect(buttonElements).toHaveLength(2)
    expect(logoElement).not.toBeUndefined()
  })

  it('Should redirect user to the auth page', async () => {
    validateTokenMock.mockReturnValue(false)

    renderResult = getRenderResult()

    const buttonElements: Element[] = renderResult.getAllByRole('button')

    await act(async () => {
      userEvent.click(buttonElements[1])
    })

    expect(pushToMock).toHaveBeenCalled()
  })

  it('Should redirect user to the sign up page', async () => {
    validateTokenMock.mockReturnValue(false)

    renderResult = getRenderResult()

    const buttonElements: Element[] = renderResult.getAllByRole('button')

    await act(async () => {
      userEvent.click(buttonElements[0])
    })

    expect(redirectToSignUpMock).toHaveBeenCalled()
  })
})
