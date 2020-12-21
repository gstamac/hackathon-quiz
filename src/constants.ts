import { CryptoKeyFormat } from './interfaces'

export const HOME_PAGE_TITLE: string = 'GlobaliD: Identity for everyone. Everywhere.'

export const AV_ENABLED_GROUPS: string[] = process.env.REACT_APP_AV_ENABLED_GROUPS ? process.env.REACT_APP_AV_ENABLED_GROUPS.split(',') : []

export const RESET_STORE_ACTION: string = 'RESET_STORE'

export const API_BASE_URL: string = <string> process.env.REACT_APP_API_BASE_URL
export const WEB_CLIENT_BASE_URL: string = <string> process.env.REACT_APP_WEBCLIENT_BASE_URL
export const REDIRECT_URI: string = <string> process.env.REACT_APP_REDIRECT_URI
export const CLIENT_ID: string = <string> process.env.REACT_APP_CLIENT_ID
export const APP_PUBLIC_URL: string | undefined = process.env.PUBLIC_URL
export const QR_CONTENT_URL: string = <string>process.env.REACT_APP_QR_CONTENT_URL
export const GROUP_INVITE_BASE_URL: string = <string>process.env.REACT_APP_GROUP_INVITE_BASE_URL
export const GROUP_INVITE_SHORT_LINK_ID_PARAM: string = 'short_link_id'

export const SUPPORT_EMAIL_ADDRESS: string = 'support@global.id'
export const GLOBALID_CARE_LINK: string = ' https://care.global.id'

export const RESPONSE_TYPE_CODE: string = 'code'
export const SCOPE: string = 'public offline_access add_messaging_device'

export const PENDING_DEVICE_ID: string = 'PENDING_DEVICE_ID'

export const WEB_CLIENT_LOGIN_URL: string = `${WEB_CLIENT_BASE_URL}/`

export const MARKETING_SITE_URL: string = <string> process.env.REACT_APP_MARKETING_SITE_URL
export const JOINED: string = 'JOINED'

export const BRANCH_IO_LINK: string = <string> process.env.REACT_APP_BRANCH_IO_LINK

export const DEBOUNCE_DELAY: number = 250
export const META_PAGE: number = 0
export const META_PER_PAGE: number = 50

export const OPTIMIZED_SEARCH_PER_PAGE: number = 120

export const META_TOTAL: number = 0
export const CHANNELS_PER_PAGE: number = 20
export const MESSAGES_PER_PAGE: number = 50
// needed for jest DOM to properly render virtualized list
export const INITIAL_MESSAGES_COUNT: number | undefined = undefined

export const GROUP_MEMBERS_PER_PAGE: number = 20
export const GROUP_ROLE_MEMBERS_PER_PAGE: number = 20
export const FIRST_PAGE: number = 1

export const DATE_FORMAT_HOURS: string = 'hh:mm a'
export const DATE_FORMAT_WEEK_DAY_SHORT: string = 'EEE'
export const DATE_FORMAT_WEEK_DAY: string = 'EEEE'
export const DATE_FORMAT_MONTH: string = 'MMM dd'
export const DATE_FORMAT_YEAR: string = 'MMM dd, yyyy'
export const TIMESTAMP_FULL_DATE_FORMAT: string = 'MMMM do yyyy'
export const TIMESTAMP_DATE_FORMAT: string = 'MMMM do'
export const TIMESTAMP_TIME_FORMAT: string = 'hh:mm a'

export const YESTERDAY: string = 'yesterday'
export const NOW: string = 'now'
export const MINS: string = 'm'

export const MESSAGE_TIMESTAMP_15_MINUTES_LIMIT: number = 900000
export const UNREAD_MESSAGES_LIMIT: number = 99

export const RSA_KEY_SIZE: number = 4096
export const RSA_OAEP_ALGORITHM: string = 'RSA-OAEP'
export const AES_CBC_ALGORITHM: string = 'AES-CBC'
export const AES_CBC_LENGTH: number = 256
export const AES_CBC_ALGORITHM_WITH_LENGTH: string = `AES-${AES_CBC_LENGTH}-CBC`
export const AES_SECRET_SIZE: number = 32
export const SHA_256_HASH: string = 'SHA-256'
export const SHA_1_HASH: string = 'SHA-1'

export const UTF8_ENCODING: BufferEncoding = 'utf-8'
export const BASE64_ENCODING: BufferEncoding = 'base64'

export const HEX_LENGTH: number = 16

export const RAW_CRPYTO_KEY_FORMAT: CryptoKeyFormat = 'raw'
export const PKCS8_CRPYTO_KEY_FORMAT: CryptoKeyFormat = 'pkcs8'
export const SPKI_CRPYTO_KEY_FORMAT: CryptoKeyFormat = 'spki'

export const KEEP_POOLING_CONSENT_NOT_APPROVED_YET: string = 'KEEP_POOLING_CONSENT_NOT_APPROVED_YET'

export const APPLE_STORE_LINK: string = 'https://apps.apple.com/us/app/globalid-portable-identity/id1439340119'
export const GOOGLE_STORE_LINK: string = 'https://play.google.com/store/apps/details?id=net.globalid'

export const CONVERSATION_PARTICIPANTS_LIMIT: number = 36
export const PROFILE_IMAGE_SIZE_LIMIT: string = '15360'
export const PROFILE_IMAGE_SIZE: number = 400
export const IDENTITY_LIST_ITEM_SIZE: number = 70
export const MEMBER_LIST_ITEM_HEIGHT_SIZE: number = 70

