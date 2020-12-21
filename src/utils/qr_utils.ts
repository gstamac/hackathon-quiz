import {
  QR_CONTENT_URL,
  MARKETING_SITE_URL,
  GLOBALID_CARE_LINK,
} from './../constants'
import { QrCodeTexts, QrCodeUrls, IQROptions } from 'globalid-react-ui'

export const qrCodeTexts: QrCodeTexts = {
  qrRejectedText: 'Please try again later or contact support',
  qrErrorText: 'Something went wrong',
  qrResetText: 'Reset QR Code',
  qrBottomText: ['Scan to connect  ', 'or get the app'],
  qrExpiredText: 'QR code expired',
  qrTryAgainText: 'Try again',
  qrNeedHelpText: '',
  qrWelcomeBackText: 'Welcome back',
  qrTopText: 'Confirm this request on your GlobaliD app',
}

export const qrCodeUrls: QrCodeUrls = {
  baseQrContentUrl: QR_CONTENT_URL,
  globalIdAppUrl: MARKETING_SITE_URL,
  globalIdHelpUrl: GLOBALID_CARE_LINK,
}

const qrSize: number = 98

export const qrOptions: IQROptions = {
  width: qrSize,
  height: qrSize,
  codeHeight: qrSize,
  codeWidth: qrSize,
}
