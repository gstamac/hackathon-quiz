import React from 'react'
import { act } from 'react-dom/test-utils'
import { CombinedButton } from './combined_button'
import { mainTheme } from '../../../../assets/themes'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { MobileViewContent } from './interfaces'
import { render, RenderResult, cleanup, matchMedia, userEvent } from '../../../../../tests/test_utils'

describe('Combined button', () => {
  const handleClick: jest.Mock = jest.fn()

  let renderResult: RenderResult

  const buttonComponent = (content: MobileViewContent): JSX.Element => (
    <MuiThemeProvider theme={mainTheme}>
      <CombinedButton handleClick={handleClick} icon='icon' title='title' mobileViewContent={content}/>
    </MuiThemeProvider>
  )

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Should render combined button', () => {
    act(() => {
      renderResult = render(buttonComponent(MobileViewContent.COMBINED))
    })

    const combinedButton: Element = renderResult.getByTestId('combined_button')

    expect(combinedButton).toBeDefined()
  })

  it('Should render combined button with icon and text', () => {
    act(() => {
      renderResult = render(buttonComponent(MobileViewContent.COMBINED))
    })

    const combinedButton: Element = renderResult.getByTestId('combined_button')

    expect(combinedButton).toBeDefined()
    expect(combinedButton.children).toHaveLength(2)

    const icon: Element = renderResult.getByRole('img')

    expect(icon).toBeDefined()
    const text: Element = renderResult.getByText('title')

    expect(text).toBeDefined()
  })

  it('Should call handleClick function when button is clicked', () => {
    act(() => {
      renderResult = render(buttonComponent(MobileViewContent.ICON))
    })

    const combinedButton: Element = renderResult.getByTestId('combined_button')

    act(() => {
      userEvent.click(combinedButton)
    })

    expect(handleClick).toHaveBeenCalled()
  })

  it('Should render combined button just with icon in mobile view', () => {
    matchMedia(true)

    act(() => {
      renderResult = render(buttonComponent(MobileViewContent.ICON))
    })

    const combinedButton: Element = renderResult.getByTestId('combined_button')

    expect(combinedButton).toBeDefined()
    const icon: Element = renderResult.getByRole('img')

    expect(icon).toBeDefined()
  })

  it('Should render combined button just with text in mobile view', () => {
    matchMedia(true)

    act(() => {
      renderResult = render(buttonComponent(MobileViewContent.TEXT))
    })

    const combinedButton: Element = renderResult.getByTestId('combined_button')

    expect(combinedButton.children).toHaveLength(1)

    const text: Element = renderResult.getByText('title')

    expect(text).toBeDefined()
  })
})
