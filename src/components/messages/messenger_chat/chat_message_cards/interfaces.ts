import { useStyles } from './styles'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { MessageData, ChannelType } from '../../../../store/interfaces'
import {
  MessageTemplateText,
  MessageTemplateEncryptedText,
  MessageTemplateMedia,
  MediaAsset,
  EncryptedMediaAsset,
  MessageTemplateEncryptedMedia,
  FileToken,
  MessageEncryptionHeader, MessageTemplateMediaWithEncryptedText,
} from '@globalid/messaging-service-sdk'
import { MessageType } from '../interfaces'
import { GeneralObject } from '../../../../utils/interfaces'

export type MessageContent = MessageTemplateText | MessageTemplateEncryptedText | MessageTemplateMedia

export interface MessageDataParsed extends Omit<MessageData, 'parsedContent'> {
  parsedContent: string
}

export interface MessageContext<T = MessageData> {
  prevMessage: MessageData | null
  message: T
  nextMessage: MessageData | null
}

export interface ChatMessageHooksResponse {
  iAmAuthor: boolean
  deletedByMe: boolean
  displayName: JSX.Element | null
  avatar: JSX.Element | null
  messageContainerStyle: string
  timestamp: JSX.Element | null
  timestampString: string
  isLastMessage: boolean
}

export interface BaseMessageCardProps<T = MessageData> {
  messageContext: MessageContext<T>
  me: PublicIdentity
  author?: PublicIdentity
  admin?: string
  channelType: ChannelType
  seen: boolean
  hideOwner: boolean
  encryptedChannelSecret?: string
  isHiddenMember?: boolean
  hasOptions?: boolean
}

export interface TextMessageCardProps extends BaseMessageCardProps<MessageDataParsed> {
  encryptedChannelSecret?: string
}

export type UnsupportedMessageCardProps = BaseMessageCardProps

export interface ChatMessageHooksProps {
  messageContext: MessageContext<MessageData | MessageDataParsed>
  me: PublicIdentity
  author?: PublicIdentity
  admin?: string
  hideOwner: boolean
}

export interface InfoMessageCardProps {
  text: string
  icon?: string
  linkText?: string
  link?: string
}

export interface ChatBeginningCardProps {
  isEncrypted: boolean
  text: string
}

export interface GetMessageAdornmentParams {
  message: MessageData | MessageDataParsed
  channelType: ChannelType
  resending: boolean
  adornmentStyle: string
  isLastMessage: boolean
  seen: boolean
  onRetry?: () => Promise<void>
  errorMessage?: string
}

export interface TypingMessageCardProps {
  avatar: string
}

export enum MediaListViewType {
  Horizontal = 'HORIZONTAL',
  Vertical = 'VERTICAL',
  Grid = 'GRID'
}

export interface GetImageWrapperStylesParams {
  classes: MessageCardStylesType
  imageLink: string | undefined
  hasLoaded: boolean
  hasErrored: boolean
  isLoading: boolean
  isMessageMine: boolean
  index: number
  numberOfImages: number
  hasText: boolean
}

export interface ImageCornerStyles {
  topRight?: boolean
  topLeft?: boolean
  bottomRight?: boolean
  bottomLeft?: boolean
}

export interface ImageDisplayWrapperProps {
  imageMessageContent: string
  imageGridContainer: string
  imageContainer: string
  imageLoadingContent: string
  imageSrc?: string
  background: string
  circularProgress: string
  relative: string
  imageStyling: string
  infoIconForeground: string
  warningIcon: string
  placeholderBackground: string
}

export interface ImageComponentState {
  showError: boolean
  showLoading: boolean
  showImage: boolean
}

export interface GetImagesFromMediaAssetsProps {
  mediaAssets: MediaAssets
  imageComponentStates: ImageComponentStates
  isLoadingError: boolean
  onRetrySend: () => Promise<void>
  onRetry: (assetUuid: string) => Promise<void>
  isSending: boolean
  downloadLoadedHandling: (assetUuid: string) => void | null
  downloadErrorHandling: (assetUuid: string) => void
  handleOnClickFullImageOpen: (assetUuid: string) => Promise<void>
}

