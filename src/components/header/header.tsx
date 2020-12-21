import * as React from 'react'

import globalidLogo from '../../../src/assets/icons/globalid_logo_small.svg'

import { Button } from '@material-ui/core'
import { redirectToSignUp, pushTo, getString } from '../../utils'
import { useStyles } from '.'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'

export const Header: React.FunctionComponent = () => {
  const history = useHistory()
  const classes = useStyles()
  const { headerButton, loginButton, registerButton, header, innerHeader } = classes

  return <header data-testid='header' className={header}>
    <div className={innerHeader}>
      <img src={globalidLogo} alt='GlobaliD small icon' />
      <div>
        <Button
          variant='outlined'
          color='primary'
          size='large'
          className={clsx(headerButton, registerButton)}
          onClick={redirectToSignUp}>
          {getString('join')}
        </Button>

        <Button
          variant='contained'
          color='primary'
          size='large'
          className={clsx(headerButton, loginButton)}
          onClick={() => pushTo(history, './app/login')}>
          {getString('connect')}
        </Button>
      </div>
    </div>
  </header>
}
