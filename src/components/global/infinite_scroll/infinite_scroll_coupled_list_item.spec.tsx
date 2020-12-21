import React from 'react'
import { render, RenderResult, act } from '../../../../tests/test_utils'
import { InfiniteScrollCoupledListItem } from './infinite_scroll_coupled_list_item'
import { InfiniteScrollCoupledListItemProps } from './interfaces'

const ItemComponent: React.FC<Record<string, unknown>> = (props: any) => <div>{props.item}</div>

describe('InfiniteScrollCoupledListItem', () => {
  let renderResult: RenderResult

  const defaultProps: InfiniteScrollCoupledListItemProps = {
    itemProps: {
      item: 'test',
    },
    ItemComponent,
  }

  const renderElement = (props?: Partial<InfiniteScrollCoupledListItemProps>): void => {
    act(() => {
      renderResult = render(<InfiniteScrollCoupledListItem {...{
        ...defaultProps,
        ...props,
      }} />)
    })
  }

  it('should render component with props', () => {
    renderElement()

    const item: Element = renderResult.getByText('test')

    expect(item).toBeDefined()
  })

  it('should render title if title is defined', () => {
    const title: string = 'title'

    renderElement({ title })

    const titleElement: Element = renderResult.getByText(title)

    expect(titleElement).toBeDefined()
  })

  it('should render no matches text if no matches text is defined', () => {
    const noMatchesText: string = 'noMatchesText'

    renderElement({ noMatchesText })

    const noMatches: Element = renderResult.getByText(noMatchesText)

    expect(noMatches).toBeDefined()
  })
})
