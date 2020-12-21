import { Drawer } from '@material-ui/core'
import clsx from 'clsx'
import React from 'react'
import backIcon from '../../../assets/icons/arrow_left_icon_black.svg'
import closeIcon from '../../../assets/icons/close_icon_grey.svg'
import { RightSidebarIconType, RightSidebarProps } from './interfaces'
import { useStyles } from './styles'

export const RightSidebar: React.FC<RightSidebarProps> = (props: RightSidebarProps): JSX.Element => {
  const classes = useStyles({ closeButton: props.closeSidebarIcon })
  const { paper, content, sidebarHeader, closeSidebarIconStyle, closeSidebarIconWrapperStyle, backIconStyle, backIconWrapperStyle, headerTitle } = classes
  const { title, open, children, onExit, className, closeSidebarIcon, closeSidebarAction} = props

  const exitSidebar = (): void => closeSidebarAction !== undefined
    ? closeSidebarAction()
    : onExit()

  const sidebarWithBackIcon = (): JSX.Element =>
    <>
      <div className={backIconWrapperStyle} onClick={exitSidebar}>
        <img alt={'back button'} src={backIcon} className={backIconStyle} />
      </div>
      <div className={headerTitle}>{title}</div>
    </>

  const sidebarWithCloseIcon = (): JSX.Element =>
    <>
      <div className={headerTitle}>{title}</div>
      <div className={closeSidebarIconWrapperStyle} onClick={exitSidebar}>
        <img alt={'close button'} src={closeIcon} className={closeSidebarIconStyle} />
      </div>
    </>

  return (<div>
    <Drawer
      role='drawer'
      anchor='right'
      open={open}
      classes={{
        paper: clsx(paper, className),
      }}
    >
      <div className={sidebarHeader}>
        {closeSidebarIcon === RightSidebarIconType.BACK
          ? sidebarWithBackIcon()
          : sidebarWithCloseIcon()
        }
      </div>
      <div className={content}>{children}</div>
    </Drawer>
  </div>)
}
