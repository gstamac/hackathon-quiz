import React from 'react'
import { useStyles } from './styles'
import walletBackgroundIcon from '../../assets/icons/wallet_background.svg'
import { getString } from '../../utils'
import clsx from 'clsx'

export const Wallet: React.FC = () => {
  const classes = useStyles()
  const {
    contentWrapper,
    backgroundPic,
    comingSoon,
    description,
    walletDescriptionBottomPadding,
  } = classes

  return (
    <div className={contentWrapper}>
      <img
        className={backgroundPic}
        src={walletBackgroundIcon}
        alt='Wallet background icon'
      />
      <span className={comingSoon}>
        {getString('wallet-coming-soon')}
      </span>
      <span className={clsx(description, walletDescriptionBottomPadding)}>
        {getString('wallet-description')}
      </span>
    </div>
  )
}
