import React from 'react'
import { act, render, userEvent, RenderResult } from '../../../../tests/test_utils'
import { SearchProps } from './interfaces'
import { SearchInput } from './search_input'

jest.useFakeTimers()

describe('SearchInput', () => {
  let renderResult: RenderResult
  const onDebounceCallbackMock: jest.Mock = jest.fn()
  const setSearchVisibleMock: jest.Mock = jest.fn()

  const props: SearchProps = {
    onDebounceCallback: onDebounceCallbackMock,
    setSearchVisible: setSearchVisibleMock,
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the search input component', () => {
    renderResult = render(<SearchInput {...props}/>)

    const searchInputElement: Element = renderResult.getByTestId('search-input')
    const searchIcon: Element = renderResult.getByAltText('search')
    const removeIcon: Element | null = renderResult.queryByAltText('remove')

    expect(searchInputElement).not.toBeNull()
    expect(searchIcon).not.toBeNull()
    expect(removeIcon).toBeNull()
  })

  it('should display delete icon when search input is not empty', async () => {
    renderResult = render(<SearchInput {...props}/>)

    const searchInputElement: HTMLInputElement = renderResult.getByTestId('search-input') as HTMLInputElement

    const searchText: string = 'text'

    await act(async () => {
      await userEvent.type(searchInputElement, searchText)
    })

    const removeIcon: Element = renderResult.getByAltText('reset search')

    expect(removeIcon).not.toBeNull()

    setSearchVisibleMock.mockReset()

    act(() => {
      userEvent.click(removeIcon)
    })

    expect(setSearchVisibleMock).toHaveBeenCalledTimes(1)
    expect(setSearchVisibleMock).toHaveBeenCalledWith(false)

    expect(searchInputElement.value).toEqual('')
  })

  it('should call on change function when search input value has been changed', async () => {
    renderResult = render(<SearchInput {...props}/>)

    const searchInputElement: HTMLInputElement = renderResult.getByTestId('search-input') as HTMLInputElement

    const searchText: string = 'text'

    await act(async () => {
      await userEvent.type(searchInputElement, searchText)
    })

    await act(async () => {
      jest.runOnlyPendingTimers()
    })

    const searchInputChanged: HTMLInputElement = renderResult.getByTestId('search-input') as HTMLInputElement

    expect(searchInputChanged.value).toEqual(searchText)
    expect(onDebounceCallbackMock).toHaveBeenCalled()
  })

  it('should render input component with autofocused input filed', async () => {
    renderResult = render(<SearchInput {...props} autoFocus={true}/>)

    const searchInputElement: HTMLInputElement = renderResult.getByTestId('search-input') as HTMLInputElement

    expect(document.activeElement).toBe(searchInputElement)
  })
})
