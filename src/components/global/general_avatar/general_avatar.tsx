import React, { useState } from 'react'
import { Avatar } from '@material-ui/core'
import useAsyncEffect from 'use-async-effect'
import { getAvatar } from '../../../services/api/avatar_api'
import { Skeleton } from '../../global/skeletons'
import { GeneralAvatarProps, AvatarVariant } from './interfaces'
import { CancelTokenSource } from 'axios'
import { getCancelTokenSource, executeCancellabeAxiosCallback } from '../../../utils'

export const GeneralAvatar: React.FC<GeneralAvatarProps> = (props: GeneralAvatarProps) => {
  const [imageUrl, setImageUrl] = useState<string | undefined | null>(props.image_url)

  const cancelTokenSource: CancelTokenSource = getCancelTokenSource()

  useAsyncEffect(async (isMounted: () => boolean) => {
    await executeCancellabeAxiosCallback(async () => {
      if (!props.image_url && props?.uuid !== undefined) {
        const avatar: string = await getAvatar(props.uuid, cancelTokenSource.token)

        if (isMounted()) {
          setImageUrl(avatar)
        }
      }
      else if (props.image_url) {
        setImageUrl(props.image_url)
      }
    })
  }, () => {
    cancelTokenSource.cancel()
  }, [props.image_url, props.uuid])

  const loading: boolean = imageUrl === null || imageUrl === undefined
  const skeletonVariant: AvatarVariant.Circle | undefined = props.variant === AvatarVariant.Circle ? AvatarVariant.Circle : undefined

  return (
    <Skeleton
      loading={loading} className={props.className}
      variant={skeletonVariant}>
      {imageUrl && <Avatar alt='avatar' className={props.className} variant={props.variant} src={imageUrl}/>}
    </Skeleton>
  )
}

