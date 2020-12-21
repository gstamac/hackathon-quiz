import React from 'react'
import { useStyles } from './styles'
import { AppBar, Toolbar } from '@material-ui/core'
import Logo from '../../assets/icons/globalid_small_logo_blue.svg'
import clsx from 'clsx'
import { useIsMobileOrTabletView } from '../global/helpers'

interface PageContentHeaderProps {
  title: string
  border: boolean
}

export const PageContentHeader: React.FC<PageContentHeaderProps> = (props: PageContentHeaderProps) => {
  const isMobileOrTablet: boolean = useIsMobileOrTabletView()
  const { titleHeader, titleLogo } = useStyles({ border: props.border })
  const { title }: PageContentHeaderProps = props

  return (
    <AppBar
      elevation={1}
      className={clsx({
        [titleHeader]: true,
      })}
      color='default'
      position='fixed'
    >
      <Toolbar>{isMobileOrTablet && <img className={titleLogo} src={Logo} alt={'logo'} />}{title}</Toolbar>
    </AppBar>
  )
}
