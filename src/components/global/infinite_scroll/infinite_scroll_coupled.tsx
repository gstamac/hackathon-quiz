import React from 'react'
import { useCoupledScrollStyles } from './styles'
import { InfiniteScrollCoupledListItem } from './infinite_scroll_coupled_list_item'
import { InfiniteScroll } from './infinite_scroll'
import { InfiniteScrollCoupledProps, CoupledScrollContextData } from './interfaces'
import { useCoupledScrollContextRef } from './use_coupled_scroll_context_ref'
import { GlobalidLoader } from '../loading'
import { useCoupledScrollContainer } from './use_coupled_scroll_container_hook'

export const InfiniteScrollCoupled: React.FC<InfiniteScrollCoupledProps> = (props: InfiniteScrollCoupledProps) => {
  const {
    topList,
    bottomList,
    listItemHeight,
  }: InfiniteScrollCoupledProps = props

  const topListContextData: CoupledScrollContextData = useCoupledScrollContextRef([])
  const bottomListContextData: CoupledScrollContextData = useCoupledScrollContextRef([])

  const {
    coupledListItems,
    infiniteLoadingProps,
    scrollHeight,
    calculateDynamicRowHeight,
    scrollContainerRef,
  } = useCoupledScrollContainer({
    ...props,
    topListContextData,
    bottomListContextData,
  })

  const classes = useCoupledScrollStyles({ height: scrollHeight })

  if (topList.items === undefined || bottomList.items === undefined) {
    return (
      <div className={classes.scrollContainer}>
        <GlobalidLoader className={classes.centerLoader} />
      </div>
    )
  }

  return (
    <div className={classes.scrollContainer} ref={scrollContainerRef}>
      <InfiniteScroll
        items={coupledListItems}
        ListItem={InfiniteScrollCoupledListItem}
        itemHeightSize={listItemHeight}
        calculateDynamicRowHeight={calculateDynamicRowHeight}
        listClassName={classes.listElement}
        {...infiniteLoadingProps}
      />
    </div>
  )
}
