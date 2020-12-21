export interface GroupButton {
  label: string
  onClick: () => void
  isActiveClickEnabled?: boolean
  counter?: string
}

export interface ButtonGroupProps {
  buttons: GroupButton[]
  active: number
}
