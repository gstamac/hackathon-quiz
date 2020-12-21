import React from 'react'
import { useStyles } from '../../dialogs/styled_dialog/style'
import { appStores } from './constants'
import { AppstoresInterface } from './interfaces'

export const AppStoreButtons: React.FC = () => {
  const { appStoreLinks } = useStyles()

  return (
    <div className={appStoreLinks} data-testid='app-store-links'>
      {appStores.map(({ text, href, iconLink }: AppstoresInterface, i: number) => (
        <a href={href} key={i}>
          <img src={iconLink} alt={text} />
        </a>
      ))}
    </div>
  )
}
