import React, { useRef } from 'react'
import { useStyles } from './styles'
import { InfiniteScroll } from '../../global/infinite_scroll'
import { ChannelListItem } from './channels_list_item'
import { useGetChannelsHook } from './use_get_channels_hook'
import { GetChannelsHook, ChannelListProps } from './interfaces'
import { ThunkDispatch } from '../../../store'
import { useDispatch } from 'react-redux'
import { fetchGroupMembers } from '../../../store/groups_slice'
import useAsyncEffect from 'use-async-effect'

export const itemSize: number = 80

export const ChannelsList: React.FC<ChannelListProps> = ({
  folderType,
  folders,
  groupUuid,
}: ChannelListProps) => {
  const { channelsIds, areChannelsLoading, hasNextPage, loadNextPage }: GetChannelsHook = useGetChannelsHook({ folderType, folders, groupUuid })
  const contactsListElement = useRef<HTMLDivElement>(null)

  const dispatch: ThunkDispatch = useDispatch()

  const classes = useStyles({
    height: window.innerHeight - (contactsListElement.current?.offsetTop ?? 0) - 5,
  })

  useAsyncEffect(async () => {
    if (groupUuid !== undefined) {
      await dispatch(fetchGroupMembers({ group_uuid: groupUuid, page: 1 }))
    }
  }, [groupUuid])

  return (
    <div className={classes.contactsList} ref={contactsListElement}>
      <InfiniteScroll
        key={folderType}
        isLoading={areChannelsLoading}
        items={channelsIds}
        hasNextPage={hasNextPage}
        loadNextPage={loadNextPage}
        ListItem={ChannelListItem}
        listItemWrapperClassName={classes.listItemWrapper}
        listClassName={classes.listElement}
        itemHeightSize={itemSize}
      />
    </div>
  )
}
