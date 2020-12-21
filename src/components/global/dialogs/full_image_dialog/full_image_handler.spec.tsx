import React from 'react'
import { render, cleanup, act, fireEvent, RenderResult } from '@testing-library/react'
import { MuiThemeProvider } from '@material-ui/core'
import { Provider } from 'react-redux'
import { mainTheme } from '../../../../assets/themes'
import { store } from '../../../../store'
import { ImageSlice } from '../../../../store/interfaces'
import { FullImageHandler } from './full_image_handler'
import { setFullImageView } from '../../../../store/image_slice'

describe('Full Image Dialog Handler', () => {
  const renderComponent = (): RenderResult => render(
    <MuiThemeProvider theme={mainTheme}>
      <Provider store={store}>
        <FullImageHandler/>
      </Provider>
    </MuiThemeProvider>
  )

  afterEach(() => {
    cleanup()
    store.dispatch(setFullImageView(undefined))
  })

  it('should open full image dialog and have state of image in store', () => {
    const renderResult = renderComponent()

    store.dispatch(setFullImageView({
      title: 'title',
      thumbnail: 'thumbnail',
      original: 'original',
    }))

    const title: Element | null = renderResult.getByText('title')
    const thumbnail: Element | null = renderResult.getByAltText('thumbnail')
    const original: Element | null = renderResult.getByAltText('original')

    expect(title).not.toBeNull()
    expect(thumbnail).not.toBeNull()
    expect(original).not.toBeNull()

    const imageSlice: ImageSlice = store.getState().image

    expect(imageSlice.image).toMatchObject({
      title: 'title',
      thumbnail: 'thumbnail',
      original: 'original',
    })
  })

  it('should close full image dialog and not have image state in store', () => {
    const renderResult = renderComponent()

    store.dispatch(setFullImageView({
      title: 'title',
      thumbnail: 'thumbnail',
      original: 'original',
    }))

    const closeButton: Element | null = renderResult.getByAltText('close')

    act(() => {
      fireEvent.click(closeButton)
    })

    const imageSlice: ImageSlice = store.getState().image

    expect(imageSlice.image).toBeUndefined()
  })
})
