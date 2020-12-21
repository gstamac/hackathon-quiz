import React from 'react'
import { render, RenderResult, cleanup, userEvent, act } from '../../../../../tests/test_utils'
import { DisconnectDialog } from './disconnect_dialog'
import { mainTheme } from '../../../../assets/themes'
import { MuiThemeProvider } from '@material-ui/core/styles'

describe('Disconnect Modal', () => {
  const handleOpenState: jest.Mock = jest.fn()
  let renderResult: RenderResult
  let disconnectModal: Element
  let closeIcon: Element

  const modalComponent = (
    <MuiThemeProvider theme={mainTheme}>
      <DisconnectDialog open handleOpenState={handleOpenState} />
    </MuiThemeProvider>
  )

  beforeEach(() => {
    act(() => {
      renderResult = render(modalComponent)
    })
    disconnectModal = renderResult.getByRole('dialog')
    closeIcon = renderResult.getByAltText('close')
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render disconnect modal', () => {
    expect(disconnectModal).not.toBeUndefined()
  })

  it('Should render close icon', () => {
    expect(closeIcon).not.toBeUndefined()
  })

  it('Should call handleClick function when close icon is clicked', () => {
    act(() => {
      userEvent.click(closeIcon)
    })
    expect(handleOpenState).toHaveBeenCalled()
  })
})
