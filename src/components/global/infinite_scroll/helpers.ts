import { InfiniteLoaderMeta, InfiniteLoadingProps, CallbackRef, InfiniteScrollCoupledListItemProps } from './interfaces'

export const combineCallbacks = (
  topCallback: () => void,
  bottomCallback: () => void,
): () => void => (): void => {
  topCallback()
  bottomCallback()
}

export const getHasNextPage = (
  topHasNextPage: boolean,
  bottomHasNextPage: boolean,
  topListIsVisible: boolean,
  bottomListIsVisible: boolean,
): boolean => {
  if (!topListIsVisible && bottomListIsVisible) {
    return bottomHasNextPage
  }

  if (topListIsVisible && !bottomListIsVisible) {
    return topHasNextPage
  }

  return topHasNextPage || bottomHasNextPage
}

export const getLoadNextPage = (
  topOnNextPageLoad: () => void,
  bottomOnNextPageLoad: () => void,
  topListIsVisible: boolean,
  bottomListIsVisible: boolean,
): () => void => {
  if (!topListIsVisible && bottomListIsVisible) {
    return bottomOnNextPageLoad
  }

  if (topListIsVisible && !bottomListIsVisible) {
    return topOnNextPageLoad
  }

  return combineCallbacks(topOnNextPageLoad, bottomOnNextPageLoad)
}

export const getInfiniteLoadingProps = (
  topList: InfiniteLoaderMeta,
  bottomList: InfiniteLoaderMeta,
  topListIsVisible: boolean,
  bottomListIsVisible: boolean,
): InfiniteLoadingProps => {
  const {
    items: topListItems,
    loading: topListLoading,
    hasNextPage: topHasNextPage,
    onNextPageLoad: topOnNextPageLoad,
  }: InfiniteLoaderMeta = topList

  const {
    items: bottomListItems,
    loading: bottomListLoading,
    hasNextPage: bottomHasNextPage,
    onNextPageLoad: bottomOnNextPageLoad,
  }: InfiniteLoaderMeta = bottomList

  if (topListItems === undefined || bottomListItems === undefined) {
    return {
      isLoading: true,
      hasNextPage: false,
      loadNextPage: combineCallbacks(topOnNextPageLoad, bottomOnNextPageLoad),
    }
  }

  return {
    isLoading: topListLoading || bottomListLoading,
    hasNextPage: getHasNextPage(
      topHasNextPage,
      bottomHasNextPage,
      topListIsVisible,
      bottomListIsVisible,
    ),
    loadNextPage: getLoadNextPage(
      topOnNextPageLoad,
      bottomOnNextPageLoad,
      topListIsVisible,
      bottomListIsVisible,
    ),
  }
}

export const getItemsFromMeta = (
  meta: InfiniteLoaderMeta,
  titleRef: CallbackRef,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ListItem: React.FC<any>,
  listItemWrapperClassName?: string
): InfiniteScrollCoupledListItemProps[] => {
  const {
    title,
    items,
    noItemsMessage,
  }: InfiniteLoaderMeta = meta

  if (items !== undefined) {
    const noMatchesItem: InfiniteScrollCoupledListItemProps = {
      ItemComponent: ListItem,
      noMatchesText: noItemsMessage,
      ref: titleRef,
    }

    const titleItem: InfiniteScrollCoupledListItemProps = {
      ItemComponent: ListItem,
      title: title,
      ref: titleRef,
    }

    const listItems: InfiniteScrollCoupledListItemProps[] = items.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? items.map((item: any): InfiniteScrollCoupledListItemProps => ({
        itemProps: { item },
        ItemComponent: ListItem,
        ref: titleRef,
        className: listItemWrapperClassName,
      }))
      : [noMatchesItem]

    return [titleItem, ...listItems]
  }

  return []
}
