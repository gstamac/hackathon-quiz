import { InfiniteLoadingProps, CoupledScrollContainerHookParams, CoupledScrollContainerHookResponse, InfiniteScrollCoupledListItemProps, CoupledScrollContextData } from './interfaces'
import { useRef, RefObject } from 'react'
import { getInfiniteLoadingProps, getItemsFromMeta } from './helpers'

export const useCoupledScrollContainer = (props: CoupledScrollContainerHookParams): CoupledScrollContainerHookResponse => {

  const {
    topList,
    bottomList,
    height,
    listItemHeight,
    ListItem,
    listItemWrapperClassName,
    topListContextData,
    bottomListContextData,
  }: CoupledScrollContainerHookParams = props

  const {
    ref: topListRef,
    isVisible: topListIsVisible,
  }: CoupledScrollContextData = topListContextData

  const {
    ref: bottomListRef,
    isVisible: bottomListIsVisible,
  }: CoupledScrollContextData = bottomListContextData

  const scrollContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

  const scrollHeight: number = height ?? window.innerHeight - (scrollContainerRef.current?.offsetTop ?? 0)

  const calculateDynamicRowHeight = (itemProps: InfiniteScrollCoupledListItemProps): number => itemProps.title
    ? 67
    : listItemHeight

  const firstListItems: InfiniteScrollCoupledListItemProps[] = getItemsFromMeta(topList, topListRef, ListItem, listItemWrapperClassName)
  const secondListItems: InfiniteScrollCoupledListItemProps[] = getItemsFromMeta(bottomList, bottomListRef, ListItem, listItemWrapperClassName)

  const coupledListItems: InfiniteScrollCoupledListItemProps[] = [...firstListItems, ...secondListItems]

  const infiniteLoadingProps: InfiniteLoadingProps = getInfiniteLoadingProps(topList, bottomList, topListIsVisible, bottomListIsVisible)

  return {
    coupledListItems,
    infiniteLoadingProps,
    scrollHeight,
    calculateDynamicRowHeight,
    scrollContainerRef,
  }
}
