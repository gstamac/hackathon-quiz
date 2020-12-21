export interface ActionCardProps {
  action?: string
  image: JSX.Element
  onAction?: () => void
  subtitle: string
  title: string
  actionDisabled?: boolean
}
