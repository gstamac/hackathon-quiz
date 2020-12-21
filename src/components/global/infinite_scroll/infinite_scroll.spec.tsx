import React from 'react'
import { RenderResult, render, cleanup } from '../../../../tests/test_utils'
import { InfiniteScroll } from './infinite_scroll'
import { InfiniteScrollProps, ListItemProps } from './interfaces'

const ListItem = (props: ListItemProps): JSX.Element => (
  <div>
    <span>{props.gid_name}</span>
    <img src={props.img_url} alt={props.img_url}/>
  </div>
)

describe('ContactsList', () => {
  let renderResult: RenderResult
  const loadNextPageMock: jest.Mock = jest.fn()

  const items: ListItemProps[] = [{ gid_name: 'test', img_url: 'test' }]

  const scrollProps: InfiniteScrollProps<any> = {
    isLoading: false,
    hasNextPage: false,
    loadNextPage: loadNextPageMock,
    ListItem: ListItem,
    itemHeightSize: 70,
    items: items,
    listHeight: 500,
    listWidth: 500,
  }

  const renderComponent = (props: InfiniteScrollProps<any>): void => {
    renderResult = render(<InfiniteScroll {...props}/>)
  }

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  it('should render the infinite scroll component with items', () => {
    renderComponent({ ...scrollProps })

    const gidName: Element | null = renderResult.queryByText(items[0].gid_name)
    const image: Element | null = renderResult.queryByAltText(items[0].img_url)

    expect(loadNextPageMock).not.toHaveBeenCalled()
    expect(gidName).not.toBeNull()
    expect(image).not.toBeNull()
  })

  it('should not call loadNextPage function when isLoading param is true', () => {
    renderComponent({ ...scrollProps, hasNextPage: true, isLoading: true })

    const gidName: Element | null = renderResult.queryByText(items[0].gid_name)
    const image: Element | null = renderResult.queryByAltText(items[0].img_url)

    expect(loadNextPageMock).not.toHaveBeenCalled()
    expect(gidName).not.toBeNull()
    expect(image).not.toBeNull()
  })

  it('should render the infinite scroll component when hasNextPage param is true', () => {
    renderComponent({ ...scrollProps, hasNextPage: true })

    const gidName: Element | null = renderResult.queryByText(items[0].gid_name)
    const image: Element | null = renderResult.queryByAltText(items[0].img_url)

    expect(loadNextPageMock).toHaveBeenCalled()
    expect(gidName).not.toBeNull()
    expect(image).not.toBeNull()
  })
})
