import { FieldDefinition } from 'globalid-react-ui'
import { Identity } from '@globalid/identity-namespace-service-sdk'
export type ChannelIdProps = {
  channelId: string
}

export type IdentityProps = {
  identity: Identity
}

export type CustomFieldDefinition<T> = {
  [K in keyof T]: FieldDefinition[string];
}
