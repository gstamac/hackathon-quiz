import React from 'react'
import { InfoMessageCardProps } from './interfaces'
import { useInfoMessageStyles } from './styles'
import { Link } from 'react-router-dom'

export const InfoMessageCard: React.FC<InfoMessageCardProps> = ({
  icon,
  link,
  linkText,
  text,
}: InfoMessageCardProps) => {

  const classes = useInfoMessageStyles()

  return (
    <div className={`${classes.infoMessageContainer}`}>
      <div className={classes.infoMessageContent}>
        {icon && <img src={icon} alt='icon' className={classes.infoMessageIcon} />}
        <p className={classes.infoMessageText}>
          {text}
        </p>
        {link && <Link to={link} target='_blank' className={classes.infoMessageLink}>{linkText}</Link>}
      </div>
    </div>
  )
}