export const MESSAGE_BOT_IDENTITY_UUID = '6022a28e-cf69-4dfd-8ddb-46668b5cb7a2'

export const HELP_PAGE_URL: string = 'https://care.global.id'
export const TOS_PAGE_URL: string = 'https://www.global.id/about/terms'
export const PRIVACY_PAGE_URL: string = 'https://www.global.id/about/privacy-policy'

export const BASE_MESSAGES_URL: string = '/app/messages'
export const BASE_GROUPS_URL: string = '/app/groups'
export const BASE_SETTINGS_URL: string = '/app/settings'
export const BASE_CONTACTS_URL: string = '/app/contacts'
export const BASE_WALLET_URL: string = '/app/wallet'

export const GROUPS_PER_PAGE: number = 20

export const IMAGE_PNG: string = 'image/png'
export const IMAGE_JPEG: string = 'image/jpeg'

export const MIN_IMAGE_SIZE_BYTES: number = 10000 // 10KB
export const MAX_IMAGE_RESOLUTION_WIDTH: number = 4000
export const MAX_IMAGE_RESOLUTION_HEIGHT: number = 4000

export enum NetworkError {
  ERR_CHANNEL_BLOCKED = 'ERR_CHANNEL_BLOCKED',
  ERR_UNAUTHORIZED = 'ERR_UNAUTHORIZED',
  DEFAULT = 'DEFAULT'
}

export const ERR_INVITATION_ALREADY_ACCEPTED: string = 'The invitation already accepted'
export const ERR_INVITATION_ALREADY_REJECTED: string = 'The invitation already rejected'
export const ERR_ATTESTEE_SAME_AS_ISSUER: string = 'ERR_ATTESTEE_SAME_AS_ISSUER'

export const GROUP_MEMBER_JOINED_DATE_FORMAT: string = 'yyyy/MM/dd'
export const FETCH_GROUP_MEMBERS: string = 'FETCH_GROUP_MEMBERS'
export const FETCH_GROUP_MEMBER_ROLES: string = 'FETCH_GROUP_MEMBER_ROLES'
export const REMOVE_GROUP_MEMBER_ROLE: string = 'REMOVE_GROUP_MEMBER_ROLE'
export const FETCH_GROUP_PERMISSIONS: string = 'FETCH_GROUP_PERMISSIONS'
export const FETCH_GROUP_ROLE_MEMBERS: string = 'FETCH_GROUP_ROLE_MEMBERS'
export const FETCH_ASSIGN_ROLES_TO_GROUP_MEMBER: string = 'ASSIGN_ROLES_TO_GROUP_MEMBER'
export const FETCH_UNASSIGN_ROLES_TO_GROUP_MEMBER: string = 'UNASSIGN_ROLES_TO_GROUP_MEMBER'
export const FETCH_VERIFICATION_TYPES: string = 'FETCH_VERIFICATION_TYPES'
export const FETCH_AGENCY_VERIFICATIONS: string = 'FETCH_AGENCY_VERIFICATIONS'
export const FETCH_VERIFICATION_CATEGORIES: string = 'FETCH_VERIFICATION_CATEGORIES'
export const FETCH_VERIFICATION_AGENCIES: string = 'FETCH_VERIFICATION_AGENCIES'
export const FETCH_LATEST_VERIFICATIONS: string = 'FETCH_LATEST_VERIFICATIONS'
export const CREATE_MEETING: string = 'CREATE_MEETING'
export const FETCH_MEETING: string = 'FETCH_MEETING'
export const FETCH_GROUP_VERIFICATION_CATEGORIES: string = 'FETCH_GROUP_VERIFICATION_CATEGORIES'

export const GROUP_MEMBERS_LIST_ITEM_HEIGHT: number = 65
export const GROUP_LIST_ITEM_HEIGHT: number = 80

export const GROUPS_PROFILE_PER_PAGE: number = 20

export const ACCESS_TOKEN_COOKIE_KEY: string = 'access_token'
export const REFRESH_TOKEN_COOKIE_KEY: string = 'refresh_token'
export const CODE_VERIFIER_COOKIE_KEY: string = 'code_verifier'
export const CODE_CHALLENGE_COOKIE_KEY: string = 'code_challenge'

export const CODE_CHALLENGE_METHOD: string = 'S256'

export const FETCH_CHANNEL_TIMEOUT: number = 1000

export const TIME_TILL_REDIRECT: number = 5000

export const ROLES_ENABLED: boolean = false

export enum KeyEvent {
  Down = 'Down',
  ArrowDown = 'ArrowDown',
  Up = 'Up',
  ArrowUp = 'ArrowUp',
  Enter = 'Enter',
}

export enum FormType {
  CREATE = 'create',
  EDIT = 'edit',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
export const emptyCallback: (props?: any) => void = () => {}

export const GROUP_ISSUED_VERIFICATION_AGENCY_UUID: string = '83a56ef3-f0ab-45da-b397-1005d6f38c6b'
export const GROUP_ISSUED_VERIFICATION_APP_UUID: string = '85442c4a-1f82-4a0b-9bd1-fc00d779a266'

export const SCROLL_DEBOUNCE_DELAY: number = 50

export const POST_MESSAGE_KEY: string = 'WEB_APP_PUBLIC_KEY'

export const LS_NOTIFICATIONS_DISABLED_KEY: string = 'notifications'
export const LS_NOTIFICATIONS_DISABLED_VALUE: string = 'disabled'
