import React from 'react'
import { render, act, RenderResult, cleanup, userEvent } from '../../../../../tests/test_utils'
import { GetAppDialog } from './get_app_dialog'
import { mainTheme } from '../../../../assets/themes'
import { MuiThemeProvider } from '@material-ui/core/styles'
import * as muiCore from '@material-ui/core'

jest.mock('@material-ui/core', () => {
  const muiCoreModule: Object = jest.requireActual('@material-ui/core')

  return ({
    ...muiCoreModule,
    useMediaQuery: jest.fn().mockReturnValue(false),
  })
})

describe('Get App Modal', () => {
  const handleOpenState: jest.Mock = jest.fn()
  let renderResult: RenderResult
  let getAppModal: Element
  let closeIcon: Element

  const modalComponent = (
    <MuiThemeProvider theme={mainTheme}>
      <GetAppDialog open handleOpenState={handleOpenState}/>
    </MuiThemeProvider>
  )

  beforeEach(() => {
    act(() => {
      renderResult = render(modalComponent)
    })
    getAppModal = renderResult.getByRole('dialog')
    closeIcon = renderResult.getByAltText('close')
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render the getApp modal', () => {
    expect(getAppModal).not.toBeUndefined()
    expect(muiCore.useMediaQuery).toHaveBeenCalled()
  })

  it('Should render the close icon', () => {
    expect(closeIcon).not.toBeUndefined()
  })

  it('Should call handleClick function when close icon is clicked', () => {
    act(() => {
      userEvent.click(closeIcon)
    })
    expect(handleOpenState).toHaveBeenCalled()
  })

  it('Should render the QR code image for getting the app', () => {

    const qrCode = renderResult.getByAltText('App QR Code')

    expect(qrCode).not.toBeUndefined()
  })

  describe('mobile view', () => {
    beforeEach(() => {
      (muiCore.useMediaQuery as jest.Mock).mockReturnValue(true)
    })
    it('Should render the download the app button', () => {

      act(() => {
        renderResult = render(modalComponent)
      })
      const button = renderResult.getByText('Get the app')

      expect(button).not.toBeNull()
    })
  })
})
