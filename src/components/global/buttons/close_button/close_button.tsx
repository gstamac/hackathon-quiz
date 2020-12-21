import React from 'react'
import { useStyles } from './styles'
import closeIconLink from '../../../../assets/icons/close-icon.svg'
import { CloseButtonProps } from './interfaces'
import clsx from 'clsx'

export const CloseButton: React.FC<CloseButtonProps> = ({
  handleClick,
  className,
}: CloseButtonProps) => {
  const classes = useStyles()
  const { closeButton } = classes

  return (
    <div className={clsx(closeButton, className)}>
      <img src={closeIconLink} onClick={handleClick} alt='close'></img>
    </div>
  )
}
