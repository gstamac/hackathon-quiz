import React, { forwardRef } from 'react'
import { useCoupledScrollItemStyles } from './styles'
import { ListInfoMessage } from '../list_info_message'
import { InfiniteScrollCoupledListItemProps, InfiniteScrollCoupledListItemRef } from './interfaces'

export const InfiniteScrollCoupledListItem = forwardRef((
  props: InfiniteScrollCoupledListItemProps,
  ref: InfiniteScrollCoupledListItemRef,
) => {

  const {
    className,
    title,
    noMatchesText,
    itemProps,
    ItemComponent,
  }: InfiniteScrollCoupledListItemProps = props

  const classes = useCoupledScrollItemStyles()

  if (title !== undefined) {
    return (
      <div className={classes.listHeader} ref={ref}>
        {title}
      </div>
    )
  }

  if (noMatchesText !== undefined) {
    return <ListInfoMessage message={noMatchesText} />
  }

  return (
    <div className={className} ref={ref}>
      <ItemComponent {...itemProps} />
    </div>
  )
})
