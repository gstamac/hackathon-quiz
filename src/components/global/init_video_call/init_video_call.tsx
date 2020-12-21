import clsx from 'clsx'
import React from 'react'
import { useGlobalStyles } from '../../../assets/styles'
import { getString } from '../../../utils'
import { ChannelIdProps } from '../../interfaces'
import { VideoCallIcon } from '../icons/video_call_icon'
import { Overlay } from '../overlay'
import { UseVideoCallResponse } from './interfaces'
import { useInitVideoCall } from './use_init_video_call'

export const InitVideoCall: React.FC<ChannelIdProps> = ({channelId}) => {
  const {
    initiateVideoCallCallback,
    isInitializingVideoCall,
  }: UseVideoCallResponse = useInitVideoCall({channelId})

  const classes = useGlobalStyles()

  return <>
    <div
      className={clsx(
        classes.iconWrapper,
        {
          [classes.disabled]: isInitializingVideoCall,
        })
      }
      data-testid='video-call-button'
      onClick={initiateVideoCallCallback}
    >
      {VideoCallIcon()}
    </div>
    <Overlay
      isOpen={isInitializingVideoCall}
      text={getString('connecting')}
    />
  </>
}
