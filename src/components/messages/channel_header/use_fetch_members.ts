import { useDispatch, useSelector } from 'react-redux'
import { RootState, ThunkDispatch } from 'RootType'
import useAsyncEffect from 'use-async-effect'
import { fetchMembers, isFetchingMembersKey } from '../../../store/channels_slice/channels_slice'
import { IdentityByUUID } from '../interfaces'
import { UseFetchMembersParams, UseFetchMembersResult } from './interfaces'

export const useFetchMembers = ({
  memberUuids,
  open,
  channelId,
}: UseFetchMembersParams): UseFetchMembersResult => {
  const dispatch: ThunkDispatch = useDispatch()

  const members: IdentityByUUID = useSelector((state: RootState) => state.channels.members)
  const fetchedMemberUuids: string[] | undefined =
    useSelector((state: RootState) => state.channels.channels[channelId]?.members)
  const isFetching: boolean =
    useSelector((state: RootState) => state.channels.isFetching[isFetchingMembersKey(channelId)]) ?? false

  const numberOfFetchedMembers: number | undefined = fetchedMemberUuids?.length
  const numberOfChannelMembers: number = memberUuids.length

  useAsyncEffect(async () => {
    if (
      open === true &&
      numberOfFetchedMembers !== undefined &&
      numberOfFetchedMembers < numberOfChannelMembers
    ) {
      await dispatch(fetchMembers({
        channel_id: channelId,
        member_ids: memberUuids,
      }))
    }
  }, [open, numberOfFetchedMembers, numberOfChannelMembers, channelId])

  return {
    isLoading: numberOfFetchedMembers === 0,
    isFetching,
    members,
  }
}
