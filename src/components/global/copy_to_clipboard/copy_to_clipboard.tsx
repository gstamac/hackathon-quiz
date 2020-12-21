import * as React from 'react'
import { CopyToClipboardProps } from './interfaces'
import { CopyToClipboardButton } from './copy_to_clipboard_button'
import { CopyToClipboardMain, CopyToClipboardText } from './copy_to_clipboard.styled'

export const CopyToClipboard: React.FC<CopyToClipboardProps> = (props: CopyToClipboardProps) => (
  <CopyToClipboardMain>
    <CopyToClipboardText data-testid='copy_to_clipboard_text'>
      {props.text}
    </CopyToClipboardText>
    <CopyToClipboardButton className={props.className} text={props.text} onClick={props.onClick}/>
  </CopyToClipboardMain>
)
