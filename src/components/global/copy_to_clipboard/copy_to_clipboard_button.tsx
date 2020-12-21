import React, { PropsWithChildren } from 'react'
import CopyToClipboardFunction from 'react-copy-to-clipboard'
import copyIcon from '../../../assets/icons/copy_icon.svg'
import largeCopyIcon from '../../../assets/icons/copy_icon_large.svg'
import { CopyToClipboardButtonProps } from './interfaces'
import { ButtonMain, ButtonIcon, ButtonContent } from './copy_to_clipboard_button.styled'

export const CopyToClipboardButton: React.FC<PropsWithChildren<CopyToClipboardButtonProps>> = (
  props: PropsWithChildren<CopyToClipboardButtonProps>
) => {
  const buttonIconSrc: string = props.large ? largeCopyIcon : copyIcon

  return (
    <ButtonMain className={props.className} data-testid='copy-button' onClick={ props.onClick }>
      <CopyToClipboardFunction text={ props.text }>
        <ButtonContent>
          <ButtonIcon src={buttonIconSrc} alt='copy icon' />
          {props.children && <div>{props.children}</div>}
        </ButtonContent>
      </CopyToClipboardFunction>
    </ButtonMain>
  )
}
