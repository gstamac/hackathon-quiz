import { DrawerProps } from '@material-ui/core/Drawer'

export interface BottomDrawerProps extends Omit<
  DrawerProps, 'anchor' | 'elevation' | 'onClose' | 'variant'
> {
  onClose?: () => void
  title?: string
}
