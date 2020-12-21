import React from 'react'
import { IdentityListItem } from './identity_list_item'
import {
  IdentityAlias,
  IdentityItem,
  IdentityListProps,
} from './interfaces'
import { useStyles } from './styles'
import { InfiniteScroll } from '../global/infinite_scroll/infinite_scroll'
import { ListInfoMessage } from '../global/list_info_message'
import { IDENTITY_LIST_ITEM_SIZE } from '../../constants'
import { useSelector } from 'react-redux'
import { RootState } from 'RootType'
import clsx from 'clsx'
import { GlobalidLoader } from '../global'

export const IdentityList: React.FC<IdentityListProps> = ({
  emptyListMessage,
  hasNextPage,
  height,
  isLoading,
  items,
  loadNextPage,
  onSelect,
  selectedIdentities = [],
  showSelection = false,
  excludeMe = false,
  handleBottomSelectionOverlap,
  selectDisabled,
  adornment,
  adornmentCondition,
  itemDisabled,
  disabledItemTooltip,
}: IdentityListProps) => {

  const classes = useStyles({ height, showSelection, endOfList: !hasNextPage, handleBottomSelectionOverlap })

  const myGidUuid: string | undefined = useSelector((state: RootState) => state.identity.identity?.gid_uuid)

  const centerLoader: JSX.Element = <div key='loader' className={classes.loaderWrapper}>
    <GlobalidLoader />
  </div>

  if (items === undefined) {
    return centerLoader
  }

  if (items.length === 0) {
    return <ListInfoMessage message={emptyListMessage}/>
  }

  const listItems: IdentityItem[] = items.reduce<IdentityItem[]>((
    identityList: IdentityItem[],
    identity: IdentityAlias
  ): IdentityItem[] => {
    if (excludeMe && myGidUuid !== undefined && myGidUuid === identity.gid_uuid) {
      return identityList
    }

    return [...identityList, {
      ...identity,
      selectDisabled,
      isSelected: selectedIdentities.includes(identity.gid_uuid),
      onSelect: onSelect?.bind(null, identity.gid_uuid),
      showCheckbox: showSelection,
      adornment,
      adornmentCondition,
      itemDisabled,
      disabledItemTooltip,
    }]
  }, [])

  return (
    <div className={clsx(classes.contactsList, handleBottomSelectionOverlap && classes.flexGrow)}>
      <InfiniteScroll
        isLoading={isLoading}
        items={listItems}
        hasNextPage={hasNextPage}
        loadNextPage={loadNextPage}
        ListItem={IdentityListItem}
        listClassName={classes.listElement}
        itemHeightSize={IDENTITY_LIST_ITEM_SIZE}
      />
    </div>
  )
}
