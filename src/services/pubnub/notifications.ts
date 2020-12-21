import Pubnub from 'pubnub'
import * as PubSub from 'pubsub-js'
import { getSubscriptions } from '../api/messaging_api'
import {
  Subscription,
  SubscriptionsWithKey,
  Channel,
} from '@globalid/messaging-service-sdk'
import { NotificationAction, NotificationClientService, ServiceNotification } from './interfaces'
import { ChannelType } from '../../store/interfaces'

// eslint-disable-next-line no-restricted-syntax
export class NotificationService {

  private static NEW_MESSAGE_EVENT_TOPIC: string = 'NEW_MESSAGE_EVENT_TOPIC'

  private pubnub?: Pubnub
  private initialized: boolean = false

  private readonly pubnubListener: Pubnub.ListenerParameters = {
    message (messageEvent: Pubnub.MessageEvent): void {
      PubSub.publish(NotificationService.NEW_MESSAGE_EVENT_TOPIC, messageEvent)
    },
  }

  public async setup (): Promise<void> {
    if (this.initialized || this.pubnub !== undefined) {
      return
    }

    this.initialized = true

    let page: number = 1
    let response: SubscriptionsWithKey

    do {
      const res = await getSubscriptions({ page })

      response = res.data
      page += 1

      this.configureListener(res.data)
    } while (response.channels.length > 0)

    this.serviceEventListener()
  }

  private configureListener (subscriptions: SubscriptionsWithKey): void {
    this.setupPubnub(subscriptions.subscribe_key)
    this.subscribeToChannels(subscriptions)
  }

  private setupPubnub (subscribe_key: string): void {
    if (this.pubnub === undefined) {
      this.pubnub = new Pubnub({ subscribeKey: subscribe_key, ssl: true, restore: true })
      this.pubnub.addListener(this.pubnubListener)
    }
  }

  private subscribeToChannels (subscriptions: SubscriptionsWithKey): void {
    if (subscriptions.channels.length <= 0 || this.pubnub === undefined) {
      return
    }

    const aliases: string[] = subscriptions.channels.map((item: Subscription) => item.alias)

    this.pubnub.subscribe({
      channels: aliases,
      withPresence: false,
    })
  }

  private serviceEventListener (): void {
    this.subscribe((channel: string, notification: ServiceNotification) => {
      if (channel.startsWith(ChannelType.SERVICE) &&
      (notification.action === NotificationAction.NewChannelCreated ||
        notification.action === NotificationAction.ChannelUpdated)) {

        const updatedChannel: Channel = <Channel><unknown>notification.payload

        if (!updatedChannel.deleted){
          this.addChannel(updatedChannel)
        } else {
          this.removeChannel(updatedChannel)
        }
      }
    })
  }

  public subscribe (callback: (channel: string, notification: ServiceNotification) => void): string {
    return PubSub.subscribe(
      NotificationService.NEW_MESSAGE_EVENT_TOPIC,
      NotificationService.listener(callback),
    )
  }

  private addChannel (channel: Channel): void {
    if (this.pubnub === undefined) {
      return
    }

    this.pubnub.subscribe({
      channels: [channel.alias],
      withPresence: false,
    })
  }

  private removeChannel (channel: Channel): void {
    if (this.pubnub === undefined) {
      return
    }

    this.pubnub.unsubscribe({
      channels: [channel.alias],
    })
  }

  private static listener (callback: (channel: string, notification: ServiceNotification) => void): Function {
    return (topic: string, data: Pubnub.MessageEvent): void => {
      if (topic === NotificationService.NEW_MESSAGE_EVENT_TOPIC) {
        callback(data.channel, <ServiceNotification>data.message)
      }
    }
  }

  public unsubscribe (token: string): boolean {
    return PubSub.unsubscribe(token)
  }
}

export const initNotificationSdk = async (): Promise<NotificationClientService> => {

  const notificationService: NotificationService = new NotificationService()

  await notificationService.setup()

  return {

    subscribe (callback: (channel: string, notification: ServiceNotification) => void): string {
      return notificationService.subscribe(callback)
    },

    unsubscribe (token: string): boolean {
      return notificationService.unsubscribe(token)
    },
  }
}