export interface ImageMessageCardComponentProps extends GetImagesFromMediaAssetsProps {
  text?: string
  containerStyle: string
  gridStyle: string
  textStyle: string
}

export interface UseImageMessageCardHooksProps {
  message: MessageData
  isMessageMine: boolean
  type: MessageMediaType
  encryptedChannelSecret?: string
  renderAvatar?: boolean
}

export type MessageMediaType = Extract<
  MessageType,
  MessageType.MEDIA | MessageType.ENCRYPTED_MEDIA | MessageType.MEDIA_WITH_TEXT | MessageType.MEDIA_WITH_ENCRYPTED_TEXT
>

export interface MediaAssetParsedData {
  index: number
  text?: string
  imageState: ImageState
  imageSrc?: string
  styleWrapperProps?: ImageDisplayWrapperProps
  mediaAsset?: MediaAsset
  encryptedMediaAsset?: EncryptedMediaAsset
}

export type CommonImageMediaType = MessageTemplateMedia
  | MessageTemplateEncryptedMedia
  | MessageTemplateMediaWithEncryptedText

export interface ImageMessageContentTemplate {
  text?: string
  assets: MediaAssetTemplate[]
}

export interface MediaAssetTemplate {
  uuid: string
  thumbnail: string
}

export type ImageComponentStates = GeneralObject<ImageComponentState | undefined>

export type MediaAssets = GeneralObject<MediaAssetParsedData | undefined>

export enum ImageState {
  SENDING = 'SENDING',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

export interface AssetWithIndex {
  asset: MediaAsset | EncryptedMediaAsset
  index: number
}

export interface Dimensions<T = number> {
  height: T
  width: T
}

export interface GetMediaByTypeParams extends UseImageMessageCardHooksProps {
  hasText: boolean
  isTextEncrypted: boolean
  isMediaEncrypted: boolean
  mediaAssets: MediaAssets
  encryptedChannelSecret?: string
  replaceMediaAssets: (params: ReplaceMediaAssetsParams) => void
  setMediaData: (params: SetMediaDataParams) => void
  renderAvatar?: boolean
}

export interface SetMediaDataParams {
  assetUuid: string
  imageSrc?: string
  imageState?: ImageState
  styleWrapperProps?: ImageDisplayWrapperProps
  mediaAsset?: MediaAsset
  encryptedMediaAsset?: EncryptedMediaAsset
  index: number
}

export interface ReplaceMediaAssetsParams {
  oldAssetUuid: string
  newAssetUuid: string
}

export interface SetMediaStateParams {
  assetUuid: string
  imageState: ImageState
  styleWrapperProps?: ImageDisplayWrapperProps
  index: number
}

export interface UseImageMessageCardHooksResponse {
  classes: MessageCardStylesType
  adornmentProps: ImageMessageCardAdornmentProps
  componentProps: ImageMessageCardComponentProps
}

export interface ImageMessageCardAdornmentProps {
  resending: boolean
  errorMessage: string | undefined
  onAdornmentClick: () => Promise<void>
}

export interface MessageStateHookResult {
  resendingMessage: boolean
  showUserSettingsIcon: () => void
  hideUserSettingsIcon: () => void
  optionsIcon: JSX.Element | null
  resendingCircularProgress: JSX.Element | null
  resendMessage: (() => Promise<void>) | undefined
  quickMenu: JSX.Element | null
  deleteMessageDialog: JSX.Element | null
}

export type MessageCardStylesType = ReturnType<typeof useStyles>

export interface GetDownloadImageHandlerParams {
  classes: MessageCardStylesType
  fileToken: FileToken | undefined
  setMediaData: (params: SetMediaDataParams) => void
  isMediaEncrypted: boolean
  numberOfImages: number
  encryptedChannelSecret: string | undefined
  encryptionHeader: MessageEncryptionHeader | undefined
  text: string | undefined
  isMessageMine: boolean
}
