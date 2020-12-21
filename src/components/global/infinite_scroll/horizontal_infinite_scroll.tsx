import React, { useEffect, useState, useMemo } from 'react'
import { useHorizontalStyles } from './styles'
import ChevronGray from '../../../assets/icons/chevron-gray.svg'
import { GlobalidLoader } from '../loading'
import { useScrollRef } from './use_scroll_ref'
import { HorizontalInfiniteScrollProps, ScrollTo } from './interfaces'
import clsx from 'clsx'

export const HorizontalInfiniteScroll: React.FC<HorizontalInfiniteScrollProps> = (props: HorizontalInfiniteScrollProps) => {

  const {
    canLoadNextPage,
    onNextPage,
    itemUuids,
    renderItemComponent: ListItemComponent,
    emptyListMessage,
    scrollContainerClassName,
    itemWidth,
    itemMargin,
  }: HorizontalInfiniteScrollProps = props

  const {
    scrollState,
    scrollNode,
    scrollRef,
  } = useScrollRef([itemUuids])

  const {
    scrollLeft,
    scrollClientWidth,
  } = scrollState

  const loaderWidth: number = 56

  const scrollWidth: number | undefined = useMemo(() => (
    itemUuids?.length
      ? itemUuids.length * itemWidth + (itemUuids.length - 1) * itemMargin + (canLoadNextPage ? loaderWidth : 0)
      : scrollClientWidth
  ), [itemUuids?.length, canLoadNextPage])

  const [elements, setElements] = useState<JSX.Element[]>([])

  const onScrollFetchHandler = (): void => {
    if (canLoadNextPage) {
      onNextPage()
    }
  }

  useEffect(() => {
    if (scrollLeft !== undefined && scrollLeft !== 0 && scrollWidth !== undefined && scrollClientWidth !== undefined) {
      const scrollLeftLimit: number = scrollWidth - scrollClientWidth - loaderWidth

      if (scrollLeft >= scrollLeftLimit) {
        onScrollFetchHandler()
      }
    }
  }, [scrollLeft])

  const isRightScrollable: boolean = useMemo(() => (
    scrollLeft !== undefined
      && scrollWidth !== undefined
      && scrollClientWidth !== undefined
      && (scrollWidth - scrollClientWidth) > scrollLeft
  ), [scrollLeft, scrollWidth, scrollClientWidth])

  const isLeftScrollable: boolean = useMemo(() => (
    scrollLeft !== undefined && scrollLeft > 0
  ), [scrollLeft])

  const classes = useHorizontalStyles({
    leftScrollable: isLeftScrollable,
    rightScrollable: isRightScrollable,
  })

  const scrollLeftClassName: string = isLeftScrollable ? 'scrollLeftButton' : ''
  const scrollRightClassName: string = isRightScrollable ? 'scrollRightButton' : ''

  const onListItemUpdate = (items?: string[]): void => {

    if (items === undefined) {
      setElements([<GlobalidLoader className='loader' key='loader' />])

      return
    }

    if (items.length === 0) {
      setElements([<div key='empty-list-message' className={`${classes.emptyListMessage} loader`}>{emptyListMessage}</div>])

      return
    }

    const itemElements: JSX.Element[] = items.map((uuid: string) => <ListItemComponent key={uuid} uuid={uuid} />)

    const listElements: JSX.Element[] = canLoadNextPage
      ? [...itemElements, <GlobalidLoader className='next-page-loader' key='next-page-loader' />]
      : itemElements

    setElements(listElements)
  }

  const onScrollToX = (left: number): void => {
    if (scrollNode) {
      scrollNode.scrollTo({ left, top: 0, behavior: 'smooth'})
    }
  }

  const scrollHandler = (direction: ScrollTo) => () => {
    if (scrollLeft !== undefined && scrollClientWidth !== undefined) {
      const modifier: number = (direction === ScrollTo.RIGHT) ? 1 : -1

      const newX: number = scrollLeft + (scrollClientWidth * modifier)

      onScrollToX(newX)
    }
  }

  const onScrollToLeftHandler = isLeftScrollable ? scrollHandler(ScrollTo.LEFT) : undefined
  const onScrollToRightHandler = isRightScrollable ? scrollHandler(ScrollTo.RIGHT) : undefined

  useEffect(() => {
    onListItemUpdate(itemUuids)
  }, [itemUuids?.length])

  return (
    <div className={classes.wrapperContainer}>
      <div
        className={`${classes.scrollLeftButton} ${scrollLeftClassName}`}
        onClick={onScrollToLeftHandler}
      >
        <img src={ChevronGray} alt='left arrow' />
      </div>
      <div
        className={`${classes.scrollRightButton} ${scrollRightClassName}`}
        onClick={onScrollToRightHandler}
      >
        <img src={ChevronGray} alt='right arrow' />
      </div>
      <div className={clsx(classes.scrollContainer, scrollContainerClassName !== undefined && scrollContainerClassName)} ref={scrollRef}>
        {elements}
      </div>
    </div>
  )
}
