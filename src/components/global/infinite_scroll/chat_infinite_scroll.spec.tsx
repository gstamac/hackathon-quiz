import React from 'react'
import { RenderResult, render, cleanup } from '../../../../tests/test_utils'
import { ChatInfiniteScroll } from './chat_infinite_scroll'
import { ChatInfiniteScrollProps } from './interfaces'

const listItemTexts: string[] = ['test1', 'test2', 'test3']

const listItems: JSX.Element[] = listItemTexts.map((text: string, i: number) => <span key={i}>{text}</span>)

describe('ChatInfiniteScroll', () => {
  let renderResult: RenderResult
  const loadNextPageMock: jest.Mock = jest.fn()
  const scrollProps: ChatInfiniteScrollProps = {
    className: 'className',
    isFetching: false,
    hasNextPage: false,
    onNextPageLoad: loadNextPageMock,
    listItems: listItems,
    reversed: true,
    initialItemCount: listItems.length,
  }

  const renderComponent = (props: Partial<ChatInfiniteScrollProps>): void => {
    renderResult = render(<div>
      <ChatInfiniteScroll { ...{
        ...scrollProps,
        ...props,
      }}/>
    </div>)
  }

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  it('should render the infinite scroll component with items', () => {
    renderComponent({ ...scrollProps })

    listItemTexts.forEach((text: string) => {
      const listItem: Element | null = renderResult.getByText(text)

      expect(listItem).not.toBeNull()
    })

    expect(loadNextPageMock).not.toHaveBeenCalled()
  })

  it('should not call loadNextPage function when isLoading param is true and there is a next page', () => {
    renderComponent({ isFetching: true, hasNextPage: true })

    const loader: Element | null = renderResult.queryByTestId('globalid-loader')

    expect(loadNextPageMock).not.toHaveBeenCalled()
    expect(loader).not.toBeNull()
  })
})
