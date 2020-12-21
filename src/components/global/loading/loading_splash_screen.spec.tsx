import React from 'react'
import { RenderResult, act, render, cleanup } from '../../../../tests/test_utils'
import { LoadingSplashScreen } from './loading_splash_screen'

describe('Loading splash sceen tests', () => {

  let renderResult: RenderResult

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    act(() => {
      renderResult = render(<LoadingSplashScreen />)
    })
  })

  it('should render loading splash screen', () => {
    const loadingSplashScreen = renderResult.getByTestId('loading-splash-screen')

    expect(loadingSplashScreen).not.toBeNull()
  })
})
