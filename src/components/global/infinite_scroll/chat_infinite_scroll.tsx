import React, { useCallback, useRef } from 'react'
import { useStyles } from './styles'
import { GlobalidLoader } from '../loading/globalid_loader'
import { TItemContainer, Virtuoso, VirtuosoMethods, VirtuosoProps } from 'react-virtuoso'
import { ReverseScrollContainer } from './reverse_scroll_container'
import { TRenderProps } from 'react-virtuoso/dist/VirtuosoList'
import { ChatInfiniteScrollProps } from './interfaces'

export const ChatInfiniteScroll: React.FC<ChatInfiniteScrollProps> = (props: ChatInfiniteScrollProps) => {
  const {
    className,
    isFetching,
    hasNextPage,
    onNextPageLoad,
    listItems,
    reversed,
    initialItemCount,
  }: ChatInfiniteScrollProps = props

  const classes = useStyles({ reversed })

  const virtuoso = useRef<VirtuosoMethods>(null)

  type ItemContainerProps = Omit<TRenderProps, 'renderPlaceholder' | 'scrollVelocity'>
  const ScrollItemContainer: TItemContainer = useCallback((itemProps: ItemContainerProps) => <div {...itemProps} className={classes.itemContainer} />, [])

  const getCenterLoader = (): JSX.Element => <>{ hasNextPage &&
    <div key='loader' className={classes.loaderWrapper}>
      <GlobalidLoader />
    </div>
  }</>

  const getItem = useCallback((index: number): React.ReactElement => listItems[index], [listItems])
  const getItemKey = useCallback((index: number): string => listItems[index].key as string, [listItems])
  const loadMore = async (): Promise<void> => {
    if (isFetching) {
      return
    }
    if (hasNextPage) {
      await onNextPageLoad()
    }
  }

  const defaultVirtosoProps: Partial<VirtuosoProps> = {
    overscan: 200,
    maxHeightCacheSize: 2000,
    defaultItemHeight: 50,
    initialTopMostItemIndex: 0,
    style: {maxHeight: '100vh'},
    followOutput: true,
  }

  return (
    <Virtuoso
      {...defaultVirtosoProps}
      ref={virtuoso}
      className={`${classes.scrollContainer} ${className}`}
      initialItemCount={initialItemCount}
      totalCount={listItems.length}
      ScrollContainer={ReverseScrollContainer}
      ItemContainer={ScrollItemContainer}
      item={getItem}
      computeItemKey={getItemKey}
      endReached={loadMore}
      footer={getCenterLoader}
    />
  )
}
