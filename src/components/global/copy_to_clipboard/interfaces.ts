export interface CopyToClipboardProps {
  className?: string
  text: string
  onClick (): void
}

export interface CopyToClipboardButtonProps extends CopyToClipboardProps{
  large?: boolean
  buttonText?: string
  className?: string
}
