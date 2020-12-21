import React, { useState, useEffect } from 'react'
import { useStyles } from './styles'
import { ButtonGroupProps, GroupButton } from './interfaces'
import Button from '@material-ui/core/Button/Button'

export const ButtonGroup: React.FC<ButtonGroupProps> = (props: ButtonGroupProps) => {

  const classes = useStyles()
  const { buttonGroupWrapper, buttonText, buttonWrapperNonActive, buttonWrapperActive, counterText } = classes
  const [active, setActive] = useState<number>(props.active)

  const canHandleClick = (button: GroupButton, index: number): boolean => !(!button.isActiveClickEnabled && index === active)

  const handleClick = (onClickFunction: () => void, index: number): void => {
    onClickFunction()
    setActive(index)
  }

  const getClickHandler = (button: GroupButton, index: number): (() => void) | undefined => canHandleClick(button, index)
    ? () => handleClick(button.onClick, index)
    : undefined

  useEffect(() => {
    setActive(props.active)
  }, [props.active])

  return (
    <div data-testid={'button_group'} className={buttonGroupWrapper}>
      {props.buttons.map((button: GroupButton, index: number) => (
        <Button onClick={getClickHandler(button, index)} variant='text'
          className={(index === active) ? buttonWrapperActive : buttonWrapperNonActive} key={`group-button${index}`}>
          <span className={buttonText}>{button.label}</span>
          {button.counter && <span className={`${counterText} ${buttonText}`}>({button.counter})</span>}
        </Button>
      ))}
    </div>
  )
}
