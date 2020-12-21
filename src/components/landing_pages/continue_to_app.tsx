import React from 'react'
import { useStyles } from './styles'
import messagesBackgroundIcon from '../../assets/icons/messages-background.svg'
import { getString } from '../../utils'
import scanQrCodeIcon from '../../assets/icons/scan-qr-code.svg'

export const ContinueToApp: React.FC = () => {
  const classes = useStyles()
  const {
    contentWrapper,
    backgroundPicExtra,
    comingSoon,
    description,
    downloadArea,
    scanIcon,
  } = classes

  return (
    <div data-testid={'continue_to_app'} className={contentWrapper}>
      <img
        className={backgroundPicExtra}
        src={messagesBackgroundIcon}
        alt='Continue to app background icon'
      />
      <span className={comingSoon}>
        {getString('continue-to-app-title')}
      </span>
      <span className={description}>
        {getString('continue-to-app-description')}
      </span>
      <div className={downloadArea}>
        <img
          className={scanIcon}
          src={scanQrCodeIcon}
          alt='Scan to Download app'
        />
      </div>
    </div>
  )
}
