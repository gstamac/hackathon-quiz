export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: string
  title: string
  description: JSX.Element | string
  smallText?: string
}
