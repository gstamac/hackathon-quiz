import React from 'react'
import { useStyles } from './styles'
import { GlobalidLoader } from './globalid_loader'
import globalidLogo from '../../../assets/icons/globalid_logo.svg'

export const LoadingSplashScreen: React.FC = () => {
  const classes = useStyles({})

  return <div className={classes.container} data-testid='loading-splash-screen'>
    <img src={globalidLogo} />
    <div className={classes.loadingContainer}>
      <GlobalidLoader />
    </div>
  </div>
}
