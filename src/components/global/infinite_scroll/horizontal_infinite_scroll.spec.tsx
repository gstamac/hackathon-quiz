import React from 'react'
import { RenderResult, render, cleanup } from '../../../../tests/test_utils'
import { HorizontalInfiniteScroll, HorizontalInfiniteScrollProps, GeneralScrollItemProps } from '.'

const itemUuids: string[] = ['uuid1', 'uuid2', 'uuid3']

const TestComponent: React.FC<GeneralScrollItemProps> = ({uuid}: GeneralScrollItemProps) => <span>{uuid}</span>

describe('HorizontalInfiniteScroll', () => {
  let renderResult: RenderResult

  const loadNextPageMock: jest.Mock = jest.fn()

  const scrollProps: HorizontalInfiniteScrollProps = {
    canLoadNextPage: true,
    onNextPage: loadNextPageMock,
    itemUuids,
    renderItemComponent: TestComponent,
    emptyListMessage: 'emptyListMessage',
  }

  const renderComponent = (props?: Partial<HorizontalInfiniteScrollProps>): void => {
    renderResult = render(<div>
      <HorizontalInfiniteScroll { ...{
        ...scrollProps,
        ...props,
      }}/>
    </div>)
  }

  afterEach(() => {
    jest.clearAllMocks()
    cleanup()
  })

  it('should render the horizontal infinite scroll component with items', () => {
    renderComponent()

    itemUuids.forEach((text: string) => {
      const listItem: Element | null = renderResult.getByText(text)

      expect(listItem).not.toBeNull()
    })
  })

  it('should render empty list message when no items are rendered', () => {
    renderComponent({ itemUuids: [] })

    const message: Element | null = renderResult.getByText(scrollProps.emptyListMessage)

    expect(message).not.toBeNull()
  })

  it('should render left and right buttons', () => {
    renderComponent()

    const leftArrow: Element | null = renderResult.getByAltText('left arrow')
    const rightArrow: Element | null = renderResult.getByAltText('right arrow')

    expect(leftArrow).not.toBeNull()
    expect(rightArrow).not.toBeNull()
  })
})
