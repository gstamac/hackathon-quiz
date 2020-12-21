import React, { RefObject, MutableRefObject, CSSProperties } from 'react'

export interface InfiniteScrollProps<T> {
  isLoading: boolean
  items?: T[]
  loadNextPage?: () => void
  hasNextPage: boolean
  ListItem: React.ComponentType<T>
  listItemWrapperClassName?: string
  listClassName?: string
  itemHeightSize: number
  listHeight?: number
  listWidth?: number
  calculateDynamicRowHeight?: (itemProps: T) => number
}

export interface ListItemProps {
  gid_name: string
  img_url: string
}

export interface CoupledListItemGeneralProps {
  item: string
}

export interface GeneralScrollItemProps {
  uuid: string
}

export interface HorizontalInfiniteScrollProps {
  scrollContainerClassName?: string
  wrapperClassName?: string
  listClassName?: string
  canLoadNextPage?: boolean
  onNextPage: () => void
  itemUuids?: string[]
  renderItemComponent: React.FC<GeneralScrollItemProps>
  emptyListMessage: string
  itemWidth: number
  itemMargin: number
}

export interface ScrollState {
  scrollTop?: number
  scrollLeft?: number
  scrollWidth?: number
  scrollHeight?: number
  scrollClientWidth?: number
  scrollClientHeight?: number
}

export type CallbackRef = (node: HTMLDivElement | null) => void

export interface ScrollRefData {
  scrollState: ScrollState
  scrollRef: CallbackRef
  scrollNode: HTMLDivElement | null
}

export enum ScrollTo {
  RIGHT,
  LEFT,
}

export interface InfiniteLoaderMeta {
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: any[]
  hasNextPage: boolean
  loading: boolean
  onNextPageLoad: () => void
  noItemsMessage: string
}

export interface InfiniteScrollCoupledProps {
  topList: InfiniteLoaderMeta
  bottomList: InfiniteLoaderMeta
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ListItem: React.FC<any> | React.ForwardRefExoticComponent<any>
  height?: number
  listItemHeight: number
  listItemWrapperClassName?: string
}

export interface InfiniteScrollCoupledListItemProps {
  itemProps?: CoupledListItemGeneralProps
  title?: string
  noMatchesText?: string
  ItemComponent: React.FC<object>
  ref?: CallbackRef
  className?: string
}

export interface CoupledScrollContextData {
  ref: CallbackRef
  isVisible: boolean
}

export interface InfiniteLoadingProps {
  isLoading: boolean
  hasNextPage: boolean
  loadNextPage: () => void
}

export interface CoupledScrollContainerHookParams extends InfiniteScrollCoupledProps {
  topListContextData: CoupledScrollContextData
  bottomListContextData: CoupledScrollContextData
}

export interface CoupledScrollContainerHookResponse {
  coupledListItems: InfiniteScrollCoupledListItemProps[]
  infiniteLoadingProps: InfiniteLoadingProps
  scrollHeight: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calculateDynamicRowHeight: (itemProps: any) => number
  scrollContainerRef: RefObject<HTMLDivElement>
}

export type InfiniteScrollCoupledListItemRef = (
  ((instance: HTMLDivElement | null) => void) | MutableRefObject<HTMLDivElement | null> | null
)

export interface ChatInfiniteScrollProps {
  className?: string
  isFetching: boolean
  hasNextPage: boolean
  onNextPageLoad: () => Promise<void>
  listItems: JSX.Element[]
  reversed?: boolean
  initialItemCount?: number
}

export interface ReverseScrollContainerProps {
  style: CSSProperties
  className?: string
  reportScrollTop: (scrollTop: number) => void
  scrollTo: (callback: (scrollTop: ScrollToOptions) => void) => void
}
