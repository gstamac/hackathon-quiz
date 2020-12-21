import React from 'react'
import { RenderResult, act, cleanup, render } from '../../../../tests/test_utils'
import { InfiniteScrollCoupled } from './infinite_scroll_coupled'
import { InfiniteScrollCoupledProps, InfiniteLoadingProps } from './interfaces'
import * as hooks from './use_coupled_scroll_container_hook'
import { GroupListItem } from '../../groups_list/group_list_item'
import { topListMetaMock, bottomListMetaMock, coupledListItemsMock } from '../../../../tests/mocks/infinite_scroll_mocks'

jest.mock('./use_coupled_scroll_container_hook')

describe('InfiniteScrollCoupled', () => {
  let renderResult: RenderResult

  const defaultProps: InfiniteScrollCoupledProps = {
    topList: topListMetaMock,
    bottomList: bottomListMetaMock,
    listItemHeight: 42,
    ListItem: GroupListItem,
  }

  const renderElement = (props?: Partial<InfiniteScrollCoupledProps>): void => {
    act(() => {
      renderResult = render(<InfiniteScrollCoupled {...{
        ...defaultProps,
        ...props,
      }} />)
    })
  }

  const useCoupledScrollContainerHookMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (hooks.useCoupledScrollContainer as jest.Mock) = useCoupledScrollContainerHookMock
  })

  afterEach(() => {
    cleanup()
  })

  const defaultInfiniteLoadingProps: InfiniteLoadingProps = {
    isLoading: false,
    hasNextPage: true,
    loadNextPage: jest.fn(),
  }

  it('should render globalid loader when top or bottom list is undefined', () => {
    useCoupledScrollContainerHookMock.mockReturnValue({
      coupledListItems: [],
      infiniteLoadingProps: defaultInfiniteLoadingProps,
      scrollHeight: 500,
      useDynamicRowHeight: undefined,
      scrollContainerRef: jest.fn(),
    })

    renderElement({
      topList: {
        ...topListMetaMock,
        items: undefined,
      },
    })

    const loader: Element = renderResult.getByTestId('globalid-loader')

    expect(loader).toBeDefined()
  })

  it('should render infinite scroll with list items and titles', () => {
    useCoupledScrollContainerHookMock.mockReturnValue({
      coupledListItems: coupledListItemsMock,
      infiniteLoadingProps: defaultInfiniteLoadingProps,
      scrollHeight: 500,
      useDynamicRowHeight: undefined,
      scrollContainerRef: jest.fn(),
    })

    renderElement()

    const topTitle: Element = renderResult.getByText(topListMetaMock.title)
    const bottomTitle: Element = renderResult.getByText(bottomListMetaMock.title)
    const topElement: Element = renderResult.getByText('top_item')
    const bottomElement: Element = renderResult.getByText('bottom_item')

    expect(topTitle).toBeDefined()
    expect(bottomTitle).toBeDefined()
    expect(topElement).toBeDefined()
    expect(bottomElement).toBeDefined()
  })
})
