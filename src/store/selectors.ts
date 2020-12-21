import { isNil } from 'lodash'
import { deviceKeyManager } from './../init'
import { RootState } from 'RootType'
import { ChannelDeviceSecret, ChannelWithParticipants } from '@globalid/messaging-service-sdk'

export const getEncryptedChannelSecret
 = (channel_id: string, device_id?: string) => (state: RootState): string | undefined => {
   const channel: ChannelWithParticipants | undefined
    = <ChannelWithParticipants | undefined> state.channels.channels[channel_id]?.channel

   return getEncryptedChannelSecretFromChannel(device_id)(channel)
 }

export const getEncryptedChannelSecretFromChannel
 = (device_id?: string) => (channel: ChannelWithParticipants | undefined): string | undefined => {
   const primaryChannelSecret: string | undefined
   = channel?.secret?.encrypted_secret

   const deviceIdToBeSearched: string | undefined = device_id ?? deviceKeyManager.getDeviceId()

   if (deviceIdToBeSearched) {
     return (channel?.secrets)?.find(
       (secret: ChannelDeviceSecret) => secret.device_id === deviceIdToBeSearched
     )?.secret.encrypted_secret ?? primaryChannelSecret
   }

   return primaryChannelSecret
 }

export const areChannelSecretsPresent
 = (state: RootState) => (channelId: string): boolean =>
   !isNil(state.channels.channels[channelId]?.channel.secret)
 || ((state.channels.channels[channelId]?.channel.secrets?.length ?? 0) > 0)
