import { ButtonTypes, CardViewButtonProps, PrimaryButtonProps } from './interfaces'
import { ButtonState, PrimaryButton } from 'globalid-react-ui'
import ArrowRightIcon from '../../../../../assets/icons/arrow_right_icon.svg'
import React from 'react'
import { Button } from '@material-ui/core'

export const CardViewPrimaryButton: React.FC<CardViewButtonProps> =
  ({ button, buttonElementsState, onClick, classes }: CardViewButtonProps) => {

    const buttonProps: PrimaryButtonProps = {
      text: buttonElementsState.PRIMARY === ButtonState.INPROGRESS ? '' : button.title,
      endIcon: buttonElementsState.PRIMARY === ButtonState.INPROGRESS ||  buttonElementsState.PRIMARY === ButtonState.DISABLED ? '' :
        <img src={ArrowRightIcon} alt={'arrow-right'}/>,
      className: buttonElementsState.PRIMARY === ButtonState.INPROGRESS 
      ? classes.primaryButtonInProgress 
      : buttonElementsState.PRIMARY === ButtonState.DISABLED 
        ? classes.primaryButtonDisabled
        : classes.primaryButton,
    }

    return (
      <PrimaryButton
        key={ButtonTypes.PRIMARY}
        buttonState={buttonElementsState.PRIMARY}
        onClick={() => onClick(button)}
        {...buttonProps}
      />
    )
  }

  export const CardViewAdditionalButton: React.FC<CardViewButtonProps> =
  ({ button, buttonElementsState, onClick, classes }: CardViewButtonProps) => {

    const buttonProps: PrimaryButtonProps = {
      text: buttonElementsState.ADDITIONAL === ButtonState.INPROGRESS ? '' : button.title,
      endIcon: buttonElementsState.PRIMARY === ButtonState.INPROGRESS ||  buttonElementsState.PRIMARY === ButtonState.DISABLED ? '' :
        <img src={ArrowRightIcon} alt={'arrow-right'}/>,
      className: buttonElementsState.PRIMARY === ButtonState.INPROGRESS 
      ? classes.primaryButtonInProgress 
      : buttonElementsState.PRIMARY === ButtonState.DISABLED 
        ? classes.primaryButtonDisabled
        : classes.primaryButton,
    }

    return (
      <PrimaryButton
        text={button.title}
        endIcon={<img src={ArrowRightIcon} alt={'arrow-right'}/>}
        className={classes.primaryButton}
        key={ButtonTypes.ADDITIONAL}
        buttonState={buttonElementsState.ADDITIONAL}
        onClick={() => onClick(button)}
      />
    )
  }

export const CardViewSecondaryButton: React.FC<CardViewButtonProps> = ({button, onClick, classes, buttonElementsState}: CardViewButtonProps) => (
  <Button
    variant='contained'
    color='secondary'
    disabled={buttonElementsState.SECONDARY === ButtonState.DISABLED}
    className={buttonElementsState.SECONDARY === ButtonState.DISABLED ? classes.secondaryButtonDisabled: classes.secondaryButton }
    onClick={() => onClick(button)}
  >
    {button.title}
  </Button>
)
