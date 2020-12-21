import React, { useRef } from 'react'
import { useStyles } from './styles'
import { ChannelMembersSidebarProps, UseFetchMembersResult } from './interfaces'
import { getChannelMemberListItems } from './helpers'
import { InfiniteScroll } from '../../global/infinite_scroll'
import { RightSidebar } from '../../global/right_sidebar'
import { IdentityListItem } from '../../identity_list'
import { MEMBER_LIST_ITEM_HEIGHT_SIZE } from '../../../constants'
import { ChannelType } from '../../../store/interfaces'
import { useFetchMembers } from './use_fetch_members'

export const ChannelMembersSidebar: React.FC<ChannelMembersSidebarProps> = ({
  memberUuids,
  owner,
  showOwner,
  channelType,
  channelId,
  ...sidebarProps
}: ChannelMembersSidebarProps) => {
  const infiniteScrollWrapper = useRef<HTMLDivElement>(null)

  const hideOwner: boolean = !showOwner && channelType === ChannelType.GROUP
  const classes = useStyles({
    height: window.innerHeight - (infiniteScrollWrapper.current?.offsetTop ?? 0),
  })

  const {
    isFetching,
    isLoading,
    members,
  }: UseFetchMembersResult = useFetchMembers({
    channelId,
    memberUuids,
    open: sidebarProps.open,
  })

  return (
    <RightSidebar title='Members' {...sidebarProps}>
      <div className={classes.memberList} ref={infiniteScrollWrapper}>
        <InfiniteScroll
          ListItem={IdentityListItem}
          hasNextPage={isFetching}
          isLoading={isLoading}
          itemHeightSize={MEMBER_LIST_ITEM_HEIGHT_SIZE}
          items={getChannelMemberListItems(memberUuids, members, owner, hideOwner)}
          listClassName={classes.memberListItem}
        />
      </div>
    </RightSidebar>
  )
}
