import { useEffect } from 'react'
import useAsyncEffect from 'use-async-effect'
import {
  client,
  initNotificationClient,
  subscribe,
  subscribeCallback,
  unsubscribe,
} from '../services/pubnub/notification_events'
import { UseInitPubnubEventsProps } from './interfaces'

export const useInitPubnubEvents = ({ isLoggedIn }: UseInitPubnubEventsProps): void => {
  useAsyncEffect(async () => {
    if (client === undefined && isLoggedIn) {
      await initNotificationClient()
      subscribe(subscribeCallback)
    }
  }, [isLoggedIn])

  useEffect(() => () => unsubscribe(), [])
}
