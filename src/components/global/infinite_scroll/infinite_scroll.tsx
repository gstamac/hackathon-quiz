import React from 'react'
import { InfiniteScrollProps } from './interfaces'
import { InfiniteLoader, InfiniteLoaderChildProps, Index, ListRowProps, List, AutoSizer } from 'react-virtualized'
import { GlobalidLoader } from '../loading'
import { isEmpty, isObject } from 'lodash'
import { useStyles } from './styles'

export type RowHeight = number | ((i: Index) => number)

export const InfiniteScroll: React.FC<InfiniteScrollProps<any>> = (props: InfiniteScrollProps<any>) => {
  const {
    items,
    isLoading,
    hasNextPage,
    loadNextPage,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ListItem,
    listItemWrapperClassName,
    listClassName,
    itemHeightSize: itemSize,
    listWidth,
    listHeight,
    calculateDynamicRowHeight,
  }: InfiniteScrollProps<any> = props

  const classes = useStyles({})
  const centerLoader: JSX.Element = <div key='loader' className={classes.loaderWrapper}>
    <GlobalidLoader />
  </div>

  const listItems: any[] = items ?? [centerLoader]

  const itemCount: number = hasNextPage ? listItems.length + 1 : listItems.length

  const isItemLoaded = ({ index }: Index): boolean => items ? !hasNextPage || index < listItems.length : false

  const renderListItem = ({ index, style }: ListRowProps): JSX.Element | undefined => {
    if (!isItemLoaded({ index })) {
      return <div style={style} key={index} className={classes.loaderWrapper}>
        <GlobalidLoader/>
      </div>
    }

    const item: any = listItems[index]

    if (isEmpty(item)) {
      return
    }

    const itemProps = isObject(item) ? item : { item }

    return (<div style={style} className={listItemWrapperClassName} key={index}>
      <ListItem {...itemProps} />
    </div>)
  }

  const loadNextPageData = async (): Promise<void> => {
    if (hasNextPage && !isLoading && loadNextPage) {
      loadNextPage()
    }
  }

  const getDynamicRowHeight: RowHeight = ({ index }: Index): number => {
    if (calculateDynamicRowHeight) {
      const item = listItems[index]
      const itemProps = isObject(item) ? item : { item }

      return calculateDynamicRowHeight(itemProps)
    }

    return itemSize
  }

  const rowHeight: RowHeight = calculateDynamicRowHeight !== undefined
    ? getDynamicRowHeight
    : itemSize

  const renderAutoSizedList = ({ registerChild, onRowsRendered }: InfiniteLoaderChildProps): JSX.Element => (
    <AutoSizer>
      {({ width, height }: { width: number, height: number}) => {
        const autoSizerWidth: number = Number(width) ? width : listWidth ? listWidth : itemSize
        const autoSizerHeight: number = Number(height) ? height : listHeight ? listHeight : itemSize

        return (
          <List
            className={listClassName}
            ref={registerChild}
            height={autoSizerHeight}
            rowCount={itemCount}
            rowHeight={rowHeight}
            onRowsRendered={onRowsRendered}
            rowRenderer={renderListItem}
            width={autoSizerWidth}
          />
        )
      }}
    </AutoSizer>
  )

  return (
    <InfiniteLoader
      isRowLoaded={isItemLoaded}
      rowCount={itemCount}
      isItemLoaded={isItemLoaded}
      loadMoreRows={loadNextPageData}
    >
      {renderAutoSizedList}
    </InfiniteLoader>
  )
}
