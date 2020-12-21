import React from 'react'
import { StyledDialog } from '../styled_dialog'
import appQrCodeIconLink from '../../../../assets/icons/app-qr-code-icon.svg'
import shieldIconLink from '../../../../assets/icons/shield-icon.svg'
import singleUserIconLink from '../../../../assets/icons/single-user-icon.svg'
import phoneBigIconLink from '../../../../assets/icons/phone-big-icon.svg'
import multiChatIconLink from '../../../../assets/icons/multi-chat-icon.svg'
import { useStyles } from './style'
import { DialogProps } from '../interfaces'
import { BRANCH_IO_LINK } from '../../../../constants'
import { getString } from '../../../../utils'
import { useIsMobileView } from '../../helpers'

const handleClick = (): void => {
  window.open(BRANCH_IO_LINK, '_blank',)
}

export const GetAppDialog: React.FC<DialogProps> = ({
  open,
  handleOpenState,
}: DialogProps): JSX.Element => {
  const isMobile: boolean = useIsMobileView()

  const {
    getAppHeader,
    getAppSubHeader,
    appQrcode,
    getAppInstruction,
    header,
    infoItem,
    verticalLine,
    phoneIcon,
  } = useStyles()

  return (
    <>
      {isMobile && (
        <StyledDialog
          open={open}
          handleOpenState={handleOpenState}
          handleClick={handleClick}
          actionText='Get the app'
        >
          <div>
            <div className={header}>{getString('get-app-get-started')}</div>
            <div className={getAppHeader}>{getString('get-app-header')}</div>
            <div className={getAppSubHeader}>
              {getString('get-app-subheader')}
            </div>
            <div className={infoItem}>
              <img src={shieldIconLink} />
              <span>{getString('get-app-privacy')}</span>
            </div>
            <div className={verticalLine}/>
            <div className={infoItem}>
              <img src={singleUserIconLink} />
              <span>{getString('get-app-build')}</span>
            </div>
            <div className={verticalLine}/>
            <div className={infoItem}>
              <img src={multiChatIconLink} />
              <span>{getString('get-app-send')}</span>
            </div>
            <div className={phoneIcon}>
              <img src={phoneBigIconLink} />
            </div>
          </div>
        </StyledDialog>
      )}
      {!isMobile && (
        <StyledDialog
          open={open}
          handleOpenState={handleOpenState}
          name='get-app'
        >
          <div>
            <div>
              <div className={getAppHeader}>{getString('get-app-header')}</div>
              <div className={getAppSubHeader}>
                {getString('get-app-subheader')}
              </div>
              <div className={appQrcode}>
                <img src={appQrCodeIconLink} alt='App QR Code'></img>
              </div>
              <div className={getAppInstruction}>
                <div>{getString('get-app-scan')}</div>
                <div>{getString('get-app-download')}</div>
              </div>
            </div>
          </div>
        </StyledDialog>
      )}
    </>
  )
}
