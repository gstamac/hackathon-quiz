import React from 'react'
import { ActionCardProps } from './interfaces'
import { useStyles } from './styles'
import clsx from 'clsx'

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  image,
  onAction,
  subtitle,
  title,
  actionDisabled,
}: ActionCardProps) => {
  const classes = useStyles()

  const actionClasses: string = clsx({
    [classes.actionCardLink] : true,
    [classes.hiddenMembersLink] : actionDisabled,
  })

  return (
    <div className={classes.actionCardRoot}>
      {image}
      <div className={classes.actionCardDetails}>
        <span className={classes.actionCardTitle}>
          {title}
        </span>
        <span className={classes.actionCardSubtitle}>
          {subtitle}
        </span>
        {action && <span className={actionClasses} onClick={actionDisabled ? undefined : onAction}>
          {action}
        </span>}
      </div>
    </div>
  )
}
