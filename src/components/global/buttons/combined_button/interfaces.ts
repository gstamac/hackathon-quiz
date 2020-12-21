export interface CombinedButtonProps {
  handleClick: () => void
  icon: string
  title: string
  mobileViewContent: MobileViewContent
  active?: boolean
  className?: string
}

export enum MobileViewContent {
  COMBINED = 'combined',
  TEXT = 'text',
  ICON = 'icon',
}
