import React from 'react'
import { render, act, cleanup, fireEvent, RenderResult } from '../../../../../tests/test_utils'
import { FullImageDialog } from './full_image_dialog'
import { FullImageDialogProps } from './interfaces'

describe('Image Dialog', () => {
  let renderResult: RenderResult

  const onExit = jest.fn()

  const imageDialogProps: FullImageDialogProps = {
    open: true,
    title: 'title',
    thumbnail: 'thumbnail',
    original: 'original',
    onExit,
  }

  beforeEach(() => {
    act(() => {
      renderResult = render(<FullImageDialog {...imageDialogProps}/>)
    })
  })

  afterEach(() => {
    cleanup()
    jest.resetAllMocks()
  })

  it('should render full image dialog', () => {
    const timestamp: Element | null = renderResult.getByText('title')
    const closeButton: Element | null = renderResult.getByAltText('close')
    const thumbnail: Element | null = renderResult.getByAltText('thumbnail')
    const original: Element | null = renderResult.getByAltText('original')
    const loader: Element | null = renderResult.getByTestId('globalid-loader')

    expect(timestamp).not.toBeNull()
    expect(closeButton).not.toBeNull()
    expect(thumbnail).toHaveAttribute('src', 'thumbnail')
    expect(original).toHaveAttribute('src', 'original')

    expect(timestamp).not.toBeNull()
    expect(closeButton).not.toBeNull()

    expect(thumbnail).toHaveAttribute('src', 'thumbnail')

    expect(loader).toBeVisible()

    act(() => {
      fireEvent(original, new Event('load'))
    })

    expect(original).toHaveAttribute('src', 'original')
  })

  it('should close full image dialog on parent click', async () => {
    const original: Element | null = renderResult.getByAltText('original')
    const closeButton: Element | null = renderResult.getByAltText('close')
    const imageBackground: Element | null = renderResult.getByTestId('image-background')

    act(() => {
      fireEvent(original, new Event('load'))
    })

    act(() => {
      fireEvent.click(imageBackground)
    })

    expect(onExit).not.toHaveBeenCalled()

    act(() => {
      fireEvent.click(closeButton)
    })

    expect(onExit).toHaveBeenCalled()
  })

  it('should close dialog on image error', async () => {
    const original: Element | null = renderResult.getByAltText('original')

    act(() => {
      fireEvent(original, new Event('error'))
    })

    expect(onExit).toHaveBeenCalled()
  })
})

