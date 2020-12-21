import React from 'react'
import { RenderHookResult, renderHook, act } from '@testing-library/react-hooks'
import { CoupledScrollContainerHookParams, CoupledScrollContainerHookResponse, InfiniteScrollCoupledListItemProps, InfiniteLoadingProps } from './interfaces'
import { useCoupledScrollContainer } from './use_coupled_scroll_container_hook'
import { topListMetaMock, bottomListMetaMock, coupledListItemsMock, topListItemsMock, bottomListItemsMock, listContextData } from '../../../../tests/mocks/infinite_scroll_mocks'
import * as helpers from './helpers'

jest.mock('./helpers')

const ListItem: React.FC<object> = (props: any) => <div>{props.item}</div>

describe('useCoupledScrollContainer Hook tests', () => {
  let renderResult: RenderHookResult<CoupledScrollContainerHookParams, CoupledScrollContainerHookResponse>

  const defaultProps: CoupledScrollContainerHookParams = {
    topList: topListMetaMock,
    bottomList: bottomListMetaMock,
    listItemHeight: 42,
    ListItem,
    topListContextData: listContextData,
    bottomListContextData: listContextData,
  }

  const render = async (props?: Partial<CoupledScrollContainerHookParams>): Promise<void> => {
    await act(async () => {
      renderResult = renderHook(useCoupledScrollContainer, { initialProps: {
        ...defaultProps,
        ...props,
      }})
    })
  }

  const getItemsFromMetaMock: jest.Mock = jest.fn()
  const getInfiniteLoadingPropsMock: jest.Mock = jest.fn()

  beforeAll(() => {
    (helpers.getItemsFromMeta as jest.Mock) = getItemsFromMetaMock;
    (helpers.getInfiniteLoadingProps as jest.Mock) = getInfiniteLoadingPropsMock
  })

  it('should return coupledListItems from helper method getItemsFromMeta', async () => {
    getItemsFromMetaMock
      .mockReturnValueOnce(topListItemsMock)
      .mockReturnValueOnce(bottomListItemsMock)

    await render()

    const coupledListItems: InfiniteScrollCoupledListItemProps[] = renderResult.result.current.coupledListItems

    expect(JSON.stringify(coupledListItems)).toEqual(JSON.stringify(coupledListItemsMock))
  })

  it('should return infiniteLoadingProps from helper method getInfiniteLoadingProps', async () => {
    getItemsFromMetaMock
      .mockReturnValueOnce(topListItemsMock)
      .mockReturnValueOnce(bottomListItemsMock)

    const infiniteLoadingPropsMock: InfiniteLoadingProps = {
      isLoading: false,
      hasNextPage: false,
      loadNextPage: jest.fn(),
    }

    getInfiniteLoadingPropsMock.mockReturnValue(infiniteLoadingPropsMock)

    await render()

    const infiniteLoadingProps: InfiniteLoadingProps = renderResult.result.current.infiniteLoadingProps

    expect(JSON.stringify(infiniteLoadingProps)).toEqual(JSON.stringify(infiniteLoadingPropsMock))
  })
})
