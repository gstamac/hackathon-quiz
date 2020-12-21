import React from 'react'
import { useStyles } from './styles'
import notificationSentBackgroundIcon from '../../assets/icons/notification_sent.svg'
import { getString, setConsentUuid } from '../../utils'
import ReactHTMLParser from 'react-html-parser'
import messagesBackgroundIcon from '../../assets/icons/messages-background.svg'
import { PrimaryButton, ButtonState, setToastError, setToastSuccess } from 'globalid-react-ui'
import scanQrCodeIcon from '../../assets/icons/scan-qr-code.svg'
import { PublicIdentity } from '@globalid/identity-namespace-service-sdk'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from 'RootType'
import { IdentityResponse } from '@globalid/identity-namespace-service-types'
import { CreateDeviceResponse } from '@globalid/keystore-service-sdk'
import { Dispatch } from '@reduxjs/toolkit'
import { DeviceKeyPair } from '../../services/device_key_manager/interfaces'
import { createNewDevice } from '../../services/api/keystore_api'
import { E2eEncryptionProps } from './interfaces'
import { EncryptionStatus } from '../messages/interfaces'
import { deviceKeyManager } from '../../init'
import { statusMatcher } from '../messages/helpers'
import { SkeletonPage } from '.'
import clsx from 'clsx'

export const E2eEncryption: React.FC<E2eEncryptionProps> = ({ encryptionStatus, setEncryptionStatus }: E2eEncryptionProps) => {
  const classes = useStyles()
  const {
    contentWrapper,
    backgroundPicExtra,
    comingSoon,
    description,
    enableEncryptionButtonUpperMargin,
    buttonText,
    scanIcon,
    downloadArea,
    encryptionResend,
    enableEncryptionButtonWidth,
  } = classes

  const identity: PublicIdentity | undefined = useSelector((root: RootState) => root.identity.identity)
  const dispatcher: Dispatch = useDispatch()

  if (identity === undefined) {
    return null
  }

  const addNewDevice = async (): Promise<void> => {
    try {
      if (encryptionStatus !== EncryptionStatus.POLLING) {
        setEncryptionStatus(EncryptionStatus.PENDING)
      }
      const keyPair: DeviceKeyPair = await deviceKeyManager.generateKeyPair()

      const response: CreateDeviceResponse = await createNewDevice(keyPair.publicKey)

      setConsentUuid(response.consent_id)

      await deviceKeyManager.storeKey(response.device_id, keyPair.privateKey, keyPair.publicKey)

      setEncryptionStatus(EncryptionStatus.POLLING)
    } catch (error) {

      dispatcher(setToastError({
        title: getString('e2e-encryption-notification-toast-title'),
        message: getString('e2e-encryption-notification-toast-description'),
      }))

      setEncryptionStatus(EncryptionStatus.DISABLED)
    }
  }

  const resendRequestNotification = async (): Promise<void> => {
    await addNewDevice()

    dispatcher(setToastSuccess({
      title: getString('e2e-encryption-resend-toast-title'),
      message: getString('e2e-encryption-resend-toast-description'),
    }))
  }

  const requestSent = (): JSX.Element =>
    <div data-testid={'e2e_encryption_accepted'} className={contentWrapper}>
      <img
        className={backgroundPicExtra}
        src={notificationSentBackgroundIcon}
        alt='e2e_encryption_background'
      />
      <span className={comingSoon}>
        {getString('e2e-encryption-notification-title')}
      </span>
      <span className={description}>
        {getString('e2e-encryption-notification-description')}
      </span>
      <span className={description}>
        {ReactHTMLParser(getString('e2e-encryption-resend-request'))}
        <a onClick={resendRequestNotification} className={encryptionResend}>{getString('e2e-encryption-resend-request-action')}</a>.
      </span>
    </div>

  const enableEncryption = (): JSX.Element =>
    <div data-testid={'e2e_encryption_enable'} className={contentWrapper}>
      <img
        className={backgroundPicExtra}
        src={messagesBackgroundIcon}
        alt='e2e_encryption_enable'
      />
      <span className={comingSoon}>
        {getString('e2e-encryption-title')}
      </span>
      <span className={description}>
        {ReactHTMLParser(getString('e2e-encryption-description'))}
      </span>
      <div className={enableEncryptionButtonUpperMargin}>
        <PrimaryButton buttonState={ButtonState.DEFAULT} onClick={addNewDevice}><span className={clsx(buttonText, enableEncryptionButtonWidth)}>{getString('e2e-encryption-action')}</span></PrimaryButton>
      </div>
    </div>

  const upgradeAccount = (): JSX.Element =>
    <div data-testid={'e2e_encryption_upgrade'} className={contentWrapper}>
      <img
        className={backgroundPicExtra}
        src={messagesBackgroundIcon}
        alt='e2e_encryption_upgrade'
      />
      <span className={comingSoon}>
        {getString('e2e-encryption-wc-title')}
      </span>
      <span className={description}>
        {ReactHTMLParser(getString('e2e-encryption-wc-description'))}
      </span>
      <div className={downloadArea}>
        <img
          className={scanIcon}
          src={scanQrCodeIcon}
          alt='Scan to Download app'
        />
      </div>
    </div>

  if (identity.signup_type === IdentityResponse.IdentitySignupType.Localid && encryptionStatus === EncryptionStatus.DISABLED) {
    return upgradeAccount()
  }

  return statusMatcher(encryptionStatus, [EncryptionStatus.PENDING, EncryptionStatus.KEY_MANAGER_INITIALIZED]) ? <SkeletonPage/> : statusMatcher(encryptionStatus, [EncryptionStatus.POLLING]) ? requestSent() : enableEncryption()
}
