import { APPLE_STORE_LINK, GOOGLE_STORE_LINK } from '../../../../constants'
import androidAppstoreIconLink from '../../../../assets/icons/android_appstore_btn.png'
import iosAppstoreIconLink from '../../../../assets/icons/ios_appstore_btn.png'
import { AppstoresInterface } from './interfaces'

export const appStores: AppstoresInterface[] = [
  {
    text: 'IOS appstore',
    href: APPLE_STORE_LINK,
    iconLink: iosAppstoreIconLink,
  },
  {
    text: 'Android appstore',
    href: GOOGLE_STORE_LINK,
    iconLink: androidAppstoreIconLink,
  },
]
