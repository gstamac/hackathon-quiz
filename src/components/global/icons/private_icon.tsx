import React from 'react'

import private_icon from '../../../assets/icons/private-icon.svg'
import { usePrivateIconStyles } from './styles'
import { IconInterface } from './interfaces'

export const PrivateIcon = (props: IconInterface): JSX.Element => {
  const {
    privateIconHolder,
    privateIcon,
  } = usePrivateIconStyles({ size: props.size })

  return <div className={privateIconHolder}><img className={privateIcon} src={private_icon} alt='private icon'/></div>
}
